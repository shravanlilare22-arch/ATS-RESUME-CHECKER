import os
import tempfile
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.api.deps import get_current_user
from app.db.crud import (
    FREE_DAILY_LIMIT,
    get_usage_status,
    release_analysis_access,
    reserve_analysis_access,
    save_analysis,
)
from app.services.ai_analyzer import analyze_resume_with_ai
from app.services.parser import extract_resume_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def get_india_date_key() -> str:
    """Get the current date in India."""
    return datetime.now(INDIA_TIMEZONE).date().isoformat()


def friendly_ai_error(raw_error) -> str:
    """AI ka technical error user ko seedha nahi dikhate, uska simple version bhejte hain."""
    text = str(raw_error).lower()

    if "429" in text or "quota" in text or "rate limit" in text or "resource_exhausted" in text:
        return "Our AI is getting a lot of requests right now. Please try again in a minute."

    if "api_key" in text or "api key" in text or "401" in text or "403" in text or "permission" in text:
        return "The AI service isn't set up correctly right now. Please try again later."

    if "404" in text or "no longer available" in text or "not found" in text:
        return "The AI model is temporarily unavailable. Please try again later."

    if "could not be parsed" in text:
        return "The AI sent back a response we couldn't read. Please try again."

    if (
        "timeout" in text
        or "deadline" in text
        or "503" in text
        or "overloaded" in text
        or "unavailable" in text
    ):
        return "The AI service is busy right now. Please try again in a moment."

    return "Something went wrong while analyzing your resume. Please try again."


# ======================================================
# GET DAILY FREE USAGE
# GET /usage
# ======================================================

@router.get("/usage")
async def get_daily_free_usage(
    current_user: dict = Depends(get_current_user),
):
    email = current_user.get("email", "").strip().lower()

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Please verify your email and log in again.",
        )

    date_key = get_india_date_key()

    try:
        usage = get_usage_status(email, date_key)

        return {
            "success": True,
            "date": date_key,
            "free_limit": FREE_DAILY_LIMIT,
            "free_used": usage["free_used"],
            "free_remaining": usage["free_remaining"],
            "message": (
                f"You have {usage['free_remaining']} free resume "
                f"analyses remaining today."
                if usage["free_remaining"] > 0
                else (
                    "You have used all 3 free analyses for today. "
                    "Please try again tomorrow."
                )
            ),
        }

    except Exception as exc:
        print("Usage status error:", str(exc))
        raise HTTPException(
            status_code=500,
            detail="Unable to load your daily usage. Please try again.",
        ) from exc


# ======================================================
# ANALYZE RESUME
# POST /analyze
# ======================================================

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    email = current_user.get("email", "").strip().lower()

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Your session is invalid. Please verify your email again.",
        )

    target_role = target_role.strip()

    if not target_role:
        raise HTTPException(
            status_code=400,
            detail="Please enter the target job role.",
        )

    if len(target_role) < 2 or len(target_role) > 60:
        raise HTTPException(
            status_code=400,
            detail="Target role must be between 2 and 60 characters.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume file.",
        )

    original_filename = os.path.basename(file.filename)
    extension = os.path.splitext(original_filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a PDF, DOCX, or TXT file.",
        )

    date_key = get_india_date_key()

    # Reserve one free analysis before processing.
    try:
        reservation = reserve_analysis_access(email, date_key)

    except ValueError as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print("Analysis access reservation error:", str(exc))
        raise HTTPException(
            status_code=500,
            detail="Unable to verify your free analysis allowance.",
        ) from exc

    temp_path = None
    access_committed = False

    try:
        # Save upload using a generated temporary filename.
        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=extension,
            prefix="resume_",
            dir=UPLOAD_DIR,
            delete=False,
        ) as temp_file:
            temp_path = temp_file.name
            total_size = 0

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Resume file must be 10 MB or smaller.",
                    )

                temp_file.write(chunk)

        if total_size == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        # Extract resume text.
        try:
            resume_text = extract_resume_text(temp_path)

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except Exception as exc:
            print("Resume parse error:", str(exc))
            raise HTTPException(
                status_code=400,
                detail="We couldn't read this file. It may be corrupted or password-protected.",
            ) from exc

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text was found in the resume. If it's a scanned "
                    "or image-based PDF, please upload a text-based PDF or DOCX."
                ),
            )

        # Run the existing AI analyzer.
        result = analyze_resume_with_ai(
            resume_text,
            target_role,
        )

        if not isinstance(result, dict):
            raise HTTPException(
                status_code=502,
                detail="The resume analysis service returned an invalid response.",
            )

        if "error" in result:
            print("AI analyzer error:", str(result["error"]))
            raise HTTPException(
                status_code=502,
                detail=friendly_ai_error(result["error"]),
            )

        response = {
            "filename": original_filename,
            "target_role": target_role,
            "resume_text": resume_text,
            **result,
        }

        # Save successful analysis to MongoDB.
        try:
            response["analysis_id"] = save_analysis(
                original_filename,
                response,
            )

        except Exception as exc:
            print("MongoDB save error:", str(exc))
            raise HTTPException(
                status_code=500,
                detail="Analysis completed, but we could not save the result.",
            ) from exc

        # Mark the reservation as consumed.
        access_committed = True

        # Add the latest available daily usage status.
        try:
            usage = get_usage_status(email, date_key)

            response["usage"] = {
                "free_limit": FREE_DAILY_LIMIT,
                "free_used": usage["free_used"],
                "free_remaining": usage["free_remaining"],
                "date": date_key,
            }

        except Exception as exc:
            # Analysis is already saved; don't turn success into failure.
            print("Unable to attach usage status:", str(exc))

        return response

    except HTTPException:
        raise

    except Exception as exc:
        print("Resume analysis error:", str(exc))
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again.",
        ) from exc

    finally:
        # Release the reserved slot if processing failed.
        if not access_committed:
            try:
                release_analysis_access(reservation)
            except Exception as exc:
                print("Analysis access release error:", str(exc))

        # Remove the temporary upload.
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError as exc:
                print("Temporary file cleanup error:", str(exc))

        await file.close()