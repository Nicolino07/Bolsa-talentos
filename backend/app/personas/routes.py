from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Persona
from app.database import get_db

router = APIRouter()  


@router.post("/personas/")
def crear_persona(persona_data: dict, db: Session = Depends(get_db)):
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
    persona = db.query(Persona).filter(Persona.dni == dni).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona

@router.get("/personas/")
def listar_personas(db: Session = Depends(get_db)):
    return db.query(Persona).all()