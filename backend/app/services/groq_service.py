"""Groq LLM integration using the HTTP API directly."""
from __future__ import annotations

import json
import logging
import re

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


def _extract_json_object(text: str) -> dict:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise
        payload = json.loads(match.group(0))
    if not isinstance(payload, dict):
        raise ValueError("Groq response JSON must be an object.")
    return payload


def _fallback_action_plan(plant: str, disease: str, uncertain: bool = False) -> dict:
    if uncertain or disease.lower().startswith("uncertain"):
        return {
            "cause": "The image did not provide enough evidence for a confident disease match.",
            "impact": "Avoid starting strong treatment from this scan alone.",
            "treatment": "Inspect nearby leaves, isolate heavily affected leaves if present, and rescan with one clear leaf in bright even light.",
            "prevention": "Keep leaves dry, improve airflow, remove damaged leaves, and monitor the plant daily.",
            "urgency": "Review before treatment.",
            "next_steps": [
                "Retake one close, sharp photo of a single leaf.",
                "Compare symptoms on nearby leaves before applying chemicals.",
                "Ask a local agriculture expert if symptoms are spreading quickly.",
            ],
        }

    if disease.lower() == "healthy":
        return {
            "cause": f"{plant} appears healthy in this scan.",
            "impact": "No visible disease action is needed right now.",
            "treatment": "Continue normal watering, sunlight, and nutrition. Do not apply fungicide or pesticide without symptoms.",
            "prevention": "Check leaves weekly, avoid overwatering, and keep good spacing for airflow.",
            "urgency": "Low.",
            "next_steps": [
                "Keep monitoring new leaves.",
                "Water at soil level where possible.",
                "Rescan if spots, yellowing, curling, or mold appear.",
            ],
        }

    return {
        "cause": f"{disease} symptoms were detected on {plant}.",
        "impact": "The issue can spread or reduce leaf function if ignored.",
        "treatment": "Remove badly affected leaves, avoid wetting foliage, improve airflow, and use a crop-appropriate treatment recommended locally.",
        "prevention": "Use clean tools, remove infected debris, avoid overcrowding, and monitor nearby plants.",
        "urgency": "Act soon if symptoms are spreading.",
        "next_steps": [
            "Remove the most damaged leaves safely.",
            "Check nearby leaves for the same pattern.",
            "Rescan after 3 to 5 days or after treatment.",
        ],
    }


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


def action_plan(plant: str, disease: str, uncertain: bool = False) -> dict:
    """Generate structured guidance for the final diagnosis."""
    fallback = _fallback_action_plan(plant, disease, uncertain=uncertain)
    if uncertain:
        return fallback

    prompt = (
        f"Plant: {plant}\n"
        f"Diagnosis: {disease}\n\n"
        "Return ONLY valid JSON with exactly these keys: "
        "cause, impact, treatment, prevention, urgency, next_steps. "
        "Each value except next_steps must be one short practical sentence for a farmer. "
        "next_steps must be an array of exactly 3 short action strings. "
        "Do not mention alternative diseases. Do not add markdown."
    )

    try:
        payload = _extract_json_object(
            _complete(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=500,
            )
        )
    except Exception as exc:
        logger.warning("Groq action plan failed: %s", exc)
        return fallback

    plan = fallback.copy()
    for key in ("cause", "impact", "treatment", "prevention", "urgency"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            plan[key] = value.strip()

    next_steps = payload.get("next_steps")
    if isinstance(next_steps, list):
        cleaned = [str(item).strip() for item in next_steps if str(item).strip()]
        if cleaned:
            plan["next_steps"] = cleaned[:3]

    return plan


def _diagnosis_context_prompt(diagnosis_context: dict | None) -> str:
    if not diagnosis_context:
        return ""

    allowed = {
        "plant",
        "disease",
        "confidence",
        "status",
        "severity",
        "visible_symptoms",
        "quality_issues",
        "retake_recommended",
        "predicted_label",
        "model_version",
        "action_plan",
    }
    compact = {key: diagnosis_context.get(key) for key in allowed if diagnosis_context.get(key) not in (None, "", [])}
    if not compact:
        return ""

    return (
        "\n\nUse this diagnosis context from the latest image scan when answering follow-up questions. "
        "Treat it as scan evidence, not a guaranteed lab diagnosis. "
        "If status is uncertain, say that clearly and avoid pretending the disease is confirmed. "
        "Diagnosis context JSON:\n"
        f"{json.dumps(compact, ensure_ascii=True, sort_keys=True)}"
    )


def chat(
    messages: list[ChatMessage],
    disease: str | None = None,
    diagnosis_context: dict | None = None,
) -> str:
    """General conversational endpoint that preserves message history."""
    system = SYSTEM_PROMPT
    if disease:
        system += (
            f"\n\nThe model has detected the disease: {disease}."
            "\nYou must strictly explain only this disease."
        )
    system += _diagnosis_context_prompt(diagnosis_context)

    payload = [{"role": "system", "content": system}]
    payload.extend({"role": m.role, "content": m.content} for m in messages)

    return _complete(payload, temperature=0.3, max_tokens=768)
