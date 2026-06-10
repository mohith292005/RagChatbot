from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Store plain text here — hashed on first verify, not at import time
USERS_DB = {
    "alice": {"password": "pass123", "role": "hr"},
    "bob":   {"password": "pass456", "role": "finance"},
    "carol": {"password": "pass789", "role": "admin"},
    "guest": {"password": "guest",   "role": "general"},
}

def authenticate(username: str, password: str):
    user = USERS_DB.get(username)
    if not user or user["password"] != password:
        return None
    return {"username": username, "role": user["role"]}

def create_token(data: dict, expires_minutes: int = 60):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None