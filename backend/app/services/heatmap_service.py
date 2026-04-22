"""Grad-CAM heatmap generation for the classifier."""
from __future__ import annotations

from typing import cast

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from ml_model.spec import IMG_SIZE

from .model_service import model_service


class GradCAM:
    """Minimal Grad-CAM implementation pinned to a target conv layer."""

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module) -> None:
        self.model = model
        self.target_layer = target_layer
        self._activations: torch.Tensor | None = None
        self._gradients:   torch.Tensor | None = None
        self._handles = [
            target_layer.register_forward_hook(self._save_activation),
            target_layer.register_full_backward_hook(self._save_gradient),
        ]

    # ---------- hook callbacks ----------
    def _save_activation(self, _module, _inp, output: torch.Tensor) -> None:
        self._activations = output.detach()

    def _save_gradient(self, _module, _grad_in, grad_out: tuple[torch.Tensor, ...]) -> None:
        self._gradients = grad_out[0].detach()

    # ---------- api ----------
    def __call__(self, input_tensor: torch.Tensor, class_index: int) -> np.ndarray:
        self.model.zero_grad(set_to_none=True)

        # Forward with gradients enabled for the target class.
        with torch.enable_grad():
            tensor = input_tensor.clone().requires_grad_(True)
            logits = self.model(tensor)
            score = logits[0, class_index]
            score.backward(retain_graph=False)

        assert self._activations is not None and self._gradients is not None
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)     # GAP over spatial dims
        cam = (weights * self._activations).sum(dim=1, keepdim=True) # weighted sum
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(IMG_SIZE, IMG_SIZE), mode="bilinear", align_corners=False)
        cam = cam.squeeze().detach().cpu().numpy()

        # Normalise to [0, 1].
        cam_min, cam_max = float(cam.min()), float(cam.max())
        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)
        return cast(np.ndarray, cam)

    def close(self) -> None:
        for handle in self._handles:
            handle.remove()


def generate_heatmap(image: Image.Image, input_tensor: torch.Tensor, class_index: int) -> bytes:
    """Run Grad-CAM and return a PNG-encoded overlay (original image + heat colours)."""
    cam_generator = GradCAM(model_service.model, model_service.target_layer)
    try:
        cam = cam_generator(input_tensor, class_index)
    finally:
        cam_generator.close()

    # Resize original to match CAM canvas.
    rgb = np.asarray(image.convert("RGB").resize((IMG_SIZE, IMG_SIZE)))
    heat = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heat = cv2.cvtColor(heat, cv2.COLOR_BGR2RGB)

    overlay = np.uint8(0.55 * rgb + 0.45 * heat)

    ok, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    if not ok:
        raise RuntimeError("Failed to encode heatmap PNG")
    return buffer.tobytes()
