import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional

# Configuración
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-universidad")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña plain coincide con el hash"""
    try:
        # Asegurar que la contraseña esté en bytes
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        
        # Asegurar que el hash esté en bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Error en verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Genera hash de la contraseña"""
    try:
        # Asegurar que la contraseña esté en bytes
        if isinstance(password, str):
            password = password.encode('utf-8')
        
        # Generar salt y hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        
        # Devolver como string
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Error en get_password_hash: {e}")
        raise e

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verifica y decodifica token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str):
    """Obtiene usuario actual desde token"""
    payload = verify_token(token)
    if payload:
        return {
            "id_usuario": payload.get("id_usuario"),
            "email": payload.get("email"),
            "rol": payload.get("rol"),
            "dni": payload.get("dni"),
            "id_empresa": payload.get("id_empresa")
        }
    return None