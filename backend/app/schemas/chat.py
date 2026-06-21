"""Pydantic schemas for the LLM chat assistant."""
from __future__ import annotations

from pydantic import BaseModel, Field


class AskAIRequest(BaseModel):
    disease: str = Field(..., min_length=1, max_length=128)
    question: str | None = Field(default=None, max_length=2000)


class AskAIResponse(BaseModel):
    disease: str
    answer: str


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)
    disease: str | None = None
    diagnosis_context: dict | None = None


class ChatResponse(BaseModel):
    answer: str
