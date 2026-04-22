"""Firebase Admin SDK initialiser — lazy + idempotent."""
from __future__ import annotations

import logging
import threading
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, storage

from .config import settings


logger = logging.getLogger(__name__)
_lock = threading.Lock()
_bucket = None


def get_bucket():
    """Return the Firebase Storage bucket, initialising the SDK on first call."""
    global _bucket
    if _bucket is not None:
        return _bucket

    with _lock:
        if _bucket is not None:
            return _bucket

        cred_path = Path(settings.firebase_credentials_json)
        if not cred_path.exists():
            raise RuntimeError(
                f"Firebase credentials not found at {cred_path}. "
                "Set FIREBASE_CREDENTIALS_JSON in .env to a valid service-account JSON."
            )
        if not settings.firebase_storage_bucket:
            raise RuntimeError("FIREBASE_STORAGE_BUCKET is not configured.")

        if not firebase_admin._apps:
            firebase_admin.initialize_app(
                credentials.Certificate(str(cred_path)),
                {"storageBucket": settings.firebase_storage_bucket},
            )
            logger.info("Firebase Admin SDK initialised")

        _bucket = storage.bucket()
        return _bucket
