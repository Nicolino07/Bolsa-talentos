from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db

# Importaciones CORRECTAS basadas en tu estructura real
from app.personas.models import Persona
from app.actividades.models import Actividad, PersonaActividad, EmpresaActividad
from app.ofertas.models import OfertaEmpleo, OfertaActividad
from app.empresas.models import Empresa

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check con verificación de base de datos"""
    try:
        # Verificar que podemos acceder a la base de datos
        total_personas = db.query(Persona).count()
        total_ofertas = db.query(OfertaEmpleo).count()
        total_actividades = db.query(Actividad).count()
        
        return {
            "status": "healthy", 
            "module": "matching",
            "database": "connected",
            "total_personas": total_personas,
            "total_ofertas": total_ofertas,
            "total_actividades": total_actividades,
            "message": "✅ Módulo de matching funcionando con base de datos real"
        }
    except Exception as e:
        logger.error(f"Error en health check: {e}")
        return {
            "status": "degraded",
            "database": "error",
            "error": str(e)
        }

@router.get("/buscar/habilidad/{habilidad}")
async def buscar_por_habilidad(habilidad: str, db: Session = Depends(get_db)):
    """Búsqueda por habilidad - CON BASE DE DATOS REAL"""
    try:
        # Buscar personas que tienen esta habilidad/actividad
        personas_con_habilidad = db.query(Persona).join(
            PersonaActividad
        ).join(
            Actividad
        ).filter(
            Actividad.nombre.ilike(f"%{habilidad}%")
        ).all()
        
        resultados = []
        for persona in personas_con_habilidad:
            # Obtener información específica de la habilidad
            actividad_persona = db.query(PersonaActividad).join(
                Actividad
            ).filter(
                PersonaActividad.dni == persona.dni,
                Actividad.nombre.ilike(f"%{habilidad}%")
            ).first()
            
            if actividad_persona:
                resultados.append({
                    "dni": persona.dni,
                    "nombre": f"{persona.nombre} {persona.apellido}",
                    "ciudad": persona.ciudad,
                    "habilidad": actividad_persona.actividad.nombre,
                    "nivel": actividad_persona.nivel_experiencia,
                    "años_experiencia": actividad_persona.años_experiencia or 0,
                    "email": persona.email,
                    "telefono": persona.telefono
                })
        
        return {
            "habilidad_buscada": habilidad,
            "personas_encontradas": len(resultados),
            "personas": resultados,
            "mensaje": f"✅ Encontradas {len(resultados)} personas con {habilidad} en la base de datos"
        }
        
    except Exception as e:
        logger.error(f"Error en búsqueda: {e}")
        raise HTTPException(status_code=500, detail=f"Error en búsqueda: {str(e)}")

@router.get("/persona/{dni}/recomendaciones")
async def recomendaciones_persona(dni: int, db: Session = Depends(get_db)):
    """Recomendaciones de ofertas para una persona - CON BASE DE DATOS REAL"""
    try:
        # Verificar que la persona existe
        persona = db.query(Persona).filter(Persona.dni == dni).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Obtener habilidades de la persona
        habilidades_persona = db.query(PersonaActividad).join(
            Actividad
        ).filter(
            PersonaActividad.dni == dni
        ).all()
        
        habilidades_persona_nombres = [pa.actividad.nombre for pa in habilidades_persona]
        
        # Obtener todas las ofertas activas
        ofertas = db.query(OfertaEmpleo).filter(
            OfertaEmpleo.activa == True
        ).all()
        
        recomendaciones = []
        
        for oferta in ofertas:
            # Obtener habilidades requeridas para esta oferta
            habilidades_requeridas = db.query(OfertaActividad).join(
                Actividad
            ).filter(
                OfertaActividad.id_oferta == oferta.id_oferta
            ).all()
            
            if not habilidades_requeridas:
                continue
            
            habilidades_requeridas_nombres = [oa.actividad.nombre for oa in habilidades_requeridas]
            niveles_requeridos = {oa.actividad.nombre: oa.nivel_requerido for oa in habilidades_requeridas}
            
            # Calcular compatibilidad
            habilidades_coincidentes = []
            habilidades_faltantes = []
            
            for habilidad_req in habilidades_requeridas_nombres:
                if habilidad_req in habilidades_persona_nombres:
                    habilidades_coincidentes.append(habilidad_req)
                else:
                    habilidades_faltantes.append(habilidad_req)
            
            if habilidades_coincidentes:
                # Calcular porcentaje de compatibilidad
                compatibilidad = (len(habilidades_coincidentes) / len(habilidades_requeridas_nombres)) * 100
                
                # Obtener nombre de la empresa si existe
                empresa_nombre = "Empresa"
                if oferta.id_empresa:
                    empresa = db.query(Empresa).filter(Empresa.id_empresa == oferta.id_empresa).first()
                    if empresa:
                        empresa_nombre = empresa.nombre
                
                recomendaciones.append({
                    "id_oferta": oferta.id_oferta,
                    "titulo": oferta.titulo,
                    "empresa": empresa_nombre,
                    "compatibilidad": round(compatibilidad, 1),
                    "habilidades_coincidentes": habilidades_coincidentes,
                    "total_habilidades_requeridas": len(habilidades_requeridas_nombres),
                    "habilidades_faltantes": habilidades_faltantes,
                    "descripcion": oferta.descripcion
                })
        
        # Ordenar por compatibilidad (mayor primero)
        recomendaciones.sort(key=lambda x: x["compatibilidad"], reverse=True)
        
        return {
            "persona_dni": dni,
            "nombre_persona": f"{persona.nombre} {persona.apellido}",
            "recomendaciones": recomendaciones,
            "total": len(recomendaciones),
            "total_habilidades_persona": len(habilidades_persona_nombres),
            "mensaje": f"✅ {len(recomendaciones)} ofertas recomendadas basadas en tus habilidades"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando recomendaciones: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando recomendaciones: {str(e)}")

@router.get("/ofertas/habilidad/{habilidad}")
async def ofertas_por_habilidad(habilidad: str, db: Session = Depends(get_db)):
    """Ofertas que requieren una habilidad específica - CON BASE DE DATOS REAL"""
    try:
        ofertas_con_habilidad = db.query(OfertaEmpleo).join(
            OfertaActividad
        ).join(
            Actividad
        ).filter(
            Actividad.nombre.ilike(f"%{habilidad}%"),
            OfertaEmpleo.activa == True
        ).all()
        
        resultados = []
        for oferta in ofertas_con_habilidad:
            # Obtener información de la habilidad requerida
            oferta_habilidad = db.query(OfertaActividad).join(
                Actividad
            ).filter(
                OfertaActividad.id_oferta == oferta.id_oferta,
                Actividad.nombre.ilike(f"%{habilidad}%")
            ).first()
            
            # Obtener empresa
            empresa_nombre = "Empresa"
            if oferta.id_empresa:
                empresa = db.query(Empresa).filter(Empresa.id_empresa == oferta.id_empresa).first()
                if empresa:
                    empresa_nombre = empresa.nombre
            
            if oferta_habilidad:
                resultados.append({
                    "id_oferta": oferta.id_oferta,
                    "titulo": oferta.titulo,
                    "empresa": empresa_nombre,
                    "habilidad_requerida": oferta_habilidad.actividad.nombre,
                    "nivel_requerido": oferta_habilidad.nivel_requerido,
                    "descripcion": oferta.descripcion,
                    "fecha_publicacion": oferta.fecha_publicacion.isoformat() if oferta.fecha_publicacion else None
                })
        
        return {
            "habilidad_buscada": habilidad,
            "ofertas_encontradas": len(resultados),
            "ofertas": resultados,
            "mensaje": f"✅ {len(resultados)} ofertas requieren {habilidad}"
        }
        
    except Exception as e:
        logger.error(f"Error buscando ofertas: {e}")
        raise HTTPException(status_code=500, detail=f"Error buscando ofertas: {str(e)}")

@router.get("/stats")
async def estadisticas(db: Session = Depends(get_db)):
    """Estadísticas reales del sistema"""
    try:
        total_personas = db.query(Persona).count()
        total_ofertas = db.query(OfertaEmpleo).filter(OfertaEmpleo.activa == True).count()
        total_empresas = db.query(Empresa).count()
        total_actividades = db.query(Actividad).count()
        
        # Habilidades más populares
        from sqlalchemy import func
        habilidades_populares = db.query(
            Actividad.nombre,
            func.count(PersonaActividad.dni).label('total_personas')
        ).join(
            PersonaActividad
        ).group_by(
            Actividad.nombre
        ).order_by(
            func.count(PersonaActividad.dni).desc()
        ).limit(5).all()
        
        return {
            "total_personas": total_personas,
            "total_ofertas": total_ofertas,
            "total_empresas": total_empresas,
            "total_actividades": total_actividades,
            "habilidades_populares": [hab[0] for hab in habilidades_populares],
            "mensaje": "✅ Estadísticas reales del sistema"
        }
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return {
            "error": str(e),
            "mensaje": "❌ Error obteniendo estadísticas"
        }