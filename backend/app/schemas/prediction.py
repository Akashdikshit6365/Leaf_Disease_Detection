"""Pydantic response schemas for the prediction pipeline."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ActionPlan(BaseModel):
    """Structured farmer-facing guidance returned with a diagnosis."""

    cause: str = ""
    impact: str = ""
    treatment: str = ""
    prevention: str = ""
    urgency: str = ""
    next_steps: list[str] = Field(default_factory=list)


class PredictionResponse(BaseModel):
    """Returned by `POST /api/predict`."""
    model_config = ConfigDict(protected_namespaces=())

    id: str
    plant: str
    disease: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    image_url: str
    heatmap_url: str
    explanation: str | None = None
    action_plan: ActionPlan = Field(default_factory=ActionPlan)
    status: Literal["confirmed", "uncertain"]
    predicted_label: str
    model_version: str
    severity: str | None = None
    visible_symptoms: list[str] = Field(default_factory=list)
    retake_recommended: bool = False
    quality_issues: list[str] = Field(default_factory=list)
    created_at: datetime


class PredictionRecord(BaseModel):
    """Row from the history endpoint."""

    id: str
    plant: str = ""
    disease: str
    confidence: float
    image_url: str
    heatmap_url: str
    severity: str | None = None
    visible_symptoms: list[str] = Field(default_factory=list)
    retake_recommended: bool = False
    quality_issues: list[str] = Field(default_factory=list)
    model_version: str = ""
    source: str = ""
    created_at: datetime
