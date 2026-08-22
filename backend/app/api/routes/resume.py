from fastapi import APIRouter, UploadFile, File
import shutil
import os
from app.services.parser import extract_resume_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    # User ne jo bhi file upload ki, uska naam automatically le lo
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # File ko temporarily save karo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parser ko call karo — koi hardcoding nahi
    try:
        extracted_text = extract_resume_text(file_path)
    except ValueError as e:
        return {"error": str(e)}

    return {
        "filename": file.filename,
        "extracted_text": extracted_text
    }