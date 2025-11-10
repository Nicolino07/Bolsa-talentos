from sqlalchemy.orm import Session
from app.modelos.persona import Persona

def crear_persona(db: Session, datos_persona: dict):
    """Crea una nueva persona en la base de datos"""
    # Verificar si ya existe
    existe = db.query(Persona).filter(Persona.dni == datos_persona["dni"]).first()
    if existe:
        return {"error": f"Ya existe una persona con DNI {datos_persona['dni']}"}
    
    # Crear nueva persona
    nueva_persona = Persona(**datos_persona)
    db.add(nueva_persona)
    db.commit()
    db.refresh(nueva_persona)
    
    return {"mensaje": "Persona creada exitosamente", "persona": nueva_persona}

def obtener_persona(db: Session, dni: int):
    """Obtiene una persona por DNI"""
    return db.query(Persona).filter(Persona.dni == dni).first()

def listar_personas(db: Session):
    """Lista todas las personas"""
    return db.query(Persona).all()