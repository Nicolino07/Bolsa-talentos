# app/matching/routes.py

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
