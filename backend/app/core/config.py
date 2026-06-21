"""Centralised settings loaded from environment variables."""
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote, unquote, urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    # App
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost,"
        "capacitor://localhost"
    )

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"         # text-only: treatment advice
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"  # vision: image diagnosis

    # Gemini
    gemini_api_key: str = ""
    gemini_vision_model: str = "gemini-3.1-flash-lite"

    # Cloudinary
    cloudinary_url: str = ""
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_image_folder: str = "LeafAI/images"
    cloudinary_heatmap_folder: str = "LeafAI/heatmaps"

    # MongoDB
    mongodb_uri: str = "mongodb://127.0.0.1:27017"
    mongodb_database: str = "leafai"

    # Auth
    jwt_secret_key: str = "change-this-secret-before-deploying"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Model
    model_weights_path: str = "./ml_model/weights.pth"
    model_confidence_threshold: float = 0.60
    model_confidence_margin_threshold: float = 0.05
    image_quality_min_dimension: int = 160
    image_quality_min_brightness: float = 0.08
    image_quality_max_brightness: float = 0.98
    image_quality_min_blur_score: float = 15.0
    image_quality_min_plant_coverage: float = 0.08
    image_quality_min_center_coverage: float = 0.03

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cloudinary_url_resolved(self) -> str:
        if self.cloudinary_url:
            return self.cloudinary_url
        if not (self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret):
            return ""
        secret = quote(self.cloudinary_api_secret, safe="")
        return (
            f"cloudinary://{self.cloudinary_api_key}:{secret}"
            f"@{self.cloudinary_cloud_name}"
        )

    @property
    def cloudinary_credentials(self) -> tuple[str, str, str]:
        if self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret:
            return (
                self.cloudinary_cloud_name,
                self.cloudinary_api_key,
                self.cloudinary_api_secret,
            )

        if not self.cloudinary_url:
            return ("", "", "")

        parsed = urlparse(self.cloudinary_url)
        return (
            parsed.hostname or "",
            unquote(parsed.username or ""),
            unquote(parsed.password or ""),
        )

    @property
    def model_weights_path_resolved(self) -> Path:
        path = Path(self.model_weights_path)
        resolved = path if path.is_absolute() else (BACKEND_DIR / path).resolve()
        if resolved.exists():
            return resolved

        legacy_path = (BACKEND_DIR / "weights.pth").resolve()
        if legacy_path.exists():
            return legacy_path
        return resolved


@lru_cache(maxsize=1)
def _load() -> Settings:
    return Settings()


settings = _load()
