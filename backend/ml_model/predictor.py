"""Two-stage plant disease prediction with Groq vision fallback."""
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
from ml_model.model import build_model, load_weights
from ml_model.spec import IMG_SIZE, NORMALIZE_MEAN, NORMALIZE_STD


logger = logging.getLogger(__name__)

MODEL_CONFIDENCE_THRESHOLD = 0.70
LABELS_PATH = Path(__file__).resolve().with_name("class_labels.json")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

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


# ── Groq LLM ───────────────────────────────────────────────────────────────

def _call_groq_vision(image: Image.Image) -> dict[str, Any]:
    """Call Groq vision API for plant disease identification from image.
    Uses meta-llama/llama-4-scout-17b-16e-instruct for vision-based diagnosis.
    Result is returned with source='model' to hide API usage from UI.
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
                    "You are an expert plant pathologist. Analyze leaf images and identify: "
                    "1) The plant species, 2) Any disease if present, 3) Severity level (Low/Medium/High if diseased). "
                    "Return ONLY valid JSON in this format: "
                    '{"plant": "Plant Name", "disease": "Disease Name or Healthy", "severity": "Low/Medium/High or N/A"}'
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this leaf image and identify the plant and any disease. Return only JSON.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_base64}"},
                    },
                ],
            },
        ],
        "temperature": 0.3,
        "max_tokens": 200,
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=body, timeout=30)
    response.raise_for_status()
    
    text = response.json()["choices"][0]["message"]["content"]
    try:
        payload = json.loads(text)
        return {
            "source": "model",  # Hide API usage - appear as local model to UI
            "plant": str(payload.get("plant", "")).strip(),
            "disease": str(payload.get("disease", "Healthy")).strip(),
            "severity": str(payload.get("severity", "N/A")).strip(),
        }
    except json.JSONDecodeError:
        raise ValueError(f"Groq vision response was not valid JSON: {text}")


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
        """
        When model confidence is low → use Groq vision model
        to identify the plant and disease from the image.
        Result is returned with source='model' to hide API usage from UI.
        """
        try:
            # Try Groq vision model (meta-llama/llama-4-scout-17b-16e-instruct)
            result = _call_groq_vision(image)
            plant = result["plant"]
            disease = result["disease"]
            
            # Get treatment advice from Groq text model
            try:
                treatment = _call_groq(plant, disease)
            except Exception as e:
                logger.warning("Groq treatment API failed: %s — using fallback", e)
                treatment = _fallback_advice(disease)
            
            result["treatment"] = treatment
            return result
        except Exception as e:
            logger.warning("Groq vision API failed: %s — falling back to local model", e)
            # Fallback: use local model's best guess
            tensor    = self._preprocess(image)
            logits    = self.model(tensor)
            probs     = F.softmax(logits, dim=1).squeeze(0)
            conf, idx = torch.max(probs, dim=0)

            idx            = int(idx.item())
            confidence_pct = round(float(conf.item()) * 100, 2)
            label          = self.labels[idx] if idx < len(self.labels) else f"Class {idx}"
            plant, disease = _split_label(label)
            
            try:
                treatment = _call_groq(plant, disease)
            except Exception as e:
                logger.warning("Groq treatment API failed: %s — using fallback", e)
                treatment = _fallback_advice(disease)

            return {
                "source":     "model",  # Hidden from UI
                "plant":      plant,
                "disease":    disease,
                "confidence": confidence_pct,
                "treatment":  treatment,
            }

    def predict(self, image_file: Any) -> dict[str, Any]:
        image_bytes = image_file.read() if hasattr(image_file, "read") else image_file
        if not image_bytes:
            raise ValueError("Empty image file.")

        image        = self._load_image(image_bytes)
        model_result = self._predict_model(image)

        # High confidence → return model result directly
        if float(model_result["confidence"]) >= MODEL_CONFIDENCE_THRESHOLD * 100:
            # Still get treatment from Groq for high confidence results
            plant   = model_result["plant"]
            disease = model_result["disease"]
            try:
                treatment = _call_groq(plant, disease)
            except Exception as e:
                logger.warning("Groq API failed: %s — using fallback", e)
                treatment = _fallback_advice(disease)

            model_result["treatment"] = treatment
            return model_result

        # Low confidence → use Groq assisted result
        return self._predict_groq(image)


predictor = PlantDiseasePredictor()