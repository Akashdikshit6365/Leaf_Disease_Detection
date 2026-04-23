"""Upload and delete prediction assets in Cloudinary."""
from __future__ import annotations

import logging
from pathlib import PurePosixPath
from typing import Literal
from urllib.parse import unquote, urlparse

import cloudinary
import cloudinary.uploader

from app.core.config import settings


logger = logging.getLogger(__name__)

Folder = Literal["images", "heatmaps"]
_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return

    cloud_name, api_key, api_secret = settings.cloudinary_credentials
    if not (cloud_name and api_key and api_secret):
        raise RuntimeError(
            "Cloudinary is not configured. Set CLOUDINARY_URL or the CLOUDINARY_* credentials."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    _configured = True


def _folder_name(folder: Folder) -> str:
    if folder == "images":
        return settings.cloudinary_image_folder
    return settings.cloudinary_heatmap_folder


def upload_bytes(data: bytes, folder: Folder, content_type: str = "image/png") -> str:
    """Upload binary payload and return a secure Cloudinary URL."""
    _ensure_configured()
    asset_folder = _folder_name(folder)
    result = cloudinary.uploader.upload(
        data,
        resource_type="image",
        asset_folder=asset_folder,
        public_id_prefix=folder,
        format="png",
        overwrite=False,
        invalidate=False,
    )
    secure_url = result["secure_url"]
    logger.info("Uploaded %s to Cloudinary -> %s (%s)", folder, secure_url, content_type)
    return secure_url


def delete_public_url(file_url: str) -> bool:
    """Delete a Cloudinary asset referenced by its delivery URL."""
    _ensure_configured()
    parsed = urlparse(file_url)
    path = PurePosixPath(unquote(parsed.path))
    parts = [part for part in path.parts if part not in {"/", ""}]
    if len(parts) < 4 or parts[0] != "image" or parts[1] != "upload":
        logger.info("Skipping non-Cloudinary URL deletion for %s", file_url)
        return False

    asset_parts = parts[2:]
    if asset_parts and asset_parts[0].startswith("v") and asset_parts[0][1:].isdigit():
        asset_parts = asset_parts[1:]
    if not asset_parts:
        logger.warning("Could not infer Cloudinary public_id from %s", file_url)
        return False

    public_id = str(PurePosixPath(*asset_parts).with_suffix(""))
    result = cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)
    deleted = result.get("result") == "ok"
    if deleted:
        logger.info("Deleted Cloudinary asset %s", public_id)
    else:
        logger.info("Cloudinary asset not deleted for %s: %s", public_id, result)
    return deleted
