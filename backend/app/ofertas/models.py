
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.orm import relationship

class OfertaEmpleo(Base):
    __tablename__ = "oferta_empleo"
    
    id_oferta = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa'), nullable=True)
    persona_dni = Column(Integer, ForeignKey('persona.dni'), nullable=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text)
    fecha_publicacion = Column(DateTime, server_default=func.now())
    activa = Column(Boolean, default=True)
    

    # Relaciones
    actividades = relationship("OfertaActividad", back_populates="oferta")


    # Validación: al menos uno debe estar presente
    __table_args__ = (
        CheckConstraint(
            'id_empresa IS NOT NULL OR persona_dni IS NOT NULL',
            name='check_empresa_or_persona'
        ),
    )

class OfertaActividad(Base):
    __tablename__ = "oferta_actividad"
    
    id_oferta = Column(Integer, ForeignKey('oferta_empleo.id_oferta'), primary_key=True)
    id_actividad = Column(Integer, ForeignKey('actividad.id_actividad'), primary_key=True)
    nivel_requerido = Column(String(50))

    actividad = relationship("Actividad")      # <-- ESTA FALTABA
    oferta = relationship("OfertaEmpleo")      # <-- ESTA TAMBIÉN FALTABA


    # Validación del nivel requerido
    __table_args__ = (
        CheckConstraint(
            "nivel_requerido IN ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO')",
            name='check_nivel_requerido'
        ),
    )