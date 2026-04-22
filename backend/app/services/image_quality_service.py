"""Image-quality checks used before running disease inference."""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image

from app.core.config import settings


@dataclass(frozen=True)
class ImageQualityReport:
    width: int
    height: int
    brightness: float
    blur_score: float
    plant_coverage: float
    center_coverage: float
    issues: list[str]

    @property
    def retake_recommended(self) -> bool:
        return len(self.issues) > 0


def assess_image(image: Image.Image) -> ImageQualityReport:
    rgb = np.asarray(image.convert("RGB"))
    height, width = rgb.shape[:2]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    brightness = float(gray.mean() / 255.0)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    green_mask = (
        (hsv[:, :, 0] >= 25) & (hsv[:, :, 0] <= 95) &
        (hsv[:, :, 1] >= 35) &
        (hsv[:, :, 2] >= 30)
    )
    brown_mask = (
        (hsv[:, :, 0] >= 5) & (hsv[:, :, 0] <= 25) &
        (hsv[:, :, 1] >= 30) &
        (hsv[:, :, 2] >= 20)
    )
    plant_like = green_mask | brown_mask
    plant_coverage = float(plant_like.mean())

    y1, y2 = int(height * 0.2), int(height * 0.8)
    x1, x2 = int(width * 0.2), int(width * 0.8)
    center_region = plant_like[y1:y2, x1:x2]
    center_coverage = float(center_region.mean()) if center_region.size else 0.0

    issues: list[str] = []
    if min(width, height) < settings.image_quality_min_dimension:
        issues.append("Image resolution is too low. Move closer to the leaf and retake the image.")
    if brightness < settings.image_quality_min_brightness:
        issues.append("Image is too dark. Use better lighting and retake the image.")
    if brightness > settings.image_quality_max_brightness:
        issues.append("Image is overexposed. Reduce glare or strong light and retake the image.")
    if blur_score < settings.image_quality_min_blur_score:
        issues.append("Image is blurry. Hold the camera steady and retake the image.")
    if plant_coverage < settings.image_quality_min_plant_coverage:
        issues.append("The image may not contain enough leaf area. Focus on a single leaf and retake the image.")
    if center_coverage < settings.image_quality_min_center_coverage:
        issues.append("The leaf is poorly framed. Center the leaf in the camera and retake the image.")

    return ImageQualityReport(
        width=width,
        height=height,
        brightness=brightness,
        blur_score=blur_score,
        plant_coverage=plant_coverage,
        center_coverage=center_coverage,
        issues=issues,
    )
