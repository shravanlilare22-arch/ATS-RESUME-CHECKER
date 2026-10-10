import hashlib
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db.database import db
from app.db.visitor_crud import save_visitor, get_visitors

load_dotenv()

router = APIRouter()

EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY")

otp_store = {}
sessions_collection = db["auth_sessions"]


# Request Models
class VisitorRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str


class SendOTPRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


# Helper Functions
def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str) -> bool:
    email = normalize_email(email)
    pattern = r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$"
    return bool(re.fullmatch(pattern, email))


def hash_value(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def create_session(email: str, name: str) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)

    sessions_collection.insert_one({
        "token_hash": hash_value(token),
        "email": normalize_email(email),
        "name": name.strip(),
        "created_at": now,
        "expires_at": now + timedelta(days=30),
        "revoked": False,
    })

    return token


def send_emailjs_otp(name: str, email: str, otp: str):
    if not all([
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        EMAILJS_PUBLIC_KEY,
    ]):
        raise HTTPException(
            status_code=500,
            detail="EmailJS configuration is incomplete. Check backend .env.",
        )

    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": {
            "name": name,
            "email": email,
            "to_name": name,
            "to_email": email,
            "otp": otp,
            "passcode": (otp),
            "time": "10 minutes",
        },
    }

    if EMAILJS_PRIVATE_KEY:
        payload["accessToken"] = EMAILJS_PRIVATE_KEY

    try:
        response = requests.post(
            "https://api.emailjs.com/api/v1.0/email/send",
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="OTP email failed. Check EmailJS settings and template.",
        )


# Send OTP
@router.post("/send-otp")
def send_otp(request: SendOTPRequest):
    name = request.name.strip()
    email = normalize_email(request.email)

    if not name:
        raise HTTPException(status_code=400, detail="Please enter your name.")

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    otp = f"{secrets.randbelow(1000000):06d}"

    send_emailjs_otp(name, email, otp)

    otp_store[email] = {
        "name": name,
        "otp_hash": hash_value(otp),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "attempts": 0,
    }

    return {
        "success": True,
        "message": "OTP sent successfully. Check your email.",
    }


# Verify OTP
@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    email = normalize_email(request.email)
    entered_otp = request.otp.strip()

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    if not re.fullmatch(r"\d{6}", entered_otp):
        raise HTTPException(status_code=400, detail="Enter the 6-digit OTP.")

    record = otp_store.get(email)

    if not record:
        raise HTTPException(
            status_code=400,
            detail="OTP not found. Request a new OTP.",
        )

    if datetime.now(timezone.utc) >= record["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Request a new OTP.",
        )

    if record["attempts"] >= 5:
        otp_store.pop(email, None)
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Request a new OTP.",
        )

    if not secrets.compare_digest(
        hash_value(entered_otp),
        record["otp_hash"],
    ):
        record["attempts"] += 1
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    name = record["name"]

    try:
        access_token = create_session(email, name)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not create login session.",
        )

    otp_store.pop(email, None)

    try:
        save_visitor(name, email)
    except Exception:
        pass

    return {
        "verified": True,
        "message": "Email verified successfully.",
        "name": name,
        "email": email,
        "access_token": access_token,
        "token_type": "bearer",
    }


# Save Visitor
@router.post("/visitor")
def create_visitor(request: VisitorRequest):
    name = request.name.strip()
    email = normalize_email(request.email)

    if not name:
        raise HTTPException(status_code=400, detail="Please enter your name.")

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address.")

    try:
        save_visitor(name, email)
        return {
            "success": True,
            "message": "Visitor saved successfully.",
        }
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not save visitor.",
        )


# Get Visitors
@router.get("/visitors")
def list_visitors():
    try:
        return get_visitors()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve visitors.",
        )