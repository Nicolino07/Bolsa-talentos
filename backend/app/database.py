from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

#Variables de entorno para configuración de la base de datos
DB_USER = os.getenv("DB_USER", "postgres")  # Usuario de la base de datos
DB_PASS = os.getenv("DB_PASS", "postgres1234")  # Contraseña de la base de datos
DB_HOST = os.getenv("DB_HOST", "db")  # Host o dirección del servidor de base de datos
DB_NAME = os.getenv("DB_NAME", "bolsa_talentos")  # Nombre de la base de datos
DB_PORT = os.getenv("DB_PORT", "5432")  # Puerto de conexión

#URL de conexión completa para SQLAlchemy
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

#Motor de base de datos para manejar la conexión y operaciones
engine = create_engine(DATABASE_URL)

#Creador de sesiones para gestionar las transacciones con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Clase base para la declaración de los modelos ORM
Base = declarative_base()  # Esta línea crea la clase base para los modelos

def get_db():
    """
    Generador de sesión de base de datos que se puede usar en dependencias
    para obtener una sesión de trabajo y cerrar la conexión automáticamente.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()