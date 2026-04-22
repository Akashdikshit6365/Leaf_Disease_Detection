import json
import base64
import requests
from pathlib import Path

# Load .env values
env_path = Path(".env")
env_vars = {}
if env_path.exists():
    for line in env_path.read_text().split("\n"):
        if "=" in line and not line.strip().startswith("#"):
            key, val = line.split("=", 1)
            env_vars[key.strip()] = val.strip()

api_key = env_vars.get("GROQ_API_KEY")
vision_model = "llama-3.2-90b-vision-preview"  # Try vision model

print(f"Testing Groq vision API with model: {vision_model}")
print(f"API Key length: {len(api_key) if api_key else 0}")

# Create a simple test image
from PIL import Image
img = Image.new('RGB', (100, 100), color='red')
import io
buffered = io.BytesIO()
img.save(buffered, format="PNG")
img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

body = {
    "model": vision_model,
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What color is this image?"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_base64}"}},
            ],
        },
    ],
}

try:
    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
