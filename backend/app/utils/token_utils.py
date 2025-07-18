import secrets
import hashlib

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)  # Send to user

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()  # Store in Redis