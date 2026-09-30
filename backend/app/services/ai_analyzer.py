import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.6-flash"


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
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
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


def chat_about_resume(resume_text: str, target_role: str, chat_history: list, new_message: str) -> dict:
    """
    User ke resume ke context mein follow-up sawaal ka jawab deta hai.
    chat_history ek list hai [{"role": "user"/"ai", "content": "..."}] format mein,
    taaki AI ko poori conversation yaad rahe.
    """

    history_text = ""
    for msg in chat_history:
        speaker = "Candidate" if msg["role"] == "user" else "You (AI Assistant)"
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
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        answer = response.text.strip()
        return {"reply": answer}

    except Exception as e:
        return {"error": f"Chat failed: {str(e)}"}