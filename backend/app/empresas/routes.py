from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .models import Empresa, EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.database import get_db

router = APIRouter(prefix="/empresas", tags=["Empresas"])

@router.post("/empresas/", response_model=EmpresaResponse)
def crear_empresa(empresa_data: EmpresaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva empresa en la base de datos.

    Parámetros:
    - empresa_data (EmpresaCreate): Datos validados de la empresa a crear.
    - db (Session): Sesión de base de datos inyectada automáticamente vía Depends.

    Comportamiento:
    - Verifica si ya existe una empresa con el mismo nombre. Si existe, lanza un HTTPException 400.
    - Si no existe, crea la empresa, la guarda en la base de datos y devuelve la empresa creada.

    Respuestas:
    - 200: Empresa creada exitosamente.
    - 400: Ya existe una empresa con el nombre proporcionado.
    """
    # Verificar si ya existe
    existe = db.query(Empresa).filter(Empresa.nombre == empresa_data.nombre).first()
    if existe:
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe una empresa con el nombre {empresa_data.nombre}"
        )
    
    # Crear nueva empresa
    nueva_empresa = Empresa(**empresa_data.dict())
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)
    
    return nueva_empresa

@router.get("/empresas/{id_empresa}", response_model=EmpresaResponse)
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

@router.get("/empresas/", response_model=list[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    """
    Devuelve una lista con todas las empresas almacenadas en la base de datos.

    Parámetros:
    - db (Session): Sesión de base de datos inyectada automáticamente vía Depends.

    Respuesta:
    - 200: Lista con todas las empresas (puede estar vacía).
    """
    return db.query(Empresa).all()

@router.put("/empresas/{id_empresa}", response_model=EmpresaResponse)
def actualizar_empresa(id_empresa: int, empresa_actualizada: EmpresaUpdate, db: Session = Depends(get_db)):
    """
    Actualiza los datos de una empresa existente.

    Parámetros:
    - id_empresa (int): ID de la empresa a actualizar.
    - empresa_actualizada (EmpresaUpdate): Datos a actualizar (solo los campos enviados serán modificados).
    - db (Session): Sesión de base de datos.

    Comportamiento:
    - Busca la empresa por ID.
    - Si no existe, lanza HTTPException 404.
    - Actualiza solo los campos proporcionados en la request.
    - Devuelve la empresa actualizada.

    Respuestas:
    - 200: Empresa actualizada exitosamente.
    - 404: Empresa no encontrada.
    """
    empresa_existente = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
    if not empresa_existente:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Actualizar solo los campos que vienen en la request
    datos_actualizados = empresa_actualizada.dict(exclude_unset=True)
    
    for campo, valor in datos_actualizados.items():
        setattr(empresa_existente, campo, valor)
    
    db.commit()
    db.refresh(empresa_existente)
    
    return empresa_existente