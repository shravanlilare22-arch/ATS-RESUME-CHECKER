import hashlib
from datetime import datetime, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.database import db


router_sessions = db["auth_sessions"]

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Bearer token validate karta hai aur authenticated user return karta hai.
    """

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Please verify your email and log in first.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    now = datetime.now(timezone.utc)

    session = router_sessions.find_one(
        {
            "token_hash": token_hash,
            "revoked": False,
            "expires_at": {"$gt": now},
        }
    )

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Your session is invalid or expired. Please verify your email again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = session.get("email", "").strip().lower()

    if not email:
        raise HTTPException(
            status_code=401,
            detail="The authenticated session has no valid email.",
        )

    return {
        "email": email,
        "name": session.get("name", ""),
    }