from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base
from pydantic import BaseModel, validator, field_serializer
from typing import Optional
from datetime import date, datetime



class Empresa(Base):
    """
    Modelo SQLAlchemy para representar una empresa en la base de datos.

    Atributos:
        id_empresa (Integer): Identificador único y autoincremental de la empresa.
        nombre (String): Nombre único y obligatorio de la empresa.
        direccion (String): Dirección física de la empresa. 
        ciudad (String): Ciudad donde está ubicada la empresa.
        provincia (String): Provincia donde se encuentra la empresa.
        email (String): Dirección de correo electrónico de contacto de la empresa.
        telefono (String): Teléfono de contacto (opcional).
        fecha_registro (DateTime): Fecha y hora de creación del registro.
        activa (Boolean): Estado de la empresa (activa/inactiva), por defecto True.
    """
    
    __tablename__ = "empresa"
    
    id_empresa = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)
    direccion = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    telefono = Column(String(30))
    fecha_registro = Column(DateTime, default=func.now())
    activa = Column(Boolean, default=True)
    
    # Relaciones (si las tienes)
    # actividades = relationship("EmpresaActividad", back_populates="empresa")

    def __repr__(self):
        """
        Representación en string de la instancia de Empresa, útil para depuración.
        """
        return f"Empresa({self.id_empresa}: {self.nombre})"


# SCHEMAS PYDANTIC PARA LA API
class EmpresaCreate(BaseModel):
    """
    Schema Pydantic para la creación de una nueva empresa.
    
    Campos:
        nombre (str): Nombre único de la empresa.
        direccion (str): Dirección física.
        ciudad (str): Ciudad de ubicación.
        provincia (str): Provincia de ubicación.
        email (str): Correo electrónico de contacto.
        telefono (Optional[str]): Teléfono de contacto (opcional).
    """
    nombre: str
    direccion: str
    ciudad: str
    provincia: str
    email: str
    telefono: Optional[str] = None

class EmpresaUpdate(BaseModel):
    """
    Schema Pydantic para la actualización de una empresa existente.
    
    Campos (todos opcionales):
        nombre (Optional[str]): Nuevo nombre de la empresa.
        direccion (Optional[str]): Nueva dirección.
        ciudad (Optional[str]): Nueva ciudad.
        provincia (Optional[str]): Nueva provincia.
        email (Optional[str]): Nuevo email.
        telefono (Optional[str]): Nuevo teléfono.
    """
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None

    @validator('*', pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

class EmpresaResponse(BaseModel):
    """
    Schema Pydantic para la respuesta de una empresa.
    Incluye todos los campos que se devuelven al cliente.
    """
    id_empresa: int
    nombre: str
    direccion: str
    ciudad: str
    provincia: str
    email: str
    telefono: Optional[str] = None
    fecha_registro: str
    activa: bool
    
    
    @field_serializer('fecha_registro')
    def serialize_fecha_nacimiento(self, value: any, _info) -> str:
        if isinstance(value, (date, datetime)):
            return value.isoformat()
        return str(value)

    class Config:
        """
        Configuración para Pydantic que permite la conversión desde objetos SQLAlchemy.
        """
        from_attributes = True