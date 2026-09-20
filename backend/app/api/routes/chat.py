from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_analyzer import chat_about_resume

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    resume_text: str
    target_role: str
    chat_history: list[ChatMessage]
    new_message: str


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    history_as_dicts = [{"role": m.role, "content": m.content} for m in request.chat_history]

    result = chat_about_resume(
        resume_text=request.resume_text,
        target_role=request.target_role,
        chat_history=history_as_dicts,
        new_message=request.new_message
    )

    return result