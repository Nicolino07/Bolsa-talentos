from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from .models import RelacionAprendida
from pydantic import BaseModel
from typing import List, Optional
import requests

router = APIRouter(prefix="/relaciones-aprendidas", tags=["relaciones-aprendidas"])

# Schemas
class RelacionAprendidaBase(BaseModel):
    habilidad_base: str
    habilidad_objetivo: str
    confianza: float
    frecuencia: int
    fuente: Optional[str] = "co_ocurrencia"

class RelacionAprendidaCreate(RelacionAprendidaBase):
    pass

class RelacionAprendidaResponse(RelacionAprendidaBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True

# Endpoints CRUD
@router.get("/", response_model=List[RelacionAprendidaResponse])
async def listar_relaciones(
    skip: int = 0, 
    limit: int = 100, 
    solo_activas: bool = True,
    db: Session = Depends(get_db)
):
    """Listar relaciones aprendidas"""
    try:
        query = db.query(RelacionAprendida)
        if solo_activas:
            query = query.filter(RelacionAprendida.activo == True)
        
        relaciones = query.offset(skip).limit(limit).all()
        return relaciones
    except Exception as e:
        raise HTTPException(500, f"Error al obtener relaciones: {str(e)}")

@router.post("/", response_model=RelacionAprendidaResponse)
async def crear_relacion(relacion: RelacionAprendidaCreate, db: Session = Depends(get_db)):
    """Crear una nueva relación aprendida"""
    try:
        # Verificar si ya existe
        existente = db.query(RelacionAprendida).filter(
            RelacionAprendida.habilidad_base == relacion.habilidad_base,
            RelacionAprendida.habilidad_objetivo == relacion.habilidad_objetivo
        ).first()
        
        if existente:
            # Actualizar existente
            existente.confianza = relacion.confianza
            existente.frecuencia = relacion.frecuencia
            existente.fuente = relacion.fuente
            existente.activo = True
        else:
            # Crear nueva
            nueva_relacion = RelacionAprendida(**relacion.dict())
            db.add(nueva_relacion)
        
        db.commit()
        if existente:
            db.refresh(existente)
            return existente
        else:
            db.refresh(nueva_relacion)
            return nueva_relacion
            
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error al crear relación: {str(e)}")

@router.post("/prolog/sincronizar")
async def sincronizar_relaciones_prolog(db: Session = Depends(get_db)):
    """Sincronizar relaciones desde Prolog a PostgreSQL"""
    try:
        PROLOG_URL = "http://prolog-engine:4000"
        
        # Obtener relaciones de Prolog
        response = requests.get(f"{PROLOG_URL}/relaciones_aprendidas", timeout=10)
        if response.status_code != 200:
            raise HTTPException(500, "Error obteniendo relaciones de Prolog")
        
        data = response.json()
        relaciones_prolog = data.get('relaciones', [])
        
        # Limpiar relaciones existentes de co_ocurrencia
        db.query(RelacionAprendida).filter(
            RelacionAprendida.fuente == 'co_ocurrencia'
        ).delete()
        
        # Insertar nuevas relaciones
        for rel in relaciones_prolog:
            nueva_relacion = RelacionAprendida(
                habilidad_base=rel['habilidad_base'],
                habilidad_objetivo=rel['habilidad_objetivo'],
                confianza=rel['confianza'],
                frecuencia=rel['frecuencia'],
                fuente='co_ocurrencia'
            )
            db.add(nueva_relacion)
        
        db.commit()
        
        return {
            "message": f"{len(relaciones_prolog)} relaciones sincronizadas desde Prolog",
            "relaciones_sincronizadas": len(relaciones_prolog)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error sincronizando relaciones: {str(e)}")

@router.post("/prolog/ejecutar-aprendizaje")
async def ejecutar_aprendizaje_prolog(db: Session = Depends(get_db)):
    """Ejecutar aprendizaje automático en Prolog y sincronizar resultados"""
    try:
        PROLOG_URL = "http://prolog-engine:4000"
        
        # Ejecutar aprendizaje
        response_aprender = requests.post(f"{PROLOG_URL}/aprender", timeout=30)
        if response_aprender.status_code != 200:
            raise HTTPException(500, "Error ejecutando aprendizaje en Prolog")
        
        # Sincronizar relaciones
        response_sincronizar = requests.post(
            f"{PROLOG_URL}/relaciones-aprendidas/prolog/sincronizar",
            timeout=10
        )
        
        return {
            "message": "Aprendizaje ejecutado y relaciones sincronizadas",
            "aprendizaje": response_aprender.json(),
            "sincronizacion": response_sincronizar.json()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error en proceso de aprendizaje: {str(e)}")
    
@router.post("/sincronizar-manual")
async def sincronizar_manual(db: Session = Depends(get_db)):
    """Sincronizar relaciones desde archivo local (cuando falla la automática)"""
    try:
        # Ruta del archivo generado por Prolog
        archivo_path = "/app/prolog_data/relaciones_aprendidas.pl"
        
        if not os.path.exists(archivo_path):
            raise HTTPException(404, "Archivo de relaciones no encontrado")
        
        relaciones_procesadas = 0
        relaciones = []
        
        # Leer y parsear el archivo
        with open(archivo_path, 'r') as f:
            contenido = f.read()
        
        # Buscar líneas con relaciones
        import re
        patron = r'relacion_co_ocurrencia\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)'
        matches = re.findall(patron, contenido)
        
        for match in matches:
            try:
                habilidad_base = match[0].strip().strip("'\"")
                habilidad_objetivo = match[1].strip().strip("'\"")
                confianza = float(match[2].strip())
                frecuencia = int(match[3].strip())
                
                relaciones.append({
                    "habilidad_base": habilidad_base,
                    "habilidad_objetivo": habilidad_objetivo, 
                    "confianza": confianza,
                    "frecuencia": frecuencia
                })
                
            except (ValueError, IndexError) as e:
                print(f"⚠️ Error parseando relación: {match} - {e}")
                continue
        
        # Guardar en base de datos
        for rel in relaciones:
            # Verificar si ya existe
            existente = db.query(RelacionAprendida).filter(
                RelacionAprendida.habilidad_base == rel["habilidad_base"],
                RelacionAprendida.habilidad_objetivo == rel["habilidad_objetivo"]
            ).first()
            
            if existente:
                # Actualizar existente
                existente.confianza = rel["confianza"]
                existente.frecuencia = rel["frecuencia"]
                existente.activo = True
            else:
                # Crear nueva
                nueva_relacion = RelacionAprendida(
                    habilidad_base=rel["habilidad_base"],
                    habilidad_objetivo=rel["habilidad_objetivo"],
                    confianza=rel["confianza"],
                    frecuencia=rel["frecuencia"],
                    fuente="co_ocurrencia"
                )
                db.add(nueva_relacion)
            
            relaciones_procesadas += 1
        
        db.commit()
        
        return {
            "message": f"Sincronización manual completada",
            "relaciones_procesadas": relaciones_procesadas,
            "relaciones_encontradas": len(relaciones)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error en sincronización manual: {str(e)}")