"""Database access layer for user-scoped prediction records."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.core.database import get_database


def _serialize_prediction(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["_id"]),
        "user_id": row["user_id"],
        "plant": row.get("plant", ""),
        "disease": row["disease"],
        "confidence": float(row["confidence"]),
        "image_url": row["image_url"],
        "heatmap_url": row.get("heatmap_url", ""),
        "severity": row.get("severity"),
        "visible_symptoms": row.get("visible_symptoms", []),
        "retake_recommended": bool(row.get("retake_recommended", False)),
        "quality_issues": row.get("quality_issues", []),
        "model_version": row.get("model_version", ""),
        "source": row.get("source", ""),
        "created_at": row["created_at"],
    }


def create_prediction(
    *,
    user_id: str,
    image_url: str,
    heatmap_url: str,
    plant: str,
    disease: str,
    confidence: float,
    severity: str | None = None,
    visible_symptoms: list[str] | None = None,
    retake_recommended: bool = False,
    quality_issues: list[str] | None = None,
    model_version: str = "",
    source: str = "",
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    row = {
        "user_id": user_id,
        "image_url": image_url,
        "heatmap_url": heatmap_url,
        "plant": plant,
        "disease": disease,
        "confidence": round(float(confidence), 4),
        "severity": severity,
        "visible_symptoms": visible_symptoms or [],
        "retake_recommended": retake_recommended,
        "quality_issues": quality_issues or [],
        "model_version": model_version,
        "source": source,
        "created_at": now,
    }
    result = get_database().predictions.insert_one(row)
    row["_id"] = result.inserted_id
    return _serialize_prediction(row)


def list_predictions(*, user_id: str, limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    cursor = (
        get_database()
        .predictions
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    return [_serialize_prediction(row) for row in cursor]


def get_prediction(*, user_id: str, pred_id: str) -> dict[str, Any] | None:
    if not ObjectId.is_valid(pred_id):
        return None
    row = get_database().predictions.find_one({"_id": ObjectId(pred_id), "user_id": user_id})
    return _serialize_prediction(row) if row else None


def delete_prediction(*, user_id: str, pred_id: str) -> dict[str, Any] | None:
    row = get_prediction(user_id=user_id, pred_id=pred_id)
    if row is None:
        return None

    get_database().predictions.delete_one({"_id": ObjectId(pred_id), "user_id": user_id})
    return row
