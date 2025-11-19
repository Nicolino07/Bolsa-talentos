from sqlalchemy import Column, Integer, String, Text, ForeignKey 
from app.database import Base


class Actividad(Base):
    """
    Modelo para la tabla 'actividad'.

    Atributos:
        id_actividad (int): Identificador único de la actividad.
        nombre (str): Nombre de la actividad. Obligatorio.
        area (str): Área a la que pertenece la actividad.
        especialidad (str): Especialidad dentro del área.
        descripcion (str): Descripción detallada de la actividad.

    """
    __tablename__ = "actividad"
    
    id_actividad = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    area = Column(String(100))
    especialidad = Column(String(100))
    descripcion = Column(Text)


class PersonaActividad(Base):
    """
    Modelo para la tabla intermedia 'persona_actividad' que vincula personas con actividades.

    Atributos:
        id_relacion (int): Identificador único de la relación.
        dni (int): DNI de la persona, clave foránea a 'persona'.
        id_actividad (int): ID de la actividad, clave foránea a 'actividad'.
        nivel_experiencia (str): Nivel cualitativo de experiencia (ej. PRINCIPIANTE, INTERMEDIO).
        años_experiencia (int): Años cuantitativos de experiencia, por defecto 0.
    """
    __tablename__ = "persona_actividad"
    
    id_relacion = Column(Integer, primary_key=True, index=True)
    dni = Column(Integer, ForeignKey('persona.dni'), nullable=False)
    id_actividad = Column(Integer, ForeignKey('actividad.id_actividad'), nullable=False)
    nivel_experiencia = Column(String(50))
    años_experiencia = Column(Integer, default=0)
    


class EmpresaActividad(Base):
    """
    Modelo para la tabla intermedia 'empresa_actividad' que vincula empresas con actividades.

    Atributos:
        id_empresa (int): ID de la empresa, clave foránea y parte de la clave primaria.
        id_actividad (int): ID de la actividad, clave foránea y parte de la clave primaria.
        especializacion (str): Especialización asignada a la empresa para esa actividad.
    """
    __tablename__ = "empresa_actividad"
    
    id_empresa = Column(Integer, ForeignKey('empresa.id_empresa'), primary_key=True)
    id_actividad = Column(Integer, ForeignKey('actividad.id_actividad'), primary_key=True)
    especializacion = Column(String(100))