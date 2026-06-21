"""`POST /api/predict` - image to disease + heatmap + stored record."""
from __future__ import annotations

import io
import json
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.prediction import PredictionResponse
from app.services.auth_service import get_current_user
from app.services import cloudinary_service, db_service, gemini_service
from app.services.image_quality_service import assess_image
from app.services.model_service import model_service


logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict(
    file: UploadFile = File(..., description="Leaf image (JPG / PNG / WEBP, <=10 MB)"),
    user: dict = Depends(get_current_user),
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
    retake_recommended = quality.retake_recommended

    try:
        diagnosis = gemini_service.diagnose_leaf(image)
    except Exception as exc:
        logger.exception("Gemini diagnosis failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Gemini diagnosis failed: {exc}") from exc

    plant = diagnosis["plant"]
    disease = diagnosis["disease"]
    final_confidence = float(diagnosis["confidence"])
    status_label = "uncertain" if diagnosis["uncertain"] else "confirmed"
    predicted_label = f"{plant} - {disease}"

    # Previous Groq vision fallback kept for reference only. Groq remains active for
    # chat/explanation routes, but it no longer overrides image diagnosis.
    # if is_classifier_uncertain:
    #     fallback_result = predictor.diagnose_uncertain(raw)
    #     ...

    # Re-encode uploaded image to a normalised PNG for storage consistency.
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    original_png = buffer.getvalue()

    # ---------- upload ----------
    try:
        image_url = cloudinary_service.upload_bytes(original_png, folder="images")
        heatmap_url = ""
    except Exception as exc:
        logger.exception("Storage upload failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage upload failed: {exc}") from exc

    # ---------- persist ----------
    record = db_service.create_prediction(
        user_id=user["id"],
        image_url=image_url,
        heatmap_url=heatmap_url,
        plant=plant,
        disease=disease,
        confidence=final_confidence,
        severity=diagnosis.get("severity"),
        visible_symptoms=diagnosis.get("visible_symptoms") or [],
        retake_recommended=retake_recommended,
        quality_issues=quality.issues,
        model_version=settings.gemini_vision_model,
        source=diagnosis.get("source") or "gemini",
    )

    # ---------- optional LLM explanation ----------
    explanation: str | None = diagnosis.get("explanation")
    action_plan = diagnosis.get("action_plan") or {}

    logger.info(
        "prediction_audit %s",
        json.dumps(
            {
                "event": "prediction.completed",
                "model_name": model_service.metadata.model_name,
                "model_version": model_service.metadata.model_version,
                "timestamp": record["created_at"].isoformat(),
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
                    "predicted_label": predicted_label,
                    "returned_label": disease,
                    "confidence": round(final_confidence, 4),
                    "returned_confidence": round(final_confidence, 4),
                    "source": diagnosis.get("source"),
                    "severity": diagnosis.get("severity"),
                    "visible_symptoms": diagnosis.get("visible_symptoms"),
                    "retake_recommended": retake_recommended,
                },
                "quality_issues": quality.issues,
            },
            sort_keys=True,
        ),
    )

    return PredictionResponse(
        id=record["id"],
        plant=plant,
        disease=record["disease"],
        confidence=float(record["confidence"]),
        image_url=record["image_url"],
        heatmap_url=record["heatmap_url"],
        status=status_label,
        predicted_label=predicted_label,
        model_version=settings.gemini_vision_model,
        severity=diagnosis.get("severity"),
        visible_symptoms=diagnosis.get("visible_symptoms") or [],
        retake_recommended=retake_recommended,
        quality_issues=quality.issues,
        created_at=record["created_at"],
        explanation=explanation,
        action_plan=action_plan,
    )


@router.post("/scan/")
async def scan_plant(
    file: UploadFile = File(..., description="Leaf image for 2-stage diagnosis"),
    _: dict = Depends(get_current_user),
) -> dict:
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
        image = model_service.load_image(raw)
        return gemini_service.diagnose_leaf(image)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except Exception as exc:
        logger.exception("Plant scan failed")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Plant scan failed: {exc}") from exc
