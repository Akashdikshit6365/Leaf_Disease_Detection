"""LeafAI FastAPI entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.routers import chat, history, predict
from app.services.model_service import model_service
from ml_model.predictor import predictor


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Warm the model and ensure DB schema exists on boot.
    model_service.load()
    predictor.load()
    init_db()
    yield

app = FastAPI(
    title="LeafAI - Leaf Disease Detection",
    description="Explainable AI diagnosis for leaf diseases with Grad-CAM and LLM-powered chat.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(history.router, prefix="/api", tags=["history"])


@app.get("/")
def root() -> dict:
    return {"service": "LeafAI", "status": "ok", "version": app.version}


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}
