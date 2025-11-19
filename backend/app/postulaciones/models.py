from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Postulacion(Base):
    __tablename__ = "postulaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(Integer, ForeignKey('persona.dni'), nullable=False)
    id_oferta = Column(Integer, ForeignKey('oferta_empleo.id_oferta'), nullable=False)
    estado = Column(String(20), default='pendiente')  # pendiente, revisando, entrevista, contratado, rechazado
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones (opcional, para eager loading)
    # persona = relationship("Persona", back_populates="postulaciones")
    # oferta = relationship("OfertaEmpleo", back_populates="postulaciones")