"""SQLAlchemy ORM model mirroring the `predictions` table."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DECIMAL, BigInteger, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id:          Mapped[int]      = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    image_url:   Mapped[str]      = mapped_column(String(1024), nullable=False)
    heatmap_url: Mapped[str]      = mapped_column(String(1024), nullable=False)
    disease:     Mapped[str]      = mapped_column(String(128),  nullable=False, index=True)
    confidence:  Mapped[float]    = mapped_column(DECIMAL(5, 4), nullable=False)
    created_at:  Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp(), nullable=False, index=True,
    )
