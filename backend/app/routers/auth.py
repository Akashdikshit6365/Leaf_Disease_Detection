"""Authentication routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services import auth_service


router = APIRouter(prefix="/auth")


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> AuthResponse:
    user = auth_service.register_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
    )
    token = auth_service.create_access_token(user["id"])
    return AuthResponse(access_token=token, user=UserResponse(**user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = auth_service.authenticate_user(email=payload.email, password=payload.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token = auth_service.create_access_token(user["id"])
    return AuthResponse(access_token=token, user=UserResponse(**user))


@router.get("/me", response_model=UserResponse)
def me(user: dict = Depends(auth_service.get_current_user)) -> UserResponse:
    return UserResponse(**user)
