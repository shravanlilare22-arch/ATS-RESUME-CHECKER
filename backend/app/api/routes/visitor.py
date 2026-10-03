from fastapi import APIRouter
from pydantic import BaseModel

from app.db.visitor_crud import save_visitor, get_visitors
from app.services.email_service import send_welcome_email


router = APIRouter()


class VisitorRequest(BaseModel):
    name: str
    email: str


@router.post("/visitor")
async def create_visitor(visitor: VisitorRequest):
    name = visitor.name.strip()
    email = visitor.email.strip()

    if not name or not email:
        return {"error": "Name and email are required."}

    # Save visitor in MongoDB
    visitor_id = save_visitor(name, email)

    # Send welcome email
    send_welcome_email(email, name)

    return {
        "visitor_id": visitor_id,
        "message": "Visitor saved successfully and welcome email processed."
    }


@router.get("/visitors")
async def list_visitors():
    return {"visitors": get_visitors()}