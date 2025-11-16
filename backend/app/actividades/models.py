from sqlalchemy import Column, Integer, String, Text, ForeignKey 
from app.database import Base

class Actividad(Base):
    __tablename__ = "actividad"
    
    id_actividad = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    area = Column(String(100))
    especialidad = Column(String(100))
    descripcion = Column(Text)
    

class PersonaActividad(Base):
    __tablename__ = "persona_actividad"
    
    id_relacion = Column(Integer, primary_key=True, index=True)
    dni = Column(Integer, ForeignKey('persona.dni'), nullable=False)
    id_actividad = Column(Integer, ForeignKey('actividad.id_actividad'), nullable=False)
    nivel_experiencia = Column(String(50))
    años_experiencia = Column(Integer, default=0)
    

class EmpresaActividad(Base):
    __tablename__ = "empresa_actividad"
    
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa'), primary_key=True)
    id_actividad = Column(Integer, ForeignKey('actividad.id_actividad'), primary_key=True)
    especializacion = Column(String(100))