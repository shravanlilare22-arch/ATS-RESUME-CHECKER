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
    """Latest analyses ki list (sabse nayi pehle)."""
    items = []
    for doc in analyses_collection.find().sort("created_at", -1).limit(limit):
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


def get_analysis(analysis_id: str):
    """Ek analysis id se nikalta hai. Na mile ya id galat ho to None."""
    try:
        doc = analyses_collection.find_one({"_id": ObjectId(analysis_id)})
    except InvalidId:
        return None
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc