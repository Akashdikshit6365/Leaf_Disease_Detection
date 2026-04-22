"""Pydantic response schemas for the prediction pipeline."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionResponse(BaseModel):
    """Returned by `POST /api/predict`."""
    id: int
    disease: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    image_url: str
    heatmap_url: str
    explanation: str | None = None
    status: Literal["confirmed", "uncertain"]
    predicted_label: str
    model_version: str
    retake_recommended: bool = False
    quality_issues: list[str] = Field(default_factory=list)
    created_at: datetime


class PredictionRecord(BaseModel):
    """Row from the history endpoint."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    disease: str
    confidence: float
    image_url: str
    heatmap_url: str
    created_at: datetime
