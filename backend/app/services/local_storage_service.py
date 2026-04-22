"""Save original images and heatmaps to a local uploads directory."""
from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Literal
from urllib.parse import unquote, urljoin, urlparse

from app.core.config import settings


logger = logging.getLogger(__name__)

Folder = Literal["images", "heatmaps"]


def save_bytes(
    data: bytes,
    folder: Folder,
    base_url: str,
    content_type: str = "image/png",
) -> str:
    """Persist binary payload locally and return a public URL served by FastAPI."""
    uploads_dir = Path(settings.local_uploads_dir)
    target_dir = uploads_dir / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    file_name = f"{uuid.uuid4().hex}.png"
    file_path = target_dir / file_name
    file_path.write_bytes(data)

    public_url = urljoin(str(base_url), f"uploads/{folder}/{file_name}")
    logger.info("Saved %s locally -> %s (%s)", folder, public_url, content_type)
    return public_url


def delete_public_url(file_url: str) -> bool:
    """Delete a locally stored file referenced by its public URL."""
    parsed = urlparse(file_url)
    public_path = Path(unquote(parsed.path)).as_posix().lstrip("/")
    if not public_path.startswith("uploads/"):
        logger.info("Skipping non-local file deletion for %s", file_url)
        return False

    relative_path = Path(public_path.removeprefix("uploads/"))
    uploads_dir = Path(settings.local_uploads_dir).resolve()
    target_path = (uploads_dir / relative_path).resolve()

    try:
        target_path.relative_to(uploads_dir)
    except ValueError:
        logger.warning("Refusing to delete file outside uploads dir: %s", target_path)
        return False

    if not target_path.exists():
        logger.info("Local file already missing: %s", target_path)
        return False

    target_path.unlink()
    logger.info("Deleted local file %s", target_path)
    return True
