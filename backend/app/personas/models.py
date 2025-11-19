from sqlalchemy import Column, Integer, String, Date, Boolean
from app.database import Base
from pydantic import BaseModel, validator, field_serializer
from typing import Optional
from datetime import date, datetime


# MODELO SQLALCHEMY
class Persona(Base):
    __tablename__ = "persona"
    
    dni = Column(Integer, primary_key=True)
    apellido = Column(String(100), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    direccion = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    sexo = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    telefono = Column(String(30))
    activa = Column(Boolean, default=True)


    def __repr__(self):
        return f"Persona({self.dni}: {self.nombre} {self.apellido})"

# SCHEMAS PYDANTIC
class PersonaCreate(BaseModel):
    dni: int
    apellido: str
    nombre: str
    fecha_nacimiento: str  # Date como string para la API
    direccion: str
    ciudad: str
    provincia: str
    sexo: str
    email: str
    telefono: Optional[str] = None

class PersonaUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    email: Optional[str] = None
    
    # 🔥 AGREGAR VALIDATOR PARA CONVERTIR STRINGS VACÍOS A None
    @validator('*', pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v


class PersonaResponse(BaseModel):
    dni: int
    apellido: str
    nombre: str
    fecha_nacimiento: str
    direccion: str
    ciudad: str
    provincia: str
    sexo: str
    email: str
    telefono: Optional[str] = None
    activa: bool

    #  Convierte datetime.date a string
    @field_serializer('fecha_nacimiento')
    def serialize_fecha_nacimiento(self, value: any, _info) -> str:
        if isinstance(value, (date, datetime)):
            return value.isoformat()
        return str(value)
    
    class Config:
        from_attributes = True