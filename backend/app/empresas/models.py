from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Empresa(Base):
    __tablename__ = "empresa"
    
    id_empresa = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)
    direccion = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    mail = Column(String(100), nullable=False)
    telefono = Column(String(30))
    fecha_registro = Column(DateTime, default=func.now())
    activa = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"Empresa({self.id_empresa}: {self.nombre})"