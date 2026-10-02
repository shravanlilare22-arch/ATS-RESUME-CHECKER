from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import score, chat, history, visitor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(visitor.router)


@app.get("/")
def read_root():
    return {"message": "ATS Resume Checker API is running"}