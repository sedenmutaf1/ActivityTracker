from pydantic import BaseModel
from datetime import datetime

class UserRegister(BaseModel):
    username: str
    password: str
    email: str
    created_at: datetime

class UserLogin(BaseModel):
    username: str
    password: str

