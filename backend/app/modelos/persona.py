from sqlalchemy import Column, Integer, String, Boolean, Date
from app.modelos.usuario import usuario
from app.baseDatos.database import Base


class persona(usuario):

    # Constructor de la clase Persona
    def __init__(self,dni, apellido, nombre, fecha_nacimiento, direccion, ciudad, provincia, sexo, telefono=None, mail= None, activa=True):

        super().__init__(nombre, direccion, ciudad, provincia, telefono, mail, activa)

        self.dni = dni
        self.apellido = apellido
        self.fecha_nacimiento = fecha_nacimiento
        self.sexo = sexo


        # Atributos específicos de Persona pueden añadirse aquí


# Modelo ORM para persistencia (cronograma separado del POO)
class PersonaModel(Base):
    __tablename__ = "persona"

    dni = Column(Integer, primary_key=True, index=True)
    apellido = Column(String(100), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    direccion = Column(String(100), nullable=False)
    ciudad = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    sexo = Column(String(50), nullable=False)
    mail = Column(String(100), unique=True, nullable=False)
    telefono = Column(String(30))
    activa = Column(Boolean, default=True)