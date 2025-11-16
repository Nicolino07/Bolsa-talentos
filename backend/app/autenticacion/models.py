from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
from typing import Optional, Dict, Any

# Pydantic models para request/response
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


class Usuario(Base):
    """
    Modelo SQLAlchemy para la tabla 'usuario' que gestiona la autenticación y los roles de usuarios.
    Los usuarios pueden ser personas o empresas, ligados a las tablas 'persona' o 'empresa'.

    Atributos:
        id_usuario (int): Identificador único del usuario (PK).
        dni (int, opcional): DNI de la persona asociada, FK a 'persona.dni'. Puede ser nulo.
        id_empresa (int, opcional): ID de la empresa asociada, FK a 'empresa.id_empresa'. Puede ser nulo.
        email (str): Email único para autenticación.
        password_hash (str): Hash de la contraseña del usuario.
        salt (str): Sal para la generación del hash de la contraseña.
        rol (str): Rol del usuario, por ejemplo, 'PERSONA', 'EMPRESA', 'ADMIN'.
        fecha_registro (datetime): Fecha de creación del usuario, asignada por defecto.
        ultimo_login (datetime, opcional): Última fecha/hora de login.
        activo (bool): Indica si el usuario está activo, por defecto True.
        intentos_login (int): Número de intentos fallidos de login.
        bloqueado_hasta (datetime, opcional): Fecha/hora hasta la cual el usuario está bloqueado.

    Relaciones:
        persona: Relación con el objeto Persona asociado.
        empresa: Relación con el objeto Empresa asociado.
    """
    __tablename__ = "usuario"
    
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    dni = Column(Integer, ForeignKey('persona.dni'), unique=True, nullable=True)
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa'), unique=True, nullable=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(100), nullable=False)
    rol = Column(String(20), nullable=False)  # PERSONA, EMPRESA, ADMIN
    fecha_registro = Column(DateTime, default=func.now())
    ultimo_login = Column(DateTime)
    activo = Column(Boolean, default=True)
    intentos_login = Column(Integer, default=0)
    bloqueado_hasta = Column(DateTime)
    
    
    def __repr__(self):
        return f"Usuario({self.id_usuario}: {self.email})"


class UsuarioBase(BaseModel):
    """
    Modelo base Pydantic para datos comunes en usuario,
    utilizados en request y response: email y rol.
    """
    email: str
    rol: str


class UsuarioCreate(UsuarioBase):
    """
    Modelo Pydantic para creación de usuario que incluye
    password y su validación de longitud mínima (6 caracteres).
    """
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v


class UsuarioLogin(BaseModel):
    """
    Modelo Pydantic para el login de usuario, requiere email y password.
    """
    email: str
    password: str


class UsuarioResponse(UsuarioBase):
    """
    Modelo Pydantic para respuesta de usuario que incluye
    datos adicionales como id, dni, id_empresa, fecha de registro y estado activo.
    """
    id_usuario: int
    dni: Optional[int] = None
    id_empresa: Optional[int] = None
    fecha_registro: datetime
    activo: bool


class Token(BaseModel):
    """
    Modelo Pydantic para la respuesta del token JWT que se
    emite después de la autenticación exitosa.
    
    Incluye:
        access_token: token JWT para autorización.
        token_type: tipo de token, usualmente 'bearer'.
        rol: rol del usuario.
        dni/id_empresa: opcionales para identificar usuario.
        usuario: diccionario opcional con datos adicionales del usuario.
    """
    access_token: str
    token_type: str
    rol: str
    dni: Optional[int] = None
    id_empresa: Optional[int] = None
    usuario: Optional[Dict[str, Any]] = None 


class PersonaRegistro(BaseModel):
    """
    Modelo Pydantic para registro de persona con validaciones para email y dni.

    Campos:
        dni: debe ser mayor a 10,000,000.
        email: debe contener '@' para ser válido.
        Otros campos personales básicos para registro.
    """
    dni: int
    nombre: str
    apellido: str
    email: str
    password: str
    fecha_nacimiento: str
    direccion: str
    ciudad: str
    provincia: str
    sexo: str
    telefono: Optional[str] = None
    
    @validator('dni')
    def validate_dni(cls, v):
        if v <= 10000000:
            raise ValueError('DNI debe ser mayor a 10,000,000')
        return v
    
    @validator('email')
    def validate_mail(cls, v):
        if '@' not in v:
            raise ValueError('El mail debe ser válido')
        return v


class EmpresaRegistro(BaseModel):
    """
    Modelo Pydantic para registro de empresa con validación sencilla de email.

    Campos:
        nombre, email, password, dirección, ciudad, provincia,
        teléfono opcional.
    """
    nombre: str
    email: str
    password: str
    direccion: str
    ciudad: str
    provincia: str
    telefono: Optional[str] = None

    @validator('email')
    def validate_mail(cls, v):
        if '@' not in v:
            raise ValueError('El mail debe ser válido')
        return v
