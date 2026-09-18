import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv(override=True)

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=30000)
)


def classify_ticket(subject: str, description: str):
    prompt = f"""
You are classifying a customer support ticket.

Subject:
{subject}

Description:
{description}

Return ONLY valid JSON.

Allowed categories:
Technical, Billing, Account, General

Allowed priorities:
Low, Medium, High

Required format:
{{
    "category": "Technical",
    "priority": "High",
    "summary": "One-line summary of the customer's issue."
}}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                thinking_level="minimal"
            )
        )
    )

    return json.loads(response.text)


if __name__ == "__main__":
    result = classify_ticket(
        "Payment failed",
        "My money was deducted but my order was not created."
    )

    print(result)