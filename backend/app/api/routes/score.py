from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from app.services.parser import extract_resume_text
from app.services.keyword_extractor import extract_keywords
from app.services.scorer import calculate_match_score

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Resume file save karo
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Resume se text nikalo aur keywords extract karo
    try:
        resume_text = extract_resume_text(file_path)
    except ValueError as e:
        return {"error": str(e)}

    resume_keywords = extract_keywords(resume_text)

    # Job description se keywords extract karo
    jd_keywords = extract_keywords(job_description)

    # Score calculate karo
    result = calculate_match_score(resume_keywords, jd_keywords)

    return {
        "filename": file.filename,
        "resume_keywords": resume_keywords,
        "jd_keywords": jd_keywords,
        **result
    }