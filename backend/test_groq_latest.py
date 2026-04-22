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

# Test latest models
models_to_test = [
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma-7b-it",
    "gemma2-9b-it"
]

print(f"API Key length: {len(api_key) if api_key else 0}\n")

for model in models_to_test:
    print(f"Testing model: {model}")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    body = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": "Hello, what is your name?",
            },
        ],
    }
    
    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=10)
        print(f"  Status: {response.status_code}")
        resp_text = response.text[:300]
        print(f"  Response: {resp_text}")
    except Exception as e:
        print(f"  Error: {e}")
    print()
