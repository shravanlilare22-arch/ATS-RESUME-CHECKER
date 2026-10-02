from datetime import datetime, timezone
from app.db.database import visitors_collection


def save_visitor(name: str, email: str) -> str:
    """Naam aur email save karta hai, id return karta hai."""
    doc = {
        "name": name,
        "email": email,
        "created_at": datetime.now(timezone.utc),
    }
    inserted = visitors_collection.insert_one(doc)
    return str(inserted.inserted_id)


def get_visitors(limit: int = 200) -> list:
    """Saare visitors ki list, latest pehle."""
    items = []
    cursor = visitors_collection.find({}).sort("created_at", -1).limit(limit)
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items