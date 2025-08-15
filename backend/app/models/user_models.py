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

    
class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str
    
class UserInfoRequest(BaseModel):
    message:str