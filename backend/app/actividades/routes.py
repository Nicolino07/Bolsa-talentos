from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests
from app.database import get_db
from .models import Actividad, PersonaActividad, EmpresaActividad
from app.personas.models import Persona
from app.empresas.models import Empresa
from pydantic import BaseModel
from typing import List, Optional
from app.ofertas.models import OfertaActividad ,OfertaEmpleo
from app.prolog.motor import MotorProlog


prolog = MotorProlog()



router = APIRouter(prefix="/actividades", tags=["actividades"])


# Schemas para validación y documentación

class ActividadBase(BaseModel):
    """
    Esquema base para actividad con campos opcionales para área, especialidad y descripción.
    """
    nombre: str
    area: Optional[str] = None
    especialidad: Optional[str] = None
    descripcion: Optional[str] = None


class ActividadCreate(ActividadBase):
    """
    Esquema usado para creación de actividad. Hereda ActividadBase sin cambios.
    """
    pass


class ActividadResponse(ActividadBase):
    """
    Esquema respuesta para devolver detalles completos de actividad,
    incluye el identificador único.
    """
    id_actividad: int
    
    class Config:
        from_attributes = True


class PersonaActividadBase(BaseModel):
    """
    Esquema base para asociación persona-actividad, incluyendo nivel y años de experiencia.
    """
    dni: int
    id_actividad: int
    nivel_experiencia: Optional[str] = None
    años_experiencia: Optional[int] = 0


class PersonaActividadCreate(PersonaActividadBase):
    """
    Esquema para crear relación persona-actividad. Hereda base sin cambios.
    """
    pass


class EmpresaActividadBase(BaseModel):
    """
    Esquema base para asociación empresa-actividad, con especialización opcional.
    """
    id_empresa: int
    id_actividad: int
    especializacion: Optional[str] = None


class EmpresaActividadCreate(EmpresaActividadBase):
    """
    Esquema para crear relación empresa-actividad. Hereda base sin cambios.
    """
    pass


# Endpoints para CRUD de actividades

@router.get("/", response_model=List[ActividadResponse])
async def listar_actividades(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Listar todas las actividades disponibles con paginación opcional.

    Parámetros:
    - skip (int): cantidad de registros a omitir para paginar.
    - limit (int): cantidad máxima de registros a devolver.
    - db: sesión de base de datos por dependencia.

    Retorna:
    - Lista de actividades en formato detallado.
    """
    try:
        actividades = db.query(Actividad).offset(skip).limit(limit).all()
        return actividades
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener actividades: {str(e)}")


@router.post("/", response_model=ActividadResponse)
async def crear_actividad(actividad: ActividadCreate, db: Session = Depends(get_db)):
    """
    Crear una nueva actividad si no existe previamente con el mismo nombre.

    Parámetros:
    - actividad: datos de la nueva actividad validados por Pydantic.
    - db: sesión de base de datos por dependencia.

    Retorna:
    - La actividad creada con su ID.
    
    Excepciones:
    - 400 si el nombre ya existe.
    - 500 errores del servidor o base de datos.
    """
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


# Endpoints para gestión de relación Persona - Actividad

@router.post("/persona", response_model=dict)
async def agregar_actividad_persona(relacion: PersonaActividadCreate, db: Session = Depends(get_db)):
    """
    Asociar una actividad a una persona con nivel y años de experiencia.

    Validaciones:
    - La persona y la actividad deben existir.
    - La relación no debe existir previamente.
    - Nivel de experiencia debe ser uno de: PRINCIPIANTE, INTERMEDIO, AVANZADO, EXPERTO.

    Retorna:
    - Mensaje indicando éxito.
    
    Excepciones:
    - 404 si persona o actividad no existen.
    - 400 si relación ya existe o nivel no valido.
    - 500 errores internos.
    """
    try:
        persona = db.query(Persona).filter(Persona.dni == relacion.dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        actividad = db.query(Actividad).filter(Actividad.id_actividad == relacion.id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
        relacion_existente = db.query(PersonaActividad).filter(
            PersonaActividad.dni == relacion.dni,
            PersonaActividad.id_actividad == relacion.id_actividad
        ).first()
        if relacion_existente:
            raise HTTPException(status_code=400, detail="La persona ya tiene esta actividad")
        
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
    """
    Obtener las actividades asignadas a una persona.

    Parámetros:
    - dni: DNI de la persona.
    - db: sesión de base de datos.

    Retorna:
    - Lista de actividades con detalles y experiencia.
    - 404 si persona no encontrada.
    - 500 en error interno.
    """
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


@router.delete("/persona/{dni}/{id_actividad}", response_model=dict)
async def eliminar_actividad_persona(dni: int, id_actividad: int, db: Session = Depends(get_db)):
    """
    Eliminar una actividad asignada a una persona específica.

    Parámetros:
    - dni: DNI de la persona.
    - id_actividad: ID de la actividad a eliminar.
    - db: sesión de base de datos.

    Retorna:
    - Mensaje de éxito.
    - Errores 404 si persona, actividad o relación no existen.
    - 500 en error interno.
    """
    try:
        persona = db.query(Persona).filter(Persona.dni == dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        actividad = db.query(Actividad).filter(Actividad.id_actividad == id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
        relacion_existente = db.query(PersonaActividad).filter(
            PersonaActividad.dni == dni,
            PersonaActividad.id_actividad == id_actividad
        ).first()
        
        if not relacion_existente:
            raise HTTPException(status_code=404, detail="La persona no tiene esta actividad asignada")
        
        db.delete(relacion_existente)
        db.commit()
        
        return {"message": "Actividad eliminada de la persona exitosamente"}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar actividad: {str(e)}")


# Endpoints para Empresa-Actividad

@router.post("/empresa", response_model=dict)
async def agregar_actividad_empresa(relacion: EmpresaActividadCreate, db: Session = Depends(get_db)):
    """
    Asociar una actividad a una empresa con una especialización opcional.

    Validaciones:
    - La empresa y la actividad deben existir.
    - La relación no debe existir previamente.

    Retorna:
    - Mensaje indicando éxito o error.
    """
    try:
        empresa = db.query(Empresa).filter(Empresa.id_empresa == relacion.id_empresa).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        actividad = db.query(Actividad).filter(Actividad.id_actividad == relacion.id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
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
    """
    Obtener las actividades asignadas a una empresa.

    Parámetros:
    - id_empresa: ID de la empresa.
    - db: sesión de base de datos.

    Retorna:
    - Lista con actividades y especializaciones asociadas.
    - 404 si empresa no encontrada.
    - 500 en error interno.
    """
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


@router.delete("/empresa/{id_empresa}/{id_actividad}", response_model=dict)
async def eliminar_actividad_empresa(id_empresa: int, id_actividad: int, db: Session = Depends(get_db)):
    """
    Eliminar una actividad asignada a una empresa específica.

    Parámetros:
    - id_empresa: ID de la empresa.
    - id_actividad: ID de la actividad a eliminar.
    - db: sesión de base de datos.

    Retorna:
    - Mensaje de éxito.
    - Errores 404 si empresa, actividad o relación no existen.
    - 500 en error interno.
    """
    try:
        empresa = db.query(Empresa).filter(Empresa.id_empresa == id_empresa).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
        actividad = db.query(Actividad).filter(Actividad.id_actividad == id_actividad).first()
        if not actividad:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        
        relacion_existente = db.query(EmpresaActividad).filter(
            EmpresaActividad.id_empresa == id_empresa,
            EmpresaActividad.id_actividad == id_actividad
        ).first()
        
        if not relacion_existente:
            raise HTTPException(status_code=404, detail="La empresa no tiene esta actividad asignada")
        
        db.delete(relacion_existente)
        db.commit()
        
        return {"message": "Actividad eliminada de la empresa exitosamente"}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar actividad: {str(e)}")



@router.post("/sistema-aprendizaje/ejecutar")
async def ejecutar_aprendizaje(db: Session = Depends(get_db)):
    """Ejecutar aprendizaje automático en Prolog"""
    try:
        PROLOG_URL = "http://prolog-engine:4000"
        
        print("🎓 Ejecutando aprendizaje en Prolog...")
        
        # Paso 1: Ejecutar aprendizaje en Prolog
        response_aprender = requests.post(f"{PROLOG_URL}/aprender", timeout=30)
        response_aprender.raise_for_status()
        
        resultado_aprender = response_aprender.json()
        print("✅ Aprendizaje completado en Prolog")
        
        # Paso 2: Regenerar archivos de Prolog con las nuevas relaciones aprendidas
        from app.prolog.generador_hechos import generar_hechos
        resultado_generacion = generar_hechos()
        print("✅ Archivos de Prolog regenerados con nuevas relaciones")
        
        return {
            "status": "success", 
            "message": "Aprendizaje ejecutado correctamente",
            "aprendizaje": resultado_aprender,
            "archivos_regenerados": resultado_generacion
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error ejecutando aprendizaje: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en sistema de aprendizaje: {str(e)}")
    

@router.get("/busqueda/semantica")
async def busqueda_semantica(consulta: str):
    """Búsqueda semántica de actividades"""
    try:
        PROLOG_URL = "http://prolog-engine:4000"
        response = requests.get(f"{PROLOG_URL}/buscar_semantica?consulta={consulta}")
        return response.json()
    except Exception as e:
        raise HTTPException(500, f"Error en búsqueda semántica: {str(e)}")



@router.get("/recomendaciones/habilidades/{dni}")
def recomendaciones_habilidades(dni: int, db: Session = Depends(get_db)):
    """
    Consulta al motor Prolog → recibe recomendaciones
    Luego le agrega id_oferta y datos de ofertas reales
    """
    try:
        # 1) Llamar al microservicio Prolog
        resultado = prolog.recomendaciones_habilidades(dni)

        if resultado.get("status") == "error":
            raise HTTPException(
                status_code=500,
                detail=resultado.get("message", "Error consultando Prolog")
            )

        recomendaciones_finales = []

        # 2) Enriquecer con datos reales de la BD
        for rec in resultado.get("recomendaciones", []):
            habilidad = rec["habilidad"]

            # Buscar la actividad en DB
            actividad = db.query(Actividad).filter(
                Actividad.nombre == habilidad
            ).first()

            ofertas = []

            if actividad:
                # Buscar relaciones actividad → oferta
                relaciones = db.query(OfertaActividad).filter(
                    OfertaActividad.id_actividad == actividad.id_actividad
                ).all()

                for rel in relaciones:
                    oferta = db.query(OfertaEmpleo).filter(
                        OfertaEmpleo.id_oferta == rel.id_oferta
                    ).first()

                    if oferta:
                        ofertas.append({
                            "id_oferta": oferta.id_oferta,
                            "titulo": oferta.titulo,
                            "descripcion": oferta.descripcion
                        })

            # Completar recomendación
            recomendaciones_finales.append({
                "habilidad": rec["habilidad"],
                "confianza": rec["confianza"],
                "razon": rec["razon"],
                "ofertas": ofertas
            })

        return {
            "dni": dni,
            "recomendaciones": recomendaciones_finales,
            "status": "ok"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
