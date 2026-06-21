"""Helpers for converting model labels into UI-friendly plant and disease names."""
from __future__ import annotations

import re


def pretty_name(value: str) -> str:
    cleaned = value.replace("___", " ").replace("_", " ").replace(",", ", ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" _")
    return cleaned.title()


def split_label(label: str) -> tuple[str, str]:
    if "___" in label:
        plant_raw, disease_raw = label.split("___", 1)
    else:
        plant_raw, disease_raw = label, "Unknown"

    plant = pretty_name(plant_raw)
    disease = "Healthy" if disease_raw.lower() == "healthy" else pretty_name(disease_raw)
    return plant, disease


def combined_label(label: str) -> str:
    plant, disease = split_label(label)
    if disease.lower() == "healthy":
        return f"{plant} - Healthy"
    return f"{plant} - {disease}"
