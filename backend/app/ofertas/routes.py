from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.empresas.models import Empresa
from app.personas.models import Persona
from app.actividades.models import Actividad
from .models import OfertaEmpleo, OfertaActividad
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/ofertas", tags=["ofertas"])

# Schemas para actividades de oferta
class OfertaActividadBase(BaseModel):
    id_actividad: int
    nivel_requerido: str

class OfertaActividadCreate(OfertaActividadBase):
    pass

class OfertaActividadResponse(OfertaActividadBase):
    id_oferta: int
    nombre_actividad: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schemas para ofertas
class OfertaBase(BaseModel):
    titulo: str
    descripcion: str
    activa: bool = True

class OfertaCreate(OfertaBase):
    id_empresa: Optional[int] = None
    persona_dni: Optional[int] = None
    

class OfertaResponse(OfertaBase):
    id_oferta: int
    id_empresa: Optional[int]
    persona_dni: Optional[int]
    fecha_publicacion: datetime
    actividades: List[OfertaActividadResponse] = []
    
    class Config:
        from_attributes = True

# Endpoints
@router.post("/", response_model=OfertaResponse)
async def crear_oferta(oferta: OfertaCreate, db: Session = Depends(get_db)):
    try:
        if not oferta.id_empresa and not oferta.persona_dni:
            raise HTTPException(
                status_code=400, 
                detail="Debe especificar id_empresa o persona_dni"
            )
        
        if oferta.id_empresa:
            empresa = db.query(Empresa).filter(Empresa.id_empresa == oferta.id_empresa).first()
            if not empresa:
                raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        if oferta.persona_dni:
            persona = db.query(Persona).filter(Persona.dni == oferta.persona_dni).first()
            if not persona:
                raise HTTPException(status_code=404, detail="Persona no encontrada")

        nueva_oferta = OfertaEmpleo(
            id_empresa=oferta.id_empresa,
            persona_dni=oferta.persona_dni,
            titulo=oferta.titulo,
            descripcion=oferta.descripcion,
            activa=oferta.activa
        )

        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)

        return OfertaResponse(
            id_oferta=nueva_oferta.id_oferta,
            id_empresa=nueva_oferta.id_empresa,
            persona_dni=nueva_oferta.persona_dni,
            titulo=nueva_oferta.titulo,
            descripcion=nueva_oferta.descripcion,
            activa=nueva_oferta.activa,
            fecha_publicacion=nueva_oferta.fecha_publicacion,
            actividades=[]      # ← YA NO SE PROCESAN AQUÍ
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear oferta: {str(e)}")


@router.get("/", response_model=List[OfertaResponse])
async def listar_ofertas(
    skip: int = 0, 
    limit: int = 100, 
    activa: bool = True,
    db: Session = Depends(get_db)
):
    """
    Listar ofertas de empleo
    """
    try:
        ofertas = db.query(OfertaEmpleo).filter(OfertaEmpleo.activa == activa).offset(skip).limit(limit).all()
        return ofertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener ofertas: {str(e)}")

@router.get("/{id_oferta}", response_model=OfertaResponse)
async def obtener_oferta(id_oferta: int, db: Session = Depends(get_db)):
    """
    Obtener una oferta específica por ID
    """
    try:
        oferta = db.query(OfertaEmpleo).filter(OfertaEmpleo.id_oferta == id_oferta).first()
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        # Cargar actividades de la oferta
        actividades = db.query(OfertaActividad).filter(
            OfertaActividad.id_oferta == id_oferta
        ).all()
        
        response_data = OfertaResponse(
            id_oferta=oferta.id_oferta,
            id_empresa=oferta.id_empresa,
            persona_dni=oferta.persona_dni,
            titulo=oferta.titulo,
            descripcion=oferta.descripcion,
            activa=oferta.activa,
            fecha_publicacion=oferta.fecha_publicacion,
            actividades=actividades
        )
        
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener oferta: {str(e)}")

@router.get("/empresa/{id_empresa}", response_model=List[OfertaResponse])
async def obtener_ofertas_empresa(id_empresa: int, db: Session = Depends(get_db)):
    """
    Obtener ofertas de una empresa específica
    """
    try:
        empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        ofertas = db.query(OfertaEmpleo).filter(OfertaEmpleo.id_empresa == id_empresa).all()
        return ofertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener ofertas: {str(e)}")

@router.get("/persona/{persona_dni}", response_model=List[OfertaResponse])
async def obtener_ofertas_persona(persona_dni: int, db: Session = Depends(get_db)):
    """
    Obtener ofertas de una persona específica
    """
    try:
        persona = db.query(Persona).filter(Persona.dni == persona_dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        ofertas = db.query(OfertaEmpleo).filter(OfertaEmpleo.persona_dni == persona_dni).all()
        return ofertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener ofertas: {str(e)}")

@router.put("/{id_oferta}", response_model=OfertaResponse)
async def actualizar_oferta(
    id_oferta: int, 
    oferta_update: OfertaBase, 
    db: Session = Depends(get_db)
):
    """
    Actualizar una oferta existente
    """
    try:
        oferta = db.query(OfertaEmpleo).filter(OfertaEmpleo.id_oferta == id_oferta).first()
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        oferta.titulo = oferta_update.titulo
        oferta.descripcion = oferta_update.descripcion
        oferta.activa = oferta_update.activa
        
        db.commit()
        db.refresh(oferta)
        
        # Cargar actividades para la respuesta
        actividades = db.query(OfertaActividad).filter(
            OfertaActividad.id_oferta == id_oferta
        ).all()
        
        response_data = OfertaResponse(
            id_oferta=oferta.id_oferta,
            id_empresa=oferta.id_empresa,
            persona_dni=oferta.persona_dni,
            titulo=oferta.titulo,
            descripcion=oferta.descripcion,
            activa=oferta.activa,
            fecha_publicacion=oferta.fecha_publicacion,
            actividades=actividades
        )
        
        return response_data
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar oferta: {str(e)}")

@router.delete("/{id_oferta}")
async def eliminar_oferta(id_oferta: int, db: Session = Depends(get_db)):
    """
    Eliminar una oferta
    """
    try:
        oferta = db.query(OfertaEmpleo).filter(OfertaEmpleo.id_oferta == id_oferta).first()
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        # Primero eliminar las actividades relacionadas
        db.query(OfertaActividad).filter(OfertaActividad.id_oferta == id_oferta).delete()
        
        # Luego eliminar la oferta
        db.delete(oferta)
        db.commit()
        
        return {"message": "Oferta eliminada correctamente"}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar oferta: {str(e)}")