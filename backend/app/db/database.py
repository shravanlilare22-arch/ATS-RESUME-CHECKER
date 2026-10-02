import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

# backend/.env ko seedha path se load karo
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("WARNING: MONGO_URI .env file me nahi mila, local MongoDB try hoga")
    MONGO_URI = "mongodb://localhost:27017"

# MongoClient turant connect nahi karta, isliye import pe crash nahi hoga
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["ats_resume_checker"]
analyses_collection = db["analyses"]
visitors_collection = db["visitors"]