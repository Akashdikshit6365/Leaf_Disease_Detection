"""`POST /api/predict` - image to disease + heatmap + stored record."""
from __future__ import annotations

import io
import json
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.schemas.prediction import PredictionResponse
from app.services import cloudinary_service, db_service, groq_service
from app.services.heatmap_service import generate_heatmap
from app.services.image_quality_service import assess_image
from app.services.model_service import model_service
from ml_model.predictor import predictor


logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict(
    file: UploadFile = File(..., description="Leaf image (JPG / PNG / WEBP, <=10 MB)"),
    db: Session = Depends(get_db),
) -> PredictionResponse:
    # ---------- validate ----------
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported content-type: {file.content_type}",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty upload.")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image exceeds 10 MB.")

    # ---------- inference ----------
    try:
        image = model_service.load_image(raw)
    except Exception as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid image: {exc}") from exc

    quality = assess_image(image)
    if quality.retake_recommended:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            {
                "message": "Retake the image before diagnosis.",
                "quality_issues": quality.issues,
                "retake_recommended": True,
            },
        )

    prediction, input_tensor = model_service.predict(image)
    heatmap_png = generate_heatmap(image, input_tensor, prediction.class_index)
    status_label = "confirmed"
    retake_recommended = False
    disease = prediction.label
    if (
        prediction.confidence < settings.model_confidence_threshold or
        prediction.confidence_margin < settings.model_confidence_margin_threshold
    ):
        status_label = "uncertain"
        disease = "Uncertain Diagnosis"

    # Re-encode uploaded image to a normalised PNG for storage consistency.
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    original_png = buffer.getvalue()

    # ---------- upload ----------
    try:
        image_url = cloudinary_service.upload_bytes(original_png, folder="images")
        heatmap_url = cloudinary_service.upload_bytes(heatmap_png, folder="heatmaps")
    except Exception as exc:
        logger.exception("Storage upload failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage upload failed: {exc}") from exc

    # ---------- persist ----------
    record = db_service.create_prediction(
        db,
        image_url=image_url,
        heatmap_url=heatmap_url,
        disease=disease,
        confidence=prediction.confidence,
    )

    # ---------- optional LLM explanation ----------
    explanation: str | None = None
    if status_label == "confirmed":
        try:
            explanation = groq_service.explain_disease(prediction.label)
        except Exception as exc:  # non-fatal
            logger.warning("Groq explanation failed: %s", exc)

    logger.info(
        "prediction_audit %s",
        json.dumps(
            {
                "event": "prediction.completed",
                "model_name": model_service.metadata.model_name,
                "model_version": model_service.metadata.model_version,
                "timestamp": record.created_at.isoformat(),
                "filename": file.filename,
                "content_type": file.content_type,
                "image": {
                    "width": quality.width,
                    "height": quality.height,
                    "brightness": round(quality.brightness, 4),
                    "blur_score": round(quality.blur_score, 4),
                    "plant_coverage": round(quality.plant_coverage, 4),
                    "center_coverage": round(quality.center_coverage, 4),
                    "bytes": len(raw),
                },
                "prediction": {
                    "status": status_label,
                    "predicted_label": prediction.label,
                    "returned_label": disease,
                    "confidence": round(prediction.confidence, 4),
                    "runner_up_label": prediction.second_label,
                    "runner_up_confidence": round(prediction.second_confidence, 4),
                    "confidence_margin": round(prediction.confidence_margin, 4),
                    "retake_recommended": retake_recommended,
                },
                "quality_issues": quality.issues,
            },
            sort_keys=True,
        ),
    )

    return PredictionResponse(
        id=record.id,
        disease=record.disease,
        confidence=float(record.confidence),
        image_url=record.image_url,
        heatmap_url=record.heatmap_url,
        status=status_label,
        predicted_label=prediction.label,
        model_version=model_service.metadata.model_version,
        retake_recommended=retake_recommended,
        quality_issues=quality.issues,
        created_at=record.created_at,
        explanation=explanation,
    )


@router.post("/scan/")
async def scan_plant(file: UploadFile = File(..., description="Leaf image for 2-stage diagnosis")) -> dict:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Unsupported content-type: {file.content_type}",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty upload.")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Image exceeds 10 MB.")

    try:
        return predictor.predict(raw)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except Exception as exc:
        logger.exception("Plant scan failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Plant scan failed: {exc}") from exc
