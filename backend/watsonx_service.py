import os
import requests

# Reads from Render environment variables or local .env
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

# IBM Granite Foundation Model via Hugging Face Router
MODEL_ID = "ibm-granite/granite-3.0-8b-instruct"
API_URL = "https://router.huggingface.co/v1/chat/completions"

def query_watsonx_agent(prompt: str, fallback_code: str = "") -> str:
    """
    Calls IBM's Granite Foundation Model via Hugging Face Serverless API.
    Zero-cost, no credit card or payment authorization required.
    """
    if not HF_API_TOKEN:
        print("[IBM Granite]: No HF_API_TOKEN configured. Using local AST rules.")
        return fallback_code

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "system",
                "content": "You are a code optimization and security bot. Return ONLY valid, executable Python code with no markdown backticks and no conversational prose."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.1
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=35)
        if response.status_code == 200:
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"].strip()

            # Clean out any accidental markdown fences
            if "```python" in raw_text:
                raw_text = raw_text.split("```python")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()

            return raw_text
        else:
            print(f"[IBM Granite Error]: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[IBM Granite Network Error]: {e}")

    return fallback_code