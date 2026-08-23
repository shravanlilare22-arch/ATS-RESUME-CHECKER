def calculate_match_score(resume_keywords: list, jd_keywords: list) -> dict:
    """
    Resume keywords ko Job Description keywords se compare karta hai
    aur match score + missing keywords return karta hai
    """
    resume_set = set(resume_keywords)
    jd_set = set(jd_keywords)

    if not jd_set:
        return {
            "match_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "message": "Job description mein koi keyword nahi mila"
        }

    matched_keywords = resume_set.intersection(jd_set)
    missing_keywords = jd_set - resume_set

    match_score = round((len(matched_keywords) / len(jd_set)) * 100, 2)

    return {
        "match_score": match_score,
        "matched_keywords": list(matched_keywords),
        "missing_keywords": list(missing_keywords)
    }