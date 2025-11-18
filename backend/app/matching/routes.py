# app/matching/routes.py

import json
from fastapi import APIRouter, Depends
from app.database import get_db
from sqlalchemy.orm import Session

from app.matching.servicio import generar_hechos
from app.prolog.motor import MotorProlog

router = APIRouter()


@router.post("/generar-hechos", summary="Regenerar hechos.pl desde la base")
def generar_hechos_endpoint(db: Session = Depends(get_db)):
    return generar_hechos(db)


@router.get("/matching/{dni}", summary="Obtener recomendaciones para una persona")
def matching(dni: int):
    motor = MotorProlog()
    return motor.buscar_recomendaciones(dni)

@router.get("/prolog/test")
def test_prolog():
    import os, requests
    url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")
    try:
        r = requests.get(f"{url}/reload_hechos", timeout=5)
        return {
            "backend": "ok",
            "prolog_url": url,
            "prolog_response": r.json()
        }
    except Exception as e:
        return {
            "backend": "ok",
            "prolog_url": url,
            "error": str(e)
        }

@router.get("/buscar_por_habilidades", summary="Buscar candidatos por habilidades")
def buscar_por_habilidades(actividades: str, nivel_minimo: int = 2):
    """Buscar personas que tengan las habilidades especificadas
    Ejemplo: actividades=1,2,3&nivel_minimo=2
    """
    motor = MotorProlog()
    
    try:
        # Opción 1: Si viene como "1,2,3" (formato simple)
        if ',' in actividades:
            actividades_list = [int(x.strip()) for x in actividades.split(',')]
        # Opción 2: Si viene como "[1,2,3]" (formato JSON)
        elif actividades.startswith('[') and actividades.endswith(']'):
            actividades_list = json.loads(actividades)
        # Opción 3: Si viene como un solo número "1"
        else:
            actividades_list = [int(actividades)]
        
        print(f"🔍 Buscando por habilidades: {actividades_list}, nivel mínimo: {nivel_minimo}")
        return motor.buscar_por_habilidades(actividades_list, nivel_minimo)
        
    except Exception as e:
        print(f"❌ Error procesando actividades: {e}")
        return {"status": "error", "message": f"Error en formato de actividades: {e}"}

@router.get("/buscar_por_ubicacion", summary="Buscar candidatos por ubicación")
def buscar_por_ubicacion(ciudad: str = "", provincia: str = ""):
    motor = MotorProlog()
    return motor.buscar_por_ubicacion(ciudad, provincia)

@router.get("/ofertas_por_empresa/{id_empresa}", summary="Obtener ofertas de una empresa")
def ofertas_por_empresa(id_empresa: int):
    motor = MotorProlog()
    return motor.ofertas_por_empresa(id_empresa)

@router.get("/matching_avanzado", summary="Verificar matching específico")
def matching_avanzado(dni: int, id_oferta: int):
    motor = MotorProlog()
    return motor.matching_avanzado(dni, id_oferta)