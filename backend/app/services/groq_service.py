"""Groq LLM integration using the HTTP API directly."""
from __future__ import annotations

import logging

import requests

from app.core.config import settings
from app.schemas.chat import ChatMessage


logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an expert agricultural assistant. "
    "You must strictly explain only the detected disease that the user provides. "
    "Do not mention other diseases. "
    "Do not compare with similar diseases. "
    "Do not introduce scientific names unless you are fully certain they are correct. "
    "If scientific accuracy is uncertain, use simple general explanations instead. "
    "Keep the answer simple, accurate, and useful for farmers. "
    "Format the answer using exactly these four headings in this order: "
    "Cause:, Impact:, Treatment:, Urgency:."
)
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"


def _headers() -> dict[str, str]:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    return {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }


def _complete(messages: list[dict[str, str]], temperature: float, max_tokens: int) -> str:
    response = requests.post(
        GROQ_CHAT_URL,
        headers=_headers(),
        json={
            "model": settings.groq_model,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "messages": messages,
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def explain_disease(disease: str, question: str | None = None) -> str:
    """Generate a concise structured explanation for `disease`."""
    user_prompt = f"The model has detected the disease: {disease}."
    if question:
        user_prompt += f"\nAdditional farmer question: {question}"
    user_prompt += (
        "\nYou must explain only this disease."
        "\nFormat:"
        "\nCause:"
        "\nImpact:"
        "\nTreatment:"
        "\nUrgency:"
    )

    return _complete(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=512,
    )


def chat(messages: list[ChatMessage], disease: str | None = None) -> str:
    """General conversational endpoint that preserves message history."""
    system = SYSTEM_PROMPT
    if disease:
        system += (
            f"\n\nThe model has detected the disease: {disease}."
            "\nYou must strictly explain only this disease."
        )

    payload = [{"role": "system", "content": system}]
    payload.extend({"role": m.role, "content": m.content} for m in messages)

    return _complete(payload, temperature=0.3, max_tokens=768)
