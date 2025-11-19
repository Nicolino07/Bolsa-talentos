from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean
from sqlalchemy.sql import func
from app.database import Base

class RelacionAprendida(Base):
    __tablename__ = "relaciones_aprendidas"
    
    id = Column(Integer, primary_key=True, index=True)
    habilidad_base = Column(String(100), nullable=False)
    habilidad_objetivo = Column(String(100), nullable=False)
    confianza = Column(Numeric(3, 2), default=0.5)  # 0.00 a 1.00
    frecuencia = Column(Integer, default=1)
    fuente = Column(String(20), default='co_ocurrencia')  # manual, co_ocurrencia, contratos
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), onupdate=func.now())