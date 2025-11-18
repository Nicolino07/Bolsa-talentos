from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Persona, PersonaCreate, PersonaUpdate, PersonaResponse 
from app.database import get_db


router = APIRouter(prefix="/personas", tags=["Personas"])

@router.post("/", response_model=PersonaResponse)  # ← Quita "/personas/" de aquí
def crear_persona(persona_data: PersonaCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existe = db.query(Persona).filter(Persona.dni == persona_data.dni).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe una persona con DNI {persona_data.dni}")
    
    # Crear nueva persona
    nueva_persona = Persona(**persona_data.dict())
    db.add(nueva_persona)
    db.commit()
    db.refresh(nueva_persona)
    
    return nueva_persona

@router.get("/{dni}", response_model=PersonaResponse)  # ← Quita "/personas/" de aquí
def obtener_persona(dni: int, db: Session = Depends(get_db)):
    persona = db.query(Persona).filter(Persona.dni == dni).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona

@router.get("/", response_model=list[PersonaResponse])  # ← Quita "/personas/" de aquí
def listar_personas(db: Session = Depends(get_db)):
    return db.query(Persona).all()

@router.put("/{dni}", response_model=PersonaResponse)  # ← Quita "/personas/" de aquí
def actualizar_persona(dni: int, persona_actualizada: PersonaUpdate, db: Session = Depends(get_db)):
    # Buscar persona existente
    persona_existente = db.query(Persona).filter(Persona.dni == dni).first()
    if not persona_existente:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    # Actualizar solo los campos que vienen en la request
    datos_actualizados = persona_actualizada.dict(exclude_unset=True)
    
    for campo, valor in datos_actualizados.items():
        setattr(persona_existente, campo, valor)
    
    db.commit()
    db.refresh(persona_existente)
    
    return persona_existente