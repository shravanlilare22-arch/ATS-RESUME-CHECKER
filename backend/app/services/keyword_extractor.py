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
    Given text mein se dictionary ke saare matching keywords dhundta hai
    (flat list — sabhi categories mila ke)
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


def extract_keywords_by_category(text: str) -> dict:
    """
    Given text mein se dictionary ke matching keywords dhundta hai,
    lekin category-wise group karke deta hai
    """
    text_lower = text.lower()
    dictionary = load_keyword_dictionary()

    result = {}
    for category, keywords in dictionary.items():
        matched = []
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matched.append(keyword)
        if matched:
            result[category] = list(set(matched))

    return result