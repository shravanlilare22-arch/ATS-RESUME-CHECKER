import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-3.6-flash")


def analyze_resume_with_ai(resume_text: str, target_role: str) -> dict:
    """
    Resume text aur target role Gemini ko bhejta hai,
    aur structured JSON response (score + feedback + suggestions) wapas deta hai
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
  "suggestions": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>", "<specific actionable suggestion 3>"]
}}

Be honest and specific to the "{target_role}" role. Base the score on real ATS parsing factors (keyword relevance, structure, clarity) and how well this resume fits that specific role.

IMPORTANT: Respond ENTIRELY in clear, professional English. Do not use any other language or mixed language in your response.
"""

    try:
        response = model.generate_content(prompt)
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