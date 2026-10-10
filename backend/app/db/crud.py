from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.db.database import analyses_collection, db


# ======================================================
# MONGODB COLLECTION
# ======================================================

usage_collection = db["analysis_usage"]

FREE_DAILY_LIMIT = 3


# Prevent duplicate daily usage documents for the same email.
usage_collection.create_index(
    [("email", 1), ("date", 1)],
    unique=True,
    name="unique_email_daily_usage",
)


# ======================================================
# RESUME ANALYSIS FUNCTIONS
# ======================================================

def save_analysis(filename: str, result: dict) -> str:
    """Save resume analysis to MongoDB."""
    document = {
        "filename": filename,
        "result": result,
        "created_at": datetime.now(timezone.utc),
    }

    inserted = analyses_collection.insert_one(document)
    return str(inserted.inserted_id)


def get_history(limit: int = 20) -> list:
    """Return the latest resume analyses."""
    items = []

    cursor = (
        analyses_collection.find({}, {"result.resume_text": 0})
        .sort("created_at", -1)
        .limit(limit)
    )

    for document in cursor:
        document["_id"] = str(document["_id"])
        items.append(document)

    return items


def get_analysis(analysis_id: str):
    """Retrieve a resume analysis by ID."""
    try:
        document = analyses_collection.find_one(
            {"_id": ObjectId(analysis_id)}
        )
    except (InvalidId, TypeError):
        return None

    if document:
        document["_id"] = str(document["_id"])

    return document


def delete_analysis(analysis_id: str) -> bool:
    """Delete a resume analysis by ID."""
    try:
        result = analyses_collection.delete_one(
            {"_id": ObjectId(analysis_id)}
        )
    except (InvalidId, TypeError):
        return False

    return result.deleted_count == 1


# ======================================================
# DAILY FREE USAGE
# ======================================================

def get_daily_usage(email: str, date_key: str) -> dict:
    """Get daily usage for a verified email."""
    normalized_email = email.strip().lower()

    return usage_collection.find_one(
        {
            "email": normalized_email,
            "date": date_key,
        }
    ) or {
        "email": normalized_email,
        "date": date_key,
        "free_count": 0,
    }


def _ensure_daily_usage_document(email: str, date_key: str) -> None:
    """Ensure a daily usage document exists."""
    normalized_email = email.strip().lower()
    now = datetime.now(timezone.utc)

    try:
        usage_collection.update_one(
            {
                "email": normalized_email,
                "date": date_key,
            },
            {
                "$setOnInsert": {
                    "email": normalized_email,
                    "date": date_key,
                    "free_count": 0,
                    "created_at": now,
                },
                "$set": {
                    "updated_at": now,
                },
            },
            upsert=True,
        )
    except DuplicateKeyError:
        # Another request may have created the document concurrently.
        pass


def reserve_analysis_access(email: str, date_key: str) -> dict:
    """
    Atomically reserve one free analysis.

    Maximum: 3 analyses per verified email per India-local date.
    No paid credits or subscription bypasses are supported.
    """
    normalized_email = email.strip().lower()

    if not normalized_email:
        raise ValueError("A verified email is required.")

    _ensure_daily_usage_document(normalized_email, date_key)

    usage = usage_collection.find_one_and_update(
        {
            "email": normalized_email,
            "date": date_key,
            "free_count": {"$lt": FREE_DAILY_LIMIT},
        },
        {
            "$inc": {"free_count": 1},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
        return_document=ReturnDocument.AFTER,
    )

    if usage is None:
        raise ValueError(
            "You have used all 3 free resume analyses for today. "
            "Please try again tomorrow."
        )

    return {
        "type": "free",
        "email": normalized_email,
        "date": date_key,
    }


def release_analysis_access(reservation: dict) -> bool:
    """
    Return a reserved free slot if the analysis fails.
    Call only when analysis did not complete successfully.
    """
    if not reservation or reservation.get("type") != "free":
        return False

    email = reservation.get("email", "").strip().lower()
    date_key = reservation.get("date")

    if not email or not date_key:
        return False

    result = usage_collection.update_one(
        {
            "email": email,
            "date": date_key,
            "free_count": {"$gt": 0},
        },
        {
            "$inc": {"free_count": -1},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )

    return result.modified_count == 1


def get_usage_status(email: str, date_key: str) -> dict:
    """Return the daily free-analysis usage status."""
    usage = get_daily_usage(email, date_key)
    used = int(usage.get("free_count", 0))

    return {
        "date": date_key,
        "free_limit": FREE_DAILY_LIMIT,
        "free_used": used,
        "free_remaining": max(0, FREE_DAILY_LIMIT - used),
    }