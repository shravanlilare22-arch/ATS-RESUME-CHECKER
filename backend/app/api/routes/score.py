from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from app.services.parser import extract_resume_text
from app.services.keyword_extractor import extract_keywords, extract_keywords_by_category
from app.services.scorer import calculate_match_score, calculate_category_scores

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        resume_text = extract_resume_text(file_path)
    except ValueError as e:
        return {"error": str(e)}

    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(job_description)
    overall_result = calculate_match_score(resume_keywords, jd_keywords)

    resume_by_category = extract_keywords_by_category(resume_text)
    jd_by_category = extract_keywords_by_category(job_description)
    category_scores = calculate_category_scores(resume_by_category, jd_by_category)

    return {
        "filename": file.filename,
        "resume_keywords": resume_keywords,
        "jd_keywords": jd_keywords,
        **overall_result,
        "category_breakdown": category_scores,
    }