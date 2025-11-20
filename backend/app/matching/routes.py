# app/matching/routes.py

import json
from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.matching.servicio import generar_hechos
from app.prolog.motor import MotorProlog
from app.database import SessionLocal
import os
import re


router = APIRouter()
db: Session = Depends(get_db)

@router.post("/generar-hechos", summary="Regenerar hechos.pl desde la base")
def generar_hechos_endpoint(db: Session = Depends(get_db)):
    return generar_hechos(db)


@router.get("/matching/{dni}", summary="Obtener recomendaciones para una persona")
def matching(dni: int, db: Session = Depends(get_db)): 
    generar_hechos(db)  # recargar base de conocimiento
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


PROLOG_URL = os.getenv("PROLOG_URL", "http://prolog-engine:4000")


# ============================================================
#  🚀  BÚSQUEDA SEMÁNTICA COMPLETA
# ============================================================

@router.get("/buscar_semantica")
def buscar_semantica(consulta: str = Query(...), db: Session = Depends(get_db)):
    print("\n==============================")
    print(f"🔍 Buscando SEMÁNTICO: {consulta}")
    print("==============================")

    texto = consulta.lower().strip()
    palabras = [p for p in texto.split() if p.strip()]

    if not palabras:
        print("⚠️ Consulta vacía.")
        return []

    print(f"📌 Palabras base: {palabras}")

    # -----------------------------------
    # 1) Expansión semántica vía Prolog
    # -----------------------------------
    try:
       
        expandidas = MotorProlog.expandir(palabras)

        if not expandidas:
            print("⚠️ Prolog no devolvió expansiones.")
            expandidas = palabras

        print(f"📌 Expandidas: {expandidas}")

    except Exception as e:
        print("⚠️ Error usando MotorProlog:", e)
        expandidas = palabras

    # -----------------------------------
    # 2) SQL dinámico basado en expansiones
    # -----------------------------------
    like_clauses = " OR ".join([
        "(titulo ILIKE :p{0} OR descripcion ILIKE :p{0}_d)".format(i)
        for i in range(len(expandidas))
    ])

    params = {}
    for i, palabra in enumerate(expandidas):
        wildcard = f"%{palabra}%"
        params[f"p{i}"] = wildcard
        params[f"p{i}_d"] = wildcard

    sql = text("""
        SELECT 
            o.id_oferta,
            o.titulo,
            o.descripcion,
            COALESCE(e.ciudad, p.ciudad) AS ciudad,
            COALESCE(e.provincia, p.provincia) AS provincia
        FROM oferta_empleo o
        LEFT JOIN empresa e ON o.id_empresa = e.id_empresa
        LEFT JOIN persona p ON o.persona_dni = p.dni
        WHERE 
            """ + " OR ".join([
                "(o.titulo ILIKE :p{0} OR o.descripcion ILIKE :p{0}_d)".format(i)
                for i in range(len(palabras))
            ])
    )

    params = {}
    for i, palabra in enumerate(palabras):
        params[f"p{i}"] = f"%{palabra}%"
        params[f"p{i}_d"] = f"%{palabra}%"

    resultados = db.execute(sql, params).fetchall()

    print(f"📌 Total ofertas encontradas: {len(resultados)}")
    print("==============================\n")

    return [
        {
            "id_oferta": r.id_oferta,
            "titulo": r.titulo,
            "descripcion": r.descripcion,
            "ciudad": r.ciudad
        }
        for r in resultados
    ]


@router.get("/buscar_semantica_personas")
def buscar_semantica_personas(consulta: str = Query(...), db: Session = Depends(get_db)):
    """
    Búsqueda semántica de personas por actividades, habilidades, ciudad o provincia.
    """

    print("\n==============================")
    print("🔍 Buscando SEMÁNTICO PERSONAS:", consulta)
    print("==============================")

    # Extraer palabras limpias
    palabras = re.findall(r"\w+", consulta.lower())
    print("📌 Palabras base:", palabras)

    # intentar expansión semántica
    try:
        motor = MotorProlog()
        expandidas = motor.expandir(palabras)
    except Exception as e:
        print("⚠️ Error expandiendo palabras:", e)
        expandidas = palabras

    print("📌 Expandidas:", expandidas)

    # ----------------------------------------------------------------------
    # SQL dinámico: busca en actividades, ciudad, provincia, nombre, apellido
    # ----------------------------------------------------------------------

    condiciones = []
    params = {}

    for i, p in enumerate(expandidas):
        param = f"p{i}"
        params[param] = f"%{p}%"

        condiciones.append(
            f"""
            (
                LOWER(per.nombre) ILIKE :{param}
                OR LOWER(per.apellido) ILIKE :{param}
                OR LOWER(per.ciudad) ILIKE :{param}
                OR LOWER(per.provincia) ILIKE :{param}
                OR EXISTS (
                    SELECT 1 FROM persona_actividad pa
                    JOIN actividad a ON pa.id_actividad = a.id_actividad
                    WHERE pa.dni = per.dni
                    AND LOWER(a.nombre) ILIKE :{param}
                )
            )
            """
        )

    sql = text(f"""
        SELECT per.dni,
               per.nombre,
               per.apellido,
               per.ciudad,
               per.provincia,
               COALESCE(
                   (
                       SELECT string_agg(a.nombre, ', ')
                       FROM persona_actividad pa
                       JOIN actividad a ON a.id_actividad = pa.id_actividad
                       WHERE pa.dni = per.dni
                   ), ''
               ) AS actividades
        FROM persona per
        WHERE {" OR ".join(condiciones)}
        ORDER BY per.nombre
    """)

    print("📌 Ejecutando SQL...")

    filas = db.execute(sql, params).mappings().all()

    print("📌 Resultados crudos:", len(filas))

    # Convertir a JSON limpio
    personas = [
        {
            "dni": f["dni"],
            "nombre": f["nombre"],
            "apellido": f["apellido"],
            "ciudad": f["ciudad"],
            "provincia": f["provincia"],
            "actividades": f["actividades"].split(", ") if f["actividades"] else []
        }
        for f in filas
    ]

    print("📌 Total personas enviadas:", len(personas))
    print("==============================\n")

    return {"personas": personas}