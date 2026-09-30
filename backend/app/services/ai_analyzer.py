import os
import json
import time
import random
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Key na ho (jaise CI me) to import pe crash nahi hoga
client = genai.Client(api_key=api_key) if api_key else None


# Primary model + fallback models
MODEL_NAMES = [
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
]


def generate_ai_response(prompt: str, json_mode: bool = False):
    """
    Gemini response generate karta hai.
    Agar 503/429 temporary error aaye to retry + fallback model use karega.
    """

    if client is None:
        raise Exception("GEMINI_API_KEY is not set")

    last_error = None

    for model_name in MODEL_NAMES:

        # Har model ke liye multiple attempts
        for attempt in range(3):

            try:

                config = None

                if json_mode:
                    config = types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )

                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )

                return response

            except Exception as e:

                last_error = e
                error_text = str(e)

                # Temporary Gemini errors
                if "503" in error_text or "UNAVAILABLE" in error_text:

                    # Exponential backoff
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(wait_time)
                    continue

                if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:

                    wait_time = 3 + (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(wait_time)
                    continue

                # Other errors ke liye current model se next model par jayega
                break

    # Agar sabhi models fail ho gaye
    raise last_error


def analyze_resume_with_ai(resume_text: str, target_role: str) -> dict:
    """
    Resume text aur target role Gemini ko bhejta hai,
    aur structured JSON response (score + feedback + suggestions + category scores) wapas deta hai
    """

    prompt = f"""
You are an expert ATS (Applicant Tracking System) analyst and professional resume reviewer.

A candidate is targeting this role: "{target_role}"

Here is their resume text (extracted from PDF/DOCX):
---
{resume_text}
---

Analyze this resume specifically for the "{target_role}" role and return a JSON object with EXACTLY this structure (no extra text, no markdown, just raw JSON):

{{
  "ats_score": <number between 0-100>,
  "overall_verdict": "<one short sentence: is this resume good, average, or weak for this role>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<skill or keyword missing for this role>", "..."],
  "suggestions": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>", "<specific actionable suggestion 3>"],
  "category_scores": [
    {{"category": "Technical Skills", "score": <0-100>, "reason": "<one short sentence>"}},
    {{"category": "Experience Relevance", "score": <0-100>, "reason": "<one short sentence>"}},
    {{"category": "Formatting & ATS Compatibility", "score": <0-100>, "reason": "<one short sentence>"}},
    {{"category": "Communication & Soft Skills", "score": <0-100>, "reason": "<one short sentence>"}}
  ]
}}

Be honest and specific to the "{target_role}" role. Base the score on real ATS parsing factors (keyword relevance, structure, clarity) and how well this resume fits that specific role. Score each category independently based on what's actually visible in the resume.

IMPORTANT: Respond ENTIRELY in clear, professional English. Do not use any other language or mixed language in your response.
"""

    try:

        response = generate_ai_response(
            prompt,
            json_mode=True
        )

        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            raw_text = raw_text.replace("json", "", 1).strip()

        result = json.loads(raw_text)

        return result

    except json.JSONDecodeError:

        return {
            "error": "AI response could not be parsed. Please try again."
        }

    except Exception as e:

        return {
            "error": f"AI analysis failed: {str(e)}"
        }


def chat_about_resume(
    resume_text: str,
    target_role: str,
    chat_history: list,
    new_message: str
) -> dict:

    """
    User ke resume ke context mein follow-up sawaal ka jawab deta hai.
    chat_history ek list hai [{"role": "user"/"ai", "content": "..."}] format mein,
    taaki AI ko poori conversation yaad rahe.
    """

    history_text = ""

    for msg in chat_history:

        speaker = (
            "Candidate"
            if msg["role"] == "user"
            else "You (AI Assistant)"
        )

        history_text += f"{speaker}: {msg['content']}\n"

    prompt = f"""
You are a helpful, expert resume and career advisor AI assistant. You have already analyzed a candidate's resume for the role: "{target_role}".

Here is the candidate's resume text for your reference:
---
{resume_text}
---

Here is the conversation so far between you and the candidate:
---
{history_text if history_text else "(This is the first message in the conversation.)"}
---

The candidate just asked: "{new_message}"

Respond helpfully and specifically, using the resume content and the target role as context. Keep your answer concise (2-5 sentences unless the question needs more detail), practical, and actionable. Respond in plain text only (no JSON, no markdown formatting, no code blocks) — just a natural, conversational answer.

IMPORTANT: Respond ENTIRELY in clear, professional English.
"""

    try:

        response = generate_ai_response(
            prompt,
            json_mode=False
        )

        answer = response.text.strip()

        return {
            "reply": answer
        }

    except Exception as e:

        return {
            "error": f"Chat failed: {str(e)}"
        }


def calculate_match_score(resume_keywords: list, jd_keywords: list) -> dict:

    if not jd_keywords:

        return {
            "match_score": 0,
            "missing_keywords": [],
            "message": "No job description keywords provided"
        }

    resume_set = set(resume_keywords)

    jd_set = set(jd_keywords)

    matched = jd_set & resume_set

    missing = jd_set - resume_set

    match_score = round(
        (len(matched) / len(jd_set)) * 100,
        2
    )

    return {
        "match_score": match_score,
        "missing_keywords": list(missing)
    }