import bcrypt
# Utility function to hash password using bcrypt
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

# Utility function to check hashed password
def check_password(hashed_password: str, candidate_password: str) -> bool:
    return bcrypt.checkpw(candidate_password.encode("utf-8"), hashed_password.encode("utf-8"))
