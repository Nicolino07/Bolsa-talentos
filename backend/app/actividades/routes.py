from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from .models import Actividad, PersonaActividad, EmpresaActividad
from app.personas.models import Persona
from app.empresas.models import Empresa
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/actividades", tags=["actividades"])

# Schemas
class ActividadBase(BaseModel):
    nombre: str
    area: Optional[str] = None
    especialidad: Optional[str] = None
    descripcion: Optional[str] = None

class ActividadCreate(ActividadBase):
    pass

class ActividadResponse(ActividadBase):
    id_actividad: int
    
    class Config:
        from_attributes = True

class PersonaActividadBase(BaseModel):
    dni: int
    id_actividad: int
    nivel_experiencia: Optional[str] = None
    años_experiencia: Optional[int] = 0

class PersonaActividadCreate(PersonaActividadBase):
    pass

class EmpresaActividadBase(BaseModel):
    id_empresa: int
    id_actividad: int
    especializacion: Optional[str] = None

class EmpresaActividadCreate(EmpresaActividadBase):
    pass

# Endpoints para Actividades (CRUD básico - mismos que antes)
@router.get("/", response_model=List[ActividadResponse])
async def listar_actividades(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Listar todas las actividades disponibles"""
    try:
        actividades = db.query(Actividad).offset(skip).limit(limit).all()
        return actividades
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener actividades: {str(e)}")

@router.post("/", response_model=ActividadResponse)
async def crear_actividad(actividad: ActividadCreate, db: Session = Depends(get_db)):
    """Crear una nueva actividad"""
    try:
        actividad_existente = db.query(Actividad).filter(Actividad.nombre == actividad.nombre).first()
        if actividad_existente:
            raise HTTPException(status_code=400, detail="Ya existe una actividad con este nombre")
        
        nueva_actividad = Actividad(
            nombre=actividad.nombre,
            area=actividad.area,
            especialidad=actividad.especialidad,
            descripcion=actividad.descripcion
        )
        
        db.add(nueva_actividad)
        db.commit()
        db.refresh(nueva_actividad)
        return nueva_actividad
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear actividad: {str(e)}")

# Endpoints para Persona-Actividad
@router.post("/persona", response_model=dict)
async def agregar_actividad_persona(relacion: PersonaActividadCreate, db: Session = Depends(get_db)):
    """Agregar una actividad a una persona"""
    try:
        # Verificar que la persona existe
        persona = db.query(Persona).filter(Persona.dni == relacion.dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Verificar que la actividad existe
        actividad = db.query(Actividad).filter(Actividad.id_actividad == relacion.id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
        # Verificar si ya existe la relación
        relacion_existente = db.query(PersonaActividad).filter(
            PersonaActividad.dni == relacion.dni,
            PersonaActividad.id_actividad == relacion.id_actividad
        ).first()
        
        if relacion_existente:
            raise HTTPException(status_code=400, detail="La persona ya tiene esta actividad")
        
        # Validar nivel de experiencia
        niveles_permitidos = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO']
        if relacion.nivel_experiencia and relacion.nivel_experiencia not in niveles_permitidos:
            raise HTTPException(status_code=400, detail=f"Nivel de experiencia no válido. Use: {', '.join(niveles_permitidos)}")
        
        nueva_relacion = PersonaActividad(
            dni=relacion.dni,
            id_actividad=relacion.id_actividad,
            nivel_experiencia=relacion.nivel_experiencia,
            años_experiencia=relacion.años_experiencia or 0
        )
        
        db.add(nueva_relacion)
        db.commit()
        
        return {"message": "Actividad agregada a la persona exitosamente"}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al agregar actividad: {str(e)}")

@router.get("/persona/{dni}", response_model=List[dict])
async def obtener_actividades_persona(dni: int, db: Session = Depends(get_db)):
    """Obtener actividades de una persona específica"""
    try:
        persona = db.query(Persona).filter(Persona.dni == dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        actividades = db.query(PersonaActividad).filter(PersonaActividad.dni == dni).all()
        
        resultado = []
        for actividad_rel in actividades:
            actividad_info = db.query(Actividad).filter(Actividad.id_actividad == actividad_rel.id_actividad).first()
            resultado.append({
                "id_actividad": actividad_rel.id_actividad,
                "nombre": actividad_info.nombre,
                "area": actividad_info.area,
                "especialidad": actividad_info.especialidad,
                "nivel_experiencia": actividad_rel.nivel_experiencia,
                "años_experiencia": actividad_rel.años_experiencia
            })
        
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener actividades: {str(e)}")

# Endpoints para Empresa-Actividad
@router.post("/empresa", response_model=dict)
async def agregar_actividad_empresa(relacion: EmpresaActividadCreate, db: Session = Depends(get_db)):
    """Agregar una actividad a una empresa"""
    try:
        # Verificar que la empresa existe
        empresa = db.query(Empresa).filter(Empresa.id_empresa == relacion.id_empresa).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        # Verificar que la actividad existe
        actividad = db.query(Actividad).filter(Actividad.id_actividad == relacion.id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
        # Verificar si ya existe la relación
        relacion_existente = db.query(EmpresaActividad).filter(
            EmpresaActividad.id_empresa == relacion.id_empresa,
            EmpresaActividad.id_actividad == relacion.id_actividad
        ).first()
        
        if relacion_existente:
            raise HTTPException(status_code=400, detail="La empresa ya tiene esta actividad")
        
        nueva_relacion = EmpresaActividad(
            id_empresa=relacion.id_empresa,
            id_actividad=relacion.id_actividad,
            especializacion=relacion.especializacion
        )
        
        db.add(nueva_relacion)
        db.commit()
        
        return {"message": "Actividad agregada a la empresa exitosamente"}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al agregar actividad: {str(e)}")

@router.get("/empresa/{id_empresa}", response_model=List[dict])
async def obtener_actividades_empresa(id_empresa: int, db: Session = Depends(get_db)):
    """Obtener actividades de una empresa específica"""
    try:
        empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        actividades = db.query(EmpresaActividad).filter(EmpresaActividad.id_empresa == id_empresa).all()
        
        resultado = []
        for actividad_rel in actividades:
            actividad_info = db.query(Actividad).filter(Actividad.id_actividad == actividad_rel.id_actividad).first()
            resultado.append({
                "id_actividad": actividad_rel.id_actividad,
                "nombre": actividad_info.nombre,
                "area": actividad_info.area,
                "especialidad": actividad_info.especialidad,
                "especializacion": actividad_rel.especializacion
            })
        
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener actividades: {str(e)}")