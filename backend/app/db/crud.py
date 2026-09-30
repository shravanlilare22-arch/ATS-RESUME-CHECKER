from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.db.database import analyses_collection


def save_analysis(filename: str, result: dict) -> str:
    """Resume ka result MongoDB me save karta hai, aur uski id return karta hai."""
    doc = {
        "filename": filename,
        "result": result,
        "created_at": datetime.now(timezone.utc),
    }
    inserted = analyses_collection.insert_one(doc)
    return str(inserted.inserted_id)


def get_history(limit: int = 20) -> list:
    """Latest analyses ki list (sabse nayi pehle). resume_text list me nahi aata, taaki response halka rahe."""
    items = []
    cursor = (
        analyses_collection.find({}, {"result.resume_text": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


def get_analysis(analysis_id: str):
    """Ek analysis poori detail ke saath. Na mile ya id galat ho to None."""
    try:
        doc = analyses_collection.find_one({"_id": ObjectId(analysis_id)})
    except InvalidId:
        return None
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


def delete_analysis(analysis_id: str) -> bool:
    """Ek analysis delete karta hai. Delete hua to True, nahi mila ya id galat to False."""
    try:
        deleted = analyses_collection.delete_one({"_id": ObjectId(analysis_id)})
    except InvalidId:
        return False
    return deleted.deleted_count == 1