"""Gemini vision diagnosis for leaf scans."""
from __future__ import annotations

import base64
import io
import json
import logging
import re
from typing import Any

import requests
from PIL import Image

from app.core.config import settings


logger = logging.getLogger(__name__)

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent"
)


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise
        payload = json.loads(match.group(0))

    if not isinstance(payload, dict):
        raise ValueError("Gemini diagnosis response JSON must be an object.")
    return payload


def _clean_string(value: Any, fallback: str = "") -> str:
    text = str(value or "").strip()
    return text if text else fallback


def _clean_confidence(value: Any) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, confidence))


def _normalise_steps(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:3]


def diagnose_leaf(image: Image.Image) -> dict[str, Any]:
    """Diagnose a leaf image with Gemini and return normalized app data."""
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    prompt = (
        "You are a careful plant pathologist for a farmer-facing leaf diagnosis app. "
        "Analyze the uploaded leaf image. Identify the plant/tree/crop if possible, diagnose the most likely visible disease or healthy state, "
        "and be honest when the image is unclear or symptoms are not enough. "
        "Do not force a diagnosis. If uncertain, set uncertain=true and use disease='Uncertain Diagnosis'. "
        "Return ONLY valid JSON with exactly these keys: "
        "plant, disease, confidence, severity, uncertain, visible_symptoms, cause, impact, treatment, prevention, urgency, next_steps. "
        "confidence must be 0.0 to 1.0. severity must be Low, Medium, High, Healthy, or N/A. "
        "visible_symptoms must be an array of short strings. next_steps must be exactly 3 short farmer actions. "
        "Keep treatment practical and avoid recommending dangerous chemical dosages."
    )

    response = requests.post(
        GEMINI_API_URL.format(model=settings.gemini_vision_model),
        params={"key": settings.gemini_api_key},
        json={
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": img_base64,
                            }
                        },
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 900,
                "responseMimeType": "application/json",
            },
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    payload = _extract_json_object(text)

    confidence = _clean_confidence(payload.get("confidence"))
    uncertain = bool(payload.get("uncertain")) or confidence < 0.45
    disease = _clean_string(payload.get("disease"), "Uncertain Diagnosis")
    if uncertain:
        disease = "Uncertain Diagnosis"

    action_plan = {
        "cause": _clean_string(payload.get("cause"), "The image does not provide enough evidence for a confident diagnosis."),
        "impact": _clean_string(payload.get("impact"), "Avoid strong treatment decisions from this scan alone."),
        "treatment": _clean_string(payload.get("treatment"), "Retake a clear close photo and inspect nearby leaves before treatment."),
        "prevention": _clean_string(payload.get("prevention"), "Keep leaves dry, improve airflow, and remove badly damaged leaves."),
        "urgency": _clean_string(payload.get("urgency"), "Review before treatment."),
        "next_steps": _normalise_steps(payload.get("next_steps")) or [
            "Retake one clear close photo of a single leaf.",
            "Check nearby leaves for the same symptom pattern.",
            "Ask a local agriculture expert if symptoms are spreading.",
        ],
    }

    return {
        "source": "gemini",
        "plant": _clean_string(payload.get("plant"), "Unknown plant"),
        "disease": disease,
        "confidence": confidence,
        "severity": _clean_string(payload.get("severity"), "N/A"),
        "uncertain": uncertain,
        "visible_symptoms": _normalise_steps(payload.get("visible_symptoms")),
        "action_plan": action_plan,
        "explanation": (
            f"Cause: {action_plan['cause']}\n"
            f"Impact: {action_plan['impact']}\n"
            f"Treatment: {action_plan['treatment']}\n"
            f"Urgency: {action_plan['urgency']}"
        ),
    }
