"""History endpoint — returns recent predictions."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.prediction import PredictionRecord
from app.services import cloudinary_service, db_service


router = APIRouter()


@router.get("/history", response_model=list[PredictionRecord])
def list_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[PredictionRecord]:
    rows = db_service.list_predictions(db, limit=limit, offset=offset)
    return [PredictionRecord.model_validate(row) for row in rows]


@router.get("/history/{pred_id}", response_model=PredictionRecord)
def get_one(pred_id: int, db: Session = Depends(get_db)) -> PredictionRecord:
    row = db_service.get_prediction(db, pred_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prediction not found")
    return PredictionRecord.model_validate(row)


@router.delete("/history/{pred_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_one(pred_id: int, db: Session = Depends(get_db)) -> Response:
    row = db_service.delete_prediction(db, pred_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prediction not found")

    cloudinary_service.delete_public_url(row.image_url)
    cloudinary_service.delete_public_url(row.heatmap_url)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
