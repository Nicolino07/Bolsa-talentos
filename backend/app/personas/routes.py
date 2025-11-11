from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Persona
from app.database import get_db


router = APIRouter()  

@router.post("/personas/")
def crear_persona(persona_data: dict, db: Session = Depends(get_db)):
    """
    Crea una nueva persona en la base de datos.

    Parámetros:
    - persona_data (dict): Diccionario con los datos de la persona a crear (debe incluir al menos el campo 'dni').
    - db (Session): Sesión de base de datos inyectada automáticamente via Depends.

    Comportamiento:
    - Verifica si ya existe una persona con el mismo DNI. Si existe, lanza un HTTPException 400.
    - Si no existe, crea la persona, la guarda en la base de datos y devuelve un mensaje de éxito junto con los datos de la persona creada.

    Respuestas:
    - 200: Persona creada exitosamente.
    - 400: Ya existe una persona con el DNI proporcionado.
    """
    # Verificar si ya existe
    existe = db.query(Persona).filter(Persona.dni == persona_data["dni"]).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe una persona con DNI {persona_data['dni']}")
    
    # Crear nueva persona
    nueva_persona = Persona(**persona_data)
    db.add(nueva_persona)
    db.commit()
    db.refresh(nueva_persona)
    
    return {"mensaje": "Persona creada exitosamente", "persona": nueva_persona}


@router.get("/personas/{dni}")
def obtener_persona(dni: int, db: Session = Depends(get_db)):
    """
    Obtiene los datos de una persona mediante su DNI.

    Parámetros:
    - dni (int): DNI de la persona a buscar.
    - db (Session): Sesión de base de datos inyectada automáticamente via Depends.

    Comportamiento:
    - Busca la persona con el DNI especificado.
    - Si no la encuentra, lanza un HTTPException 404.
    - Si la encuentra, devuelve el objeto persona.

    Respuestas:
    - 200: Devuelve la persona encontrada.
    - 404: Persona no encontrada.
    """
    persona = db.query(Persona).filter(Persona.dni == dni).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona


@router.get("/personas/")
def listar_personas(db: Session = Depends(get_db)):
    """
    Devuelve una lista con todas las personas almacenadas en la base de datos.

    Parámetros:
    - db (Session): Sesión de base de datos inyectada automáticamente via Depends.

    Respuesta:
    - 200: Lista con todas las personas (puede estar vacía).
    """
    return db.query(Persona).all()
