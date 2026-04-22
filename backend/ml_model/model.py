"""EfficientNet-B0 classifier builder for the leaf-disease task."""
from __future__ import annotations

import logging
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from torchvision import models

from .classes import CLASS_NAMES, num_classes
from .spec import IMG_SIZE, MODEL_NAME, NORMALIZE_MEAN, NORMALIZE_STD


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ModelMetadata:
    model_name: str
    model_version: str
    class_names: list[str]
    image_size: int
    normalize_mean: list[float]
    normalize_std: list[float]
    checkpoint_path: str


def build_model(pretrained: bool = False) -> nn.Module:
    """Create an EfficientNet-B0 with a classification head sized to our labels."""
    weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
    net = models.efficientnet_b0(weights=weights)

    in_features = net.classifier[1].in_features
    net.classifier[1] = nn.Linear(in_features, num_classes())
    return net


def _legacy_metadata(checkpoint_path: Path) -> ModelMetadata:
    return ModelMetadata(
        model_name=MODEL_NAME,
        model_version="legacy-state-dict",
        class_names=list(CLASS_NAMES),
        image_size=IMG_SIZE,
        normalize_mean=list(NORMALIZE_MEAN),
        normalize_std=list(NORMALIZE_STD),
        checkpoint_path=str(checkpoint_path),
    )


def _require_metadata(payload: dict[str, Any]) -> dict[str, Any]:
    metadata = payload.get("metadata")
    if not isinstance(metadata, dict):
        raise ValueError(
            "Checkpoint metadata is missing. Save the trained model with metadata for "
            "model_name, model_version, class_names, image_size, normalize_mean, and normalize_std."
        )
    return metadata


def _validate_metadata(metadata: dict[str, Any], checkpoint_path: Path) -> ModelMetadata:
    required_keys = {
        "model_name",
        "model_version",
        "class_names",
        "image_size",
        "normalize_mean",
        "normalize_std",
    }
    missing = sorted(required_keys - metadata.keys())
    if missing:
        raise ValueError(f"Checkpoint metadata is missing required keys: {', '.join(missing)}")

    if metadata["model_name"] != MODEL_NAME:
        raise ValueError(
            f"Checkpoint model_name mismatch: expected {MODEL_NAME}, got {metadata['model_name']}"
        )
    if list(metadata["class_names"]) != CLASS_NAMES:
        raise ValueError("Checkpoint class_names do not match backend classes.py ordering.")
    if int(metadata["image_size"]) != IMG_SIZE:
        raise ValueError(
            f"Checkpoint image_size mismatch: expected {IMG_SIZE}, got {metadata['image_size']}"
        )

    mean = [float(v) for v in metadata["normalize_mean"]]
    std = [float(v) for v in metadata["normalize_std"]]
    if mean != NORMALIZE_MEAN or std != NORMALIZE_STD:
        raise ValueError("Checkpoint normalization metadata does not match backend preprocessing.")

    version = str(metadata["model_version"]).strip()
    if not version:
        raise ValueError("Checkpoint model_version must be a non-empty string.")

    return ModelMetadata(
        model_name=MODEL_NAME,
        model_version=version,
        class_names=list(CLASS_NAMES),
        image_size=IMG_SIZE,
        normalize_mean=mean,
        normalize_std=std,
        checkpoint_path=str(checkpoint_path),
    )


def _extract_state_dict(payload: Any, checkpoint_path: Path) -> tuple[dict[str, Any], ModelMetadata]:
    if isinstance(payload, (dict, OrderedDict)) and all(isinstance(k, str) for k in payload.keys()):
        if "state_dict" in payload:
            state_dict = payload.get("state_dict")
            if not isinstance(state_dict, dict):
                raise ValueError("Checkpoint state_dict is missing or invalid.")
            metadata = _validate_metadata(_require_metadata(payload), checkpoint_path)
            return state_dict, metadata

        state_dict = payload
        classifier_weight = state_dict.get("classifier.1.weight")
        classifier_bias = state_dict.get("classifier.1.bias")
        if classifier_weight is None or classifier_bias is None:
            raise ValueError("Legacy checkpoint is missing classifier weights.")
        if tuple(classifier_weight.shape) != (num_classes(), 1280):
            raise ValueError(
                f"Legacy checkpoint classifier shape {tuple(classifier_weight.shape)} does not match "
                f"the configured {num_classes()} classes."
            )
        return state_dict, _legacy_metadata(checkpoint_path)

    raise ValueError("Checkpoint must be a dict containing state_dict and metadata, or a legacy state_dict.")


def load_weights(model: nn.Module, weights_path: str | Path) -> ModelMetadata:
    """Load trained weights and validated metadata."""
    path = Path(weights_path).resolve()
    if not path.exists():
        raise FileNotFoundError(
            f"Trained model checkpoint not found at {path}. "
            "Place your trained weights at backend/ml_model/weights.pth or update MODEL_WEIGHTS_PATH."
        )

    payload = torch.load(path, map_location="cpu")
    state_dict, metadata = _extract_state_dict(payload, path)
    model.load_state_dict(state_dict, strict=True)
    logger.info("Loaded model weights from %s (version=%s)", path, metadata.model_version)
    return metadata


def target_conv_layer(model: nn.Module) -> nn.Module:
    """Last conv feature map required by Grad-CAM."""
    return model.features[-1]
