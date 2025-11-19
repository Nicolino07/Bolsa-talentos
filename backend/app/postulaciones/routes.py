from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from .models import Postulacion
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(tags=["postulaciones"])


# Schemas
class PostulacionBase(BaseModel):
    dni: int
    id_oferta: int
    estado: Optional[str] = "pendiente"

class PostulacionCreate(PostulacionBase):
    pass

class PostulacionResponse(PostulacionBase):
    id: int
    
    class Config:
        from_attributes = True

# Endpoints CRUD
@router.get("/", response_model=List[PostulacionResponse])
async def listar_postulaciones(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Listar todas las postulaciones"""
    try:
        postulaciones = db.query(Postulacion).offset(skip).limit(limit).all()
        return postulaciones
    except Exception as e:
        raise HTTPException(500, f"Error al obtener postulaciones: {str(e)}")

@router.post("/", response_model=PostulacionResponse)
async def crear_postulacion(postulacion: PostulacionCreate, db: Session = Depends(get_db)):
    """Crear una nueva postulación"""
    try:
        # Verificar si ya existe
        existente = db.query(Postulacion).filter(
            Postulacion.dni == postulacion.dni,
            Postulacion.id_oferta == postulacion.id_oferta
        ).first()
        
        if existente:
            raise HTTPException(400, "Ya existe una postulación para esta persona y oferta")
        
        nueva_postulacion = Postulacion(**postulacion.dict())
        db.add(nueva_postulacion)
        db.commit()
        db.refresh(nueva_postulacion)
        
        return nueva_postulacion
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error al crear postulación: {str(e)}")
    
@router.delete("/{dni}/{id_oferta}")
async def eliminar_postulacion(dni: int, id_oferta: int, db: Session = Depends(get_db)):
    """Eliminar una postulación por DNI e id_oferta"""
    try:
        postulacion = db.query(Postulacion).filter(
            Postulacion.dni == dni,
            Postulacion.id_oferta == id_oferta
        ).first()

        if not postulacion:
            raise HTTPException(404, "Postulación no encontrada")

        db.delete(postulacion)
        db.commit()

        return {"mensaje": "Postulación eliminada correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error al eliminar postulación: {str(e)}")
