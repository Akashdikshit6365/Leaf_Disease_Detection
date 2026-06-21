"""MongoDB connection and collection setup."""
from __future__ import annotations

import logging

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.database import Database

from .config import settings


logger = logging.getLogger(__name__)

client: MongoClient = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)


def get_database() -> Database:
    return client[settings.mongodb_database]


def init_db() -> None:
    """Create MongoDB indexes at startup. Safe no-op if MongoDB is unreachable."""
    try:
        db = get_database()
        db.command("ping")
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.predictions.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        db.predictions.create_index([("user_id", ASCENDING), ("disease", ASCENDING)])
        logger.info("MongoDB indexes verified")
    except Exception as exc:  # pragma: no cover
        logger.warning("MongoDB init skipped: %s", exc)
