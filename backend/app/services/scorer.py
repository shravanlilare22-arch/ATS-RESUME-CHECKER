def calculate_match_score(resume_keywords: list, jd_keywords: list) -> dict:
    if not jd_keywords:
        return {"match_score": 0, "missing_keywords": [], "message": "No job description keywords provided"}
    resume_set = set(resume_keywords)
    jd_set = set(jd_keywords)
    matched = jd_set & resume_set
    missing = jd_set - resume_set
    match_score = round((len(matched) / len(jd_set)) * 100, 2)
    return {"match_score": match_score, "missing_keywords": list(missing)}