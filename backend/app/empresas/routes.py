from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Empresa
from app.database import get_db

router = APIRouter()

@router.post("/empresas/")
def crear_empresa(empresa_data: dict, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existe = db.query(Empresa).filter(Empresa.nombre == empresa_data["nombre"]).first()
    if existe:
        raise HTTPException(status_code=400, detail=f"Ya existe una empresa con el nombre {empresa_data['nombre']}")
    
    # Crear nueva empresa
    nueva_empresa = Empresa(**empresa_data)
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)
    
    return {"mensaje": "Empresa creada exitosamente", "empresa": nueva_empresa}

@router.get("/empresas/{id_empresa}")
def obtener_empresa(id_empresa: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

@router.get("/empresas/")
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(Empresa).all()