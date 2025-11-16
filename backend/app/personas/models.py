from sqlalchemy import Column, Integer, String, Date, Boolean
from app.database import Base
from sqlalchemy.orm import relationship

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

    # RELACIÓN CORRECTA
    actividades = relationship("PersonaActividad", back_populates="persona")

    def __repr__(self):
        return f"Persona({self.dni}: {self.nombre} {self.apellido})"
