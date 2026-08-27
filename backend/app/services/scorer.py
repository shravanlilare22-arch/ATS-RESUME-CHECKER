def calculate_match_score(resume_keywords: list, jd_keywords: list) -> dict:
    """
    Resume keywords ko Job Description keywords se compare karta hai
    aur overall match score + missing keywords return karta hai
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


CATEGORY_LABELS = {
    "programming_languages": "Programming Languages",
    "frontend": "Frontend",
    "backend": "Backend",
    "databases": "Databases",
    "cloud_devops": "Cloud & DevOps",
    "data_science_ml": "Data Science & ML",
    "mobile": "Mobile Development",
    "tools_version_control": "Tools & Version Control",
    "testing": "Testing",
    "concepts": "Concepts",
    "soft_skills": "Soft Skills",
    "certifications": "Certifications",
}


def calculate_category_scores(resume_by_category: dict, jd_by_category: dict) -> list:
    """
    Har category ke liye alag match score nikalta hai.
    """
    category_results = []

    for category, jd_keywords in jd_by_category.items():
        jd_set = set(jd_keywords)
        resume_set = set(resume_by_category.get(category, []))

        matched = resume_set.intersection(jd_set)
        score = round((len(matched) / len(jd_set)) * 100, 2) if jd_set else 0

        category_results.append({
            "category": CATEGORY_LABELS.get(category, category),
            "score": score,
            "matched": list(matched),
            "missing": list(jd_set - resume_set),
        })

    category_results.sort(key=lambda x: x["score"], reverse=True)
    return category_results