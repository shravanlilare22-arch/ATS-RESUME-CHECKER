from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from app.services.parser import extract_resume_text
from app.services.ai_analyzer import analyze_resume_with_ai
from app.db.crud import save_analysis

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):
    target_role = target_role.strip()

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        resume_text = extract_resume_text(file_path)
    except ValueError as e:
        return {"error": str(e)}

    result = analyze_resume_with_ai(resume_text, target_role)

    # AI fail hua to MongoDB me save mat karo, seedha error wapas bhejo
    if "error" in result:
        return result

    response = {
        "filename": file.filename,
        "target_role": target_role,
        "resume_text": resume_text,
        **result
    }

    # MongoDB me save karo
    try:
        response["analysis_id"] = save_analysis(file.filename, response)
    except Exception as e:
        print("MongoDB save error:", e)

    return response