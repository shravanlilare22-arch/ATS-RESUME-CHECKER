import json
import os
import re

DICTIONARY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "data", "keyword_dictionaries", "technical_skills.json"
)


def load_keyword_dictionary() -> dict:
    """JSON file se saari reference skills load karta hai"""
    with open(DICTIONARY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_keywords(text: str) -> list:
    """
    Given text (resume ya job description) mein se
    dictionary ke saare matching keywords dhundta hai
    (word-boundary match — galat partial matches nahi honge)
    """
    text_lower = text.lower()
    dictionary = load_keyword_dictionary()

    found_keywords = []

    for category, keywords in dictionary.items():
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, text_lower):
                found_keywords.append(keyword)

    return list(set(found_keywords))