"""User account and JWT helpers."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.database import get_database


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _public_user(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["_id"]),
        "name": row["name"],
        "email": row["email"],
        "created_at": row["created_at"],
    }


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)


def create_access_token(user_id: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def register_user(*, name: str, email: str, password: str) -> dict[str, Any]:
    db = get_database()
    now = datetime.now(timezone.utc)
    row = {
        "name": name.strip(),
        "email": email.lower(),
        "password_hash": hash_password(password),
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = db.users.insert_one(row)
    except DuplicateKeyError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.") from exc

    row["_id"] = result.inserted_id
    return _public_user(row)


def authenticate_user(*, email: str, password: str) -> dict[str, Any] | None:
    row = get_database().users.find_one({"email": email.lower()})
    if row is None or not verify_password(password, row["password_hash"]):
        return None
    return _public_user(row)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
    credentials_error = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Invalid or expired login. Please sign in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
        if not user_id or not ObjectId.is_valid(user_id):
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc

    row = get_database().users.find_one({"_id": ObjectId(user_id)})
    if row is None:
        raise credentials_error
    return _public_user(row)
