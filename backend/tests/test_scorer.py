import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.scorer import calculate_match_score


def test_perfect_match():
    resume_keywords = ["Python", "React", "Git"]
    jd_keywords = ["Python", "React", "Git"]
    result = calculate_match_score(resume_keywords, jd_keywords)
    assert result["match_score"] == 100.0
    assert result["missing_keywords"] == []


def test_partial_match():
    resume_keywords = ["Python", "React"]
    jd_keywords = ["Python", "React", "SQL", "Docker"]
    result = calculate_match_score(resume_keywords, jd_keywords)
    assert result["match_score"] == 50.0
    assert "SQL" in result["missing_keywords"]
    assert "Docker" in result["missing_keywords"]


def test_no_match():
    resume_keywords = ["Python"]
    jd_keywords = ["Java", "C++"]
    result = calculate_match_score(resume_keywords, jd_keywords)
    assert result["match_score"] == 0.0


def test_empty_jd_keywords():
    resume_keywords = ["Python"]
    jd_keywords = []
    result = calculate_match_score(resume_keywords, jd_keywords)
    assert result["match_score"] == 0
    assert "message" in result