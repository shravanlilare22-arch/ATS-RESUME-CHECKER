import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai_analyzer import analyze_resume_with_ai


def test_analyze_resume_with_ai_returns_dict():
    """Function ek dictionary return karta hai (structure check, real API call nahi karte CI mein)"""
    result = analyze_resume_with_ai("Sample resume text", "Software Engineer")
    assert isinstance(result, dict)