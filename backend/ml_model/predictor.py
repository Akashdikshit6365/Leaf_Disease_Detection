"""Plant disease prediction helpers with Groq vision support."""
from __future__ import annotations

import base64
import io
import json
import logging
import re
import threading
from pathlib import Path
from typing import Any

import requests
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from app.core.config import settings
from ml_model.classes import CLASS_NAMES
from ml_model.label_utils import split_label
from ml_model.model import build_model, load_weights
from ml_model.spec import IMG_SIZE, NORMALIZE_MEAN, NORMALIZE_STD


logger = logging.getLogger(__name__)

MODEL_CONFIDENCE_THRESHOLD = 0.70
LABELS_PATH = Path(__file__).resolve().with_name("class_labels.json")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
ALLOWED_LABELS_TEXT = "\n".join(f"- {label}" for label in CLASS_NAMES)

_preprocess = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
])


# ── Helpers ────────────────────────────────────────────────────────────────

def _load_labels() -> list[str]:
    with LABELS_PATH.open("r", encoding="utf-8") as fh:
        labels = json.load(fh)
    if not isinstance(labels, list) or not all(isinstance(item, str) for item in labels):
        raise ValueError(f"Invalid class labels file at {LABELS_PATH}")
    return labels


def _pretty_name(value: str) -> str:
    cleaned = value.replace("___", " ").replace("_", " ").replace(",", ", ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" _")
    return cleaned.title()


def _split_label(label: str) -> tuple[str, str]:
    if "___" in label:
        plant_raw, disease_raw = label.split("___", 1)
    else:
        plant_raw, disease_raw = label, "Unknown"

    plant   = _pretty_name(plant_raw)
    disease = "Healthy" if disease_raw.lower() == "healthy" else _pretty_name(disease_raw)
    return plant, disease


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
        raise ValueError("Groq vision response JSON must be an object.")
    return payload


def _normalise_label(value: str) -> str | None:
    if value in CLASS_NAMES:
        return value

    folded = re.sub(r"[\s_-]+", "", value).lower()
    for label in CLASS_NAMES:
        if re.sub(r"[\s_-]+", "", label).lower() == folded:
            return label
    return None


# ── Groq LLM ───────────────────────────────────────────────────────────────

def _call_groq_vision(image: Image.Image) -> dict[str, Any]:
    """Call Groq vision API for plant disease identification from image.
    Uses meta-llama/llama-4-scout-17b-16e-instruct for vision-based diagnosis.
    Result is returned with source='groq'.
    """
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    
    if not settings.groq_vision_model:
        raise RuntimeError("GROQ_VISION_MODEL is not configured.")

    # Convert PIL image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    body = {
        "model": settings.groq_vision_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert plant pathologist for a leaf diagnosis app. "
                    "Choose exactly one label from the allowed_labels list when the image appears to contain a plant leaf. "
                    "Use visual symptoms, leaf shape, colour, and crop type to select the closest defensible allowed label. "
                    "Use out_of_scope only when the image clearly is not a plant leaf, is unreadable, or clearly shows a crop type not covered by the allowed labels. "
                    "Return ONLY valid JSON with this exact shape: "
                    '{"label": "Allowed_Label_or_out_of_scope", "confidence": 0.0, "severity": "Low/Medium/High/N/A"}. '
                    "Set confidence to your visual confidence as a number from 0.0 to 1.0."
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analyze this image. If it is a plant leaf, select the closest allowed label only. "
                            "Do not return out_of_scope just because the image is low confidence or imperfect.\n\n"
                            f"allowed_labels:\n{ALLOWED_LABELS_TEXT}"
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_base64}"},
                    },
                ],
            },
        ],
        "temperature": 0.0,
        "max_tokens": 200,
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=body, timeout=30)
    response.raise_for_status()
    
    text = response.json()["choices"][0]["message"]["content"]
    payload = _extract_json_object(text)
    raw_label = str(payload.get("label", "")).strip()
    if raw_label.lower() == "out_of_scope":
        return {
            "source": "groq",
            "label": "out_of_scope",
            "plant": "Unsupported plant",
            "disease": "Uncertain Diagnosis",
            "confidence": 0.0,
            "severity": "N/A",
        }

    label = _normalise_label(raw_label)
    if label is None:
        raise ValueError(f"Groq vision returned unsupported label: {raw_label}")

    plant, disease = split_label(label)
    raw_confidence = payload.get("confidence", 0.0)
    try:
        confidence = max(0.0, min(1.0, float(raw_confidence)))
    except (TypeError, ValueError):
        confidence = 0.0

    return {
        "source": "groq",
        "label": label,
        "plant": plant,
        "disease": disease,
        "confidence": confidence,
        "severity": str(payload.get("severity", "N/A")).strip() or "N/A",
    }


