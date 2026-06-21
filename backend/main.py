"""LeafAI FastAPI entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.routers import auth, chat, history, predict
import os

# Import heavy model modules lazily inside the lifespan to avoid requiring
# large dependencies (torch, opencv) when running quick API tests.
model_service = None
predictor = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Warm the model and ensure DB schema exists on boot. Skip model warmup
    # when `SKIP_MODEL_WARMUP` is set (useful for local tests without torch).
    skip_warmup = os.getenv('SKIP_MODEL_WARMUP', 'false').lower() in ('1', 'true', 'yes')
    if not skip_warmup:
        try:
            # Lazy-import heavy modules
            from app.services.model_service import model_service as _model_service
            from ml_model.predictor import predictor as _predictor
            _model_service.load()
            _predictor.load()
        except Exception as exc:  # pragma: no cover
            # Log and continue; DB and API remain usable even if model fails to load.
            import logging
            logging.getLogger(__name__).warning('Model warmup skipped/failed: %s', exc)
    else:
        import logging
        logging.getLogger(__name__).info('SKIP_MODEL_WARMUP enabled; skipping model warmup')
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
app.include_router(auth.router, prefix="/api", tags=["auth"])


@app.get("/")
def root() -> dict:
    return {"service": "LeafAI", "status": "ok", "version": app.version}


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}
