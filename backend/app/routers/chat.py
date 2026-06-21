"""LLM endpoints backed by Groq."""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import AskAIRequest, AskAIResponse, ChatRequest, ChatResponse
from app.services import groq_service


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ask-ai", response_model=AskAIResponse)
def ask_ai(payload: AskAIRequest) -> AskAIResponse:
    try:
        answer = groq_service.explain_disease(payload.disease, payload.question)
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:
        logger.exception("Groq call failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"LLM error: {exc}") from exc

    return AskAIResponse(disease=payload.disease, answer=answer)


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        answer = groq_service.chat(payload.messages, payload.disease, payload.diagnosis_context)
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:
        logger.exception("Groq chat failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"LLM error: {exc}") from exc

    return ChatResponse(answer=answer)
