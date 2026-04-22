"""MySQL connection and session management via SQLAlchemy."""
from __future__ import annotations

import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


engine = create_engine(
    settings.mysql_dsn,
    pool_pre_ping=True,
    pool_recycle=3600,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Session:
    """FastAPI dependency — yields a scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables at startup. Safe no-op if MySQL is down (logs warning)."""
    # Import here so mappers register before create_all.
    from app.models import prediction  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("MySQL schema verified")
    except Exception as exc:  # pragma: no cover
        logger.warning("MySQL init skipped: %s", exc)
