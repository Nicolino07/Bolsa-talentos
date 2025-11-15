from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from typing import Optional, Dict, Any

# Pydantic models para request/response
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


class Usuario(Base):
    """
    Modelo para gestionar autenticación y roles de usuarios (personas o empresas)
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
    
    # Relaciones
    persona = relationship("Persona", back_populates="usuario")
    empresa = relationship("Empresa", back_populates="usuario")
    
    def __repr__(self):
        return f"Usuario({self.id_usuario}: {self.email})"


class UsuarioBase(BaseModel):
    email: str
    rol: str

class UsuarioCreate(UsuarioBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v

class UsuarioLogin(BaseModel):
    email: str
    password: str

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    dni: Optional[int] = None
    id_empresa: Optional[int] = None
    fecha_registro: datetime
    activo: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str
    dni: Optional[int] = None
    id_empresa: Optional[int] = None
    usuario: Optional[Dict[str, Any]] = None 

class PersonaRegistro(BaseModel):
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