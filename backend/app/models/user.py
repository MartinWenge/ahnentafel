from pydantic import BaseModel, Field
import bcrypt

class UserIn(BaseModel):
    username: str = Field(..., description="Nutzername")
    password: str = Field(..., description="Passwort")

class UserLocal(BaseModel):
    username: str
    password: str
    tenant: str

class UserOut(BaseModel):
    username: str = Field(..., description="Nutzername")
    tenant: str = Field(..., description="Kundenkennung")
    token: str = Field(..., description="JWT")

class Hasher():
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    @staticmethod
    def get_password_hash(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")