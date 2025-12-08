from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from utility.settings import MySettings

SECRET_KEY = MySettings.SECRET_KEY
ALGORITHM = MySettings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = MySettings.ACCESS_TOKEN_EXPIRE_MINUTES

# Definiert das Schema, wie FastAPI das Token aus dem Header extrahiert:
# Erwartet einen Header: Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Dekodiert und validiert ein JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiges Token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    token_payload = decode_access_token(token)
    
    tenant_id: str = token_payload.get("tenant")
    
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiges Token-Payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"tenant": tenant_id}

# Typalias für die Verwendung in Endpunkten, als Argument an alle Endpunkt-Funktionen einfügen
CurrentUser = Annotated[dict, Depends(get_current_user)]
