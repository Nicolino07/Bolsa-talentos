from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Empresa
from app.database import get_db


router = APIRouter()


@router.post("/empresas/")
def crear_empresa(empresa_data: dict, db: Session = Depends(get_db)):
    """
    Crea una nueva empresa en la base de datos.

    Parámetros:
    - empresa_data (dict): Diccionario con los datos de la empresa a crear (debe incluir al menos el campo 'nombre').
    - db (Session): Sesión de base de datos inyectada automáticamente vía Depends.

    Comportamiento:
    - Verifica si ya existe una empresa con el mismo nombre. Si existe, lanza un HTTPException 400.
    - Si no existe, crea la empresa, la guarda en la base de datos y devuelve un mensaje de éxito junto con los datos de la empresa creada.

    Respuestas:
    - 200: Empresa creada exitosamente.
    - 400: Ya existe una empresa con el nombre proporcionado.
    """
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
    """
    Obtiene los datos de una empresa mediante su ID.

    Parámetros:
    - id_empresa (int): ID de la empresa a buscar.
    - db (Session): Sesión de base de datos inyectada automáticamente vía Depends.

    Comportamiento:
    - Busca la empresa con el ID especificado.
    - Si no la encuentra, lanza un HTTPException 404.
    - Si la encuentra, devuelve el objeto empresa.

    Respuestas:
    - 200: Devuelve la empresa encontrada.
    - 404: Empresa no encontrada.
    """
    empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa


@router.get("/empresas/")
def listar_empresas(db: Session = Depends(get_db)):
    """
    Devuelve una lista con todas las empresas almacenadas en la base de datos.

    Parámetros:
    - db (Session): Sesión de base de datos inyectada automáticamente vía Depends.

    Respuesta:
    - 200: Lista con todas las empresas (puede estar vacía).
    """
    return db.query(Empresa).all()
