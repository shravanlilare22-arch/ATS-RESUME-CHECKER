from fastapi import FastAPI
from app.api.routes import resume

app = FastAPI()

app.include_router(resume.router)

@app.get("/")
def read_root():
    return {"message": "ATS Resume Checker API is running"}