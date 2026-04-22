"""Image preprocessing + disease inference."""
from __future__ import annotations

import io
import logging
import threading
from dataclasses import dataclass

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from app.core.config import settings
from ml_model.classes import CLASS_NAMES
from ml_model.model import ModelMetadata, build_model, load_weights, target_conv_layer
from ml_model.spec import IMG_SIZE, NORMALIZE_MEAN, NORMALIZE_STD


logger = logging.getLogger(__name__)

_preprocess = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=NORMALIZE_MEAN,
        std=NORMALIZE_STD,
    ),
])


@dataclass(frozen=True)
class Prediction:
    label: str
    confidence: float
    class_index: int
    second_label: str
    second_confidence: float
    confidence_margin: float
    probabilities: list[float]


class ModelService:
    """Thread-safe singleton wrapping the PyTorch classifier."""

    def __init__(self) -> None:
        self._model: torch.nn.Module | None = None
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._metadata: ModelMetadata | None = None
        self._lock = threading.Lock()

    # ---------- lifecycle ----------
    def load(self) -> None:
        with self._lock:
            if self._model is not None:
                return
            logger.info("Loading classifier on %s", self._device)
            model = build_model(pretrained=False)
            self._metadata = load_weights(model, settings.model_weights_path_resolved)
            model.to(self._device).eval()
            self._model = model

    @property
    def model(self) -> torch.nn.Module:
        if self._model is None:
            self.load()
        assert self._model is not None
        return self._model

    @property
    def device(self) -> torch.device:
        return self._device

    @property
    def metadata(self) -> ModelMetadata:
        if self._metadata is None:
            self.load()
        assert self._metadata is not None
        return self._metadata

    @property
    def target_layer(self) -> torch.nn.Module:
        return target_conv_layer(self.model)

    # ---------- I/O ----------
    def load_image(self, image_bytes: bytes) -> Image.Image:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")

    def preprocess(self, image: Image.Image) -> torch.Tensor:
        return _preprocess(image).unsqueeze(0).to(self._device)

    # ---------- inference ----------
    @torch.inference_mode()
    def predict(self, image: Image.Image) -> tuple[Prediction, torch.Tensor]:
        """Return the (prediction, input_tensor) tuple.

        The input tensor is returned so Grad-CAM can re-use it with gradients.
        """
        tensor = self.preprocess(image)
        logits = self.model(tensor)
        probs = F.softmax(logits, dim=1).squeeze(0)

        top_probs, top_indices = torch.topk(probs, k=min(2, probs.shape[0]))
        idx = int(top_indices[0].item())
        conf = float(top_probs[0].item())
        second_idx = int(top_indices[1].item()) if probs.shape[0] > 1 else idx
        second_conf = float(top_probs[1].item()) if probs.shape[0] > 1 else 0.0

        label = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"Class {idx}"
        second_label = CLASS_NAMES[second_idx] if second_idx < len(CLASS_NAMES) else f"Class {second_idx}"
        return (
            Prediction(
                label=label,
                confidence=conf,
                class_index=idx,
                second_label=second_label,
                second_confidence=second_conf,
                confidence_margin=conf - second_conf,
                probabilities=probs.detach().cpu().tolist(),
            ),
            tensor.detach(),
        )


model_service = ModelService()
