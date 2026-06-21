"""History endpoint — returns recent predictions."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.schemas.prediction import PredictionRecord
from app.services.auth_service import get_current_user
from app.services import cloudinary_service, db_service


router = APIRouter()


@router.get("/history", response_model=list[PredictionRecord])
def list_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
) -> list[PredictionRecord]:
    rows = db_service.list_predictions(user_id=user["id"], limit=limit, offset=offset)
    return [PredictionRecord(**row) for row in rows]


@router.get("/history/{pred_id}", response_model=PredictionRecord)
def get_one(pred_id: str, user: dict = Depends(get_current_user)) -> PredictionRecord:
    row = db_service.get_prediction(user_id=user["id"], pred_id=pred_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prediction not found")
    return PredictionRecord(**row)


@router.delete("/history/{pred_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_one(pred_id: str, user: dict = Depends(get_current_user)) -> Response:
    row = db_service.delete_prediction(user_id=user["id"], pred_id=pred_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prediction not found")

    cloudinary_service.delete_public_url(row["image_url"])
    cloudinary_service.delete_public_url(row["heatmap_url"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)