def _call_groq(plant: str, disease: str) -> str:
    """Call Groq API for treatment advice."""
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    if disease.lower() == "healthy":
        prompt = (
            f"The plant '{plant}' appears healthy. "
            "Give 3 short care tips to keep it healthy. "
            "Be practical and concise."
        )
    else:
        prompt = (
            f"Plant: {plant}\n"
            f"Disease: {disease}\n\n"
            "As a plant pathologist, provide:\n"
            "1. One sentence description of this disease\n"
            "2. Three treatment steps\n"
            "3. Two prevention tips\n"
            "Be practical and concise."
        )

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    body = {
        "model": settings.groq_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert plant pathologist. "
                    "Give clear, practical, concise advice for plant diseases."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 400,
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=body, timeout=15)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _fallback_advice(disease: str) -> str:
    """Fallback if Groq API fails — app never crashes."""
    if disease.lower() == "healthy":
        return (
            "Your plant looks healthy! "
            "Keep watering regularly, ensure proper sunlight, "
            "and check for pests weekly."
        )
    return (
        f"Disease detected: {disease}. "
        "Remove affected leaves immediately. "
        "Improve air circulation around the plant. "
        "Avoid overwatering and consult a local agricultural expert for treatment."
    )


# ── Main Predictor ──────────────────────────────────────────────────────────

class PlantDiseasePredictor:
    """Thread-safe model + Groq predictor loaded once per process."""

    def __init__(self) -> None:
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._model: torch.nn.Module | None = None
        self._labels: list[str] | None = None
        self._lock = threading.Lock()

    def load(self) -> None:
        with self._lock:
            if self._model is None:
                logger.info("Loading plant disease predictor on %s", self._device)
                model = build_model(pretrained=False)
                load_weights(model, settings.model_weights_path_resolved)
                model.to(self._device).eval()
                self._model = model
                self._labels = _load_labels()

    @property
    def model(self) -> torch.nn.Module:
        if self._model is None:
            self.load()
        assert self._model is not None
        return self._model

    @property
    def labels(self) -> list[str]:
        if self._labels is None:
            self.load()
        assert self._labels is not None
        return self._labels

    def _load_image(self, image_bytes: bytes) -> Image.Image:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")

    def _preprocess(self, image: Image.Image) -> torch.Tensor:
        return _preprocess(image).unsqueeze(0).to(self._device)

    @torch.inference_mode()
    def _predict_model(self, image: Image.Image) -> dict[str, Any]:
        tensor    = self._preprocess(image)
        logits    = self.model(tensor)
        probs     = F.softmax(logits, dim=1).squeeze(0)
        conf, idx = torch.max(probs, dim=0)

        idx            = int(idx.item())
        confidence_pct = round(float(conf.item()) * 100, 2)
        label          = self.labels[idx] if idx < len(self.labels) else f"Class {idx}"
        plant, disease = _split_label(label)

        return {
            "source":     "model",
            "plant":      plant,
            "disease":    disease,
            "confidence": confidence_pct,
        }

    def _predict_groq(self, image: Image.Image) -> dict[str, Any]:
        """Use Groq vision model to identify the plant and disease."""
        result = _call_groq_vision(image)
        plant = result["plant"]
        disease = result["disease"]

        try:
            treatment = _call_groq(plant, disease)
        except Exception as e:
            logger.warning("Groq treatment API failed: %s - using fallback advice", e)
            treatment = _fallback_advice(disease)

        result["treatment"] = treatment
        return result

    def predict(self, image_file: Any) -> dict[str, Any]:
        image_bytes = image_file.read() if hasattr(image_file, "read") else image_file
        if not image_bytes:
            raise ValueError("Empty image file.")

        image = self._load_image(image_bytes)
        return self._predict_groq(image)


    def diagnose_uncertain(self, image_file: Any) -> dict[str, Any]:
        """Force the Groq-assisted diagnosis path for uncertain images."""
        image_bytes = image_file.read() if hasattr(image_file, "read") else image_file
        if not image_bytes:
            raise ValueError("Empty image file.")

        image = self._load_image(image_bytes)
        return self._predict_groq(image)


predictor = PlantDiseasePredictor()
