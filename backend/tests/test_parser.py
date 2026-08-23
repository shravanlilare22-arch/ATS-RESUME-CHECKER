import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.parser import extract_resume_text


def test_extract_resume_text_invalid_extension():
    """Unsupported file type ke liye error aana chahiye"""
    try:
        extract_resume_text("some_file.txt")
        assert False, "ValueError expected but not raised"
    except ValueError:
        assert True