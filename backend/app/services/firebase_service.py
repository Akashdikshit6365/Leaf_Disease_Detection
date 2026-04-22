"""Upload original images and heatmaps to Firebase Storage."""
from __future__ import annotations

import logging
import uuid
from typing import Literal

from app.core.firebase import get_bucket


logger = logging.getLogger(__name__)

Folder = Literal["images", "heatmaps"]


def upload_bytes(data: bytes, folder: Folder, content_type: str = "image/png") -> str:
    """Upload binary payload and return a public URL."""
    bucket = get_bucket()
    blob_name = f"{folder}/{uuid.uuid4().hex}.png"
    blob = bucket.blob(blob_name)
    blob.upload_from_string(data, content_type=content_type)
    blob.make_public()
    logger.info("Uploaded %s → %s", folder, blob.public_url)
    return blob.public_url
