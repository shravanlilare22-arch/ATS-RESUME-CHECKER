import hashlib
import random
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from app.db.visitor_crud import save_visitor, get_visitors


load_dotenv()

router = APIRouter()


# ============================================================
# EMAILJS CONFIGURATION
# ============================================================

EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY")


# ============================================================
# TEMPORARY OTP STORAGE
# ============================================================

otp_store = {}


# ============================================================
# REQUEST MODELS
# ============================================================

class VisitorRequest(BaseModel):
    name: str
    email: str


class SendOTPRequest(BaseModel):
    name: str
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


# ============================================================
# HELPER - HASH OTP
# ============================================================

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


# ============================================================
# SEND OTP
# ============================================================

@router.post("/send-otp")
async def send_otp(request: SendOTPRequest):

    name = request.name.strip()
    email = request.email.strip().lower()

    if not name or not email:
        raise HTTPException(
            status_code=400,
            detail="Name and email are required."
        )

    if not EMAILJS_SERVICE_ID:
        raise HTTPException(
            status_code=500,
            detail="EMAILJS_SERVICE_ID is missing."
        )

    if not EMAILJS_TEMPLATE_ID:
        raise HTTPException(
            status_code=500,
            detail="EMAILJS_TEMPLATE_ID is missing."
        )

    if not EMAILJS_PUBLIC_KEY:
        raise HTTPException(
            status_code=500,
            detail="EMAILJS_PUBLIC_KEY is missing."
        )

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # OTP expiry = 15 minutes
    expires_at = datetime.now(ZoneInfo("Asia/Kolkata")) + timedelta(
        minutes=15
    )

    # Store hashed OTP
    otp_store[email] = {
        "name": name,
        "otp": hash_otp(otp),
        "expires_at": expires_at,
        "attempts": 0,
    }

    # EmailJS template parameters
    template_params = {
        "email": email,
        "passcode": otp,
        "time": expires_at.strftime("%d %b %Y %I:%M %p"),
    }

    emailjs_payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "accessToken": EMAILJS_PRIVATE_KEY,
        "template_params": template_params,
    }

    try:
        response = requests.post(
            "https://api.emailjs.com/api/v1.0/email/send",
            json=emailjs_payload,
            timeout=15,
        )

        if response.status_code != 200:
            print("EmailJS Error:", response.text)

            # Remove OTP if email was not sent
            otp_store.pop(email, None)

            raise HTTPException(
                status_code=500,
                detail="Unable to send OTP email. Please try again."
            )

        print(f"OTP sent successfully to: {email}")

        return {
            "success": True,
            "message": "OTP sent successfully."
        }

    except requests.RequestException as error:
        print("EmailJS connection error:", error)

        otp_store.pop(email, None)

        raise HTTPException(
            status_code=500,
            detail="Unable to connect to email service."
        )


# ============================================================
# VERIFY OTP
# ============================================================

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):

    email = request.email.strip().lower()
    otp = request.otp.strip()

    if not email or not otp:
        raise HTTPException(
            status_code=400,
            detail="Email and OTP are required."
        )

    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(
            status_code=400,
            detail="OTP must be 6 digits."
        )

    stored_data = otp_store.get(email)

    if not stored_data:
        raise HTTPException(
            status_code=400,
            detail="OTP not found. Please request a new OTP."
        )

    # Check expiry
    current_time = datetime.now(ZoneInfo("Asia/Kolkata"))

    if current_time > stored_data["expires_at"]:
        otp_store.pop(email, None)

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP."
        )

    # Limit wrong attempts
    if stored_data["attempts"] >= 5:
        otp_store.pop(email, None)

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new OTP."
        )

    # Compare OTP
    if hash_otp(otp) != stored_data["otp"]:

        stored_data["attempts"] += 1

        remaining_attempts = 5 - stored_data["attempts"]

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid OTP. {remaining_attempts} "
                f"attempts remaining."
            )
        )

    # OTP verified
    otp_store.pop(email, None)

    return {
        "success": True,
        "verified": True,
        "name": stored_data["name"],
        "email": email,
        "message": "Email verified successfully."
    }


# ============================================================
# SAVE VISITOR
# ============================================================

@router.post("/visitor")
async def create_visitor(visitor: VisitorRequest):

    name = visitor.name.strip()
    email = visitor.email.strip().lower()

    if not name or not email:
        raise HTTPException(
            status_code=400,
            detail="Name and email are required."
        )

    # Save visitor in MongoDB
    visitor_id = save_visitor(name, email)

    return {
        "visitor_id": visitor_id,
        "message": "Visitor saved successfully."
    }


# ============================================================
# GET ALL VISITORS
# ============================================================

@router.get("/visitors")
async def list_visitors():

    return {
        "visitors": get_visitors()
    }