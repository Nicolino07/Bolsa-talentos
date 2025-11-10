from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.servicios.persona_servicios import crear_persona, obtener_persona, listar_personas
from app.baseDatos.database import get_db

router = APIRouter()

@router.post("/persona/")
def crear_persona_endpoint(persona_data: dict, db: Session = Depends(get_db)):
    resultado = crear_persona(db, persona_data)
    
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    
    return resultado

@router.get("/persona/{dni}")
def obtener_persona_endpoint(dni: int, db: Session = Depends(get_db)):
    persona = obtener_persona(db, dni)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona

@router.get("/persona/")
def listar_personas_endpoint(db: Session = Depends(get_db)):
    return listar_personas(db)