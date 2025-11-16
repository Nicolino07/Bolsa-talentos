from sqlalchemy import Column, Integer, String, Boolean, DateTime

from sqlalchemy.sql import func
from app.database import Base

class Empresa(Base):
    """
    Modelo para representar una empresa en la base de datos.

    Atributos:
        id_empresa (Integer): Identificador único y autoincremental de la empresa.
        nombre (String): Nombre único y obligatorio de la empresa.
        direccion (String): Dirección física de la empresa.
        ciudad (String): Ciudad donde está ubicada la empresa.
        provincia (String): Provincia donde se encuentra la empresa.
        mail (String): Dirección de correo electrónico de contacto de la empresa.
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
    

    def __repr__(self):
        """
        Representación en string de la instancia de Empresa, útil para depuración.
        """
        return f"Empresa({self.id_empresa}: {self.nombre})"
