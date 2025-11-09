from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.baseDatos.database import get_db
from app.servicios.persona_servicios import crear_persona, listar_personas

router = APIRouter(prefix="/personas", tags=["Personas"])

class PersonaIn(BaseModel):
    dni: int
    apellido: str
    nombre: str
    fecha_nacimiento: str
    direccion: str
    ciudad: str
    provincia: str
    sexo: str
    mail: str
    telefono: str | None = None
    activa: bool = True

class PersonaOut(PersonaIn):
    pass


@router.post("/", response_model=PersonaOut)
def api_crear_persona(payload: PersonaIn, db: Session = Depends(get_db)):

    res = crear_persona(db, payload.dict())
    if not res:
        raise HTTPException(status_code=500, detail="Error al crear persona")

    return res["orm"]

@router.get("/", response_model=list[PersonaOut])
def api_listar_personas(db: Session = Depends(get_db)):
    return listar_personas(db)
