import os
import requests
from sqlalchemy.orm import Session
from app.prolog.generador_hechos import generar_hechos as generador_principal


def generar_hechos(db: Session = None):
    """
    Genera hechos.pl y ofertas.pl y los envía al microservicio Prolog.
    """
    rutas = generador_principal()   # ← genera archivos correctamente

    enviar_hechos_a_prolog(rutas["hechos"], rutas["ofertas"])

    return rutas


def enviar_hechos_a_prolog(path_hechos: str, path_ofertas: str):
    prolog_url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")

    if not os.path.exists(path_hechos) or not os.path.exists(path_ofertas):
        print("❌ Archivos no encontrados:", path_hechos, path_ofertas)
        return {"status": "error", "detalle": "archivos no encontrados"}

    files = {
        "hechos": open(path_hechos, "rb"),
        "ofertas": open(path_ofertas, "rb")
    }

    try:
        r = requests.post(
            f"{prolog_url}/upload_hechos",
            files=files,
            timeout=30
        )
        r.raise_for_status()
        print("✔ Prolog respondió:", r.status_code, r.text)
        if r.headers.get("content-type", "").startswith("application/json"):
            return r.json()
        return {"status": "ok", "raw": r.text}
    except Exception as e:
        print("❌ ERROR enviando hechos a Prolog:", e)
        return {"status": "error", "detalle": str(e)}
    finally:
        files["hechos"].close()
        files["ofertas"].close()


def recargar_hechos_en_prolog():
    prolog_url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")
    try:
        r = requests.get(f"{prolog_url}/reload_hechos", timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print("❌ Error recargando hechos en Prolog:", e)
        return {"status": "error", "detalle": str(e)}
