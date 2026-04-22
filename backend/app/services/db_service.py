"""Database access layer for predictions."""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prediction import Prediction


def create_prediction(
    db: Session,
    *,
    image_url: str,
    heatmap_url: str,
    disease: str,
    confidence: float,
) -> Prediction:
    row = Prediction(
        image_url=image_url,
        heatmap_url=heatmap_url,
        disease=disease,
        confidence=Decimal(f"{confidence:.4f}"),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_predictions(db: Session, *, limit: int = 50, offset: int = 0) -> list[Prediction]:
    stmt = (
        select(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(stmt).all())


def get_prediction(db: Session, pred_id: int) -> Prediction | None:
    return db.get(Prediction, pred_id)


def delete_prediction(db: Session, pred_id: int) -> Prediction | None:
    row = db.get(Prediction, pred_id)
    if row is None:
        return None

    db.delete(row)
    db.commit()
    return row
