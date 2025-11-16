from sqlalchemy import Column, Integer, String, Date, Boolean
from app.database import Base

class Persona(Base):
    """
    Modelo para representar una persona en la base de datos.

    Atributos:
        dni (Integer): Documento Nacional de Identidad, clave primaria.
        apellido (String): Apellido de la persona, obligatorio.
        nombre (String): Nombre de la persona, obligatorio.
        fecha_nacimiento (Date): Fecha de nacimiento, obligatoria.
        direccion (String): Dirección física, obligatoria.
        ciudad (String): Ciudad de residencia, obligatoria.
        provincia (String): Provincia de residencia, obligatoria.
        sexo (String): Sexo de la persona, obligatorio.
        mail (String): Correo electrónico, obligatorio.
        telefono (String): Teléfono de contacto, opcional.
        activa (Boolean): Estado activo/inactivo, valor por defecto True.
    """

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
