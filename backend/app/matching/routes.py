# backend/app/matching/routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.matching.servicio import obtener_matches_para_oferta

router = APIRouter()

@router.get("/ofertas/{id_oferta}/matches")
def matches_oferta(id_oferta: int):
    try:
        res = obtener_matches_para_oferta(id_oferta, top_n=10)
        return {"ok": True, "oferta": id_oferta, "matches": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))