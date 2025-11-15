import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional


# Configuración principal para JWT y hashing
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-universidad")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si la contraseña en texto plano coincide con el hash almacenado.

    Argumentos:
        plain_password (str): Contraseña en texto plano.
        hashed_password (str): Contraseña hasheada para comparar.

    Retorna:
        bool: True si la contraseña coincide, False en caso contrario.
    
    Maneja internamente errores retornando False si ocurre excepción.
    """
    try:
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Error en verify_password: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para la contraseña usando bcrypt.

    Argumentos:
        password (str): Contraseña en texto plano.

    Retorna:
        str: Contraseña hasheada en formato UTF-8 para almacenar.
    
    Lanza excepción si ocurre error durante el hashing.
    """
    try:
        if isinstance(password, str):
            password = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Error en get_password_hash: {e}")
        raise e


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un token JWT firmado que incluye información del usuario y expiración.

    Argumentos:
        data (dict): Datos a incluir en el payload del token (ej. id_usuario, email).
        expires_delta (timedelta, opcional): Duración de validez del token.

    Retorna:
        str: Token JWT codificado y firmado.
    
    Usa configuración por defecto para expiración si no se provee expires_delta.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """
    Verifica y decodifica un token JWT, validando firma y expiración.

    Argumentos:
        token (str): Token JWT a verificar.

    Retorna:
        dict o None: Payload decodificado si token válido, None si inválido.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(token: str):
    """
    Obtiene la información del usuario actual a partir de un token JWT.

    Argumentos:
        token (str): Token JWT que representa al usuario autenticado.

    Retorna:
        dict o None: Datos de usuario extraídos del token, o None si inválido.
    """
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
