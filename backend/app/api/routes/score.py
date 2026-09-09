from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from app.services.parser import extract_resume_text
from app.services.ai_analyzer import analyze_resume_with_ai

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        resume_text = extract_resume_text(file_path)
    except ValueError as e:
        return {"error": str(e)}

    result = analyze_resume_with_ai(resume_text, target_role)

    return {
        "filename": file.filename,
        "target_role": target_role,
        **result
    }