import os
import requests
from sqlalchemy.orm import Session
from app.prolog.generador_hechos import generar_hechos as generador_principal


def generar_hechos(db: Session = None):
    """
    Genera hechos.pl y ofertas.pl y los envía al microservicio Prolog.
    """
    rutas = generador_principal()   # ← genera archivos correctamente

    recargar_hechos_en_prolog()

    return {
        **rutas,
        "message": "Archivos generados y recargados via volumen compartido"
    }


def enviar_hechos_a_prolog(path_hechos: str, path_ofertas: str):
    """
    OPCIÓN ALTERNATIVA: Si quieres mantener el upload, cambia a modo texto
    """
    prolog_url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")

    if not os.path.exists(path_hechos) or not os.path.exists(path_ofertas):
        print("❌ Archivos no encontrados:", path_hechos, path_ofertas)
        return {"status": "error", "detalle": "archivos no encontrados"}

    # LEER COMO TEXTO, NO BINARIO
    with open(path_hechos, "r", encoding="utf-8") as h, open(path_ofertas, "r", encoding="utf-8") as o:
        hechos_content = h.read()
        ofertas_content = o.read()

    files = {
        "hechos": ("hechos.pl", hechos_content, "text/plain"),
        "ofertas": ("ofertas.pl", ofertas_content, "text/plain")
    }

    try:
        print(f"📤 Enviando archivos a Prolog...")
        r = requests.post(
            f"{prolog_url}/upload_hechos",
            files=files,
            timeout=30
        )
        r.raise_for_status()
        print("✅ Prolog respondió:", r.status_code)
        return r.json()
    except Exception as e:
        print("❌ ERROR enviando hechos a Prolog:", e)
        # Fallback: recargar desde volumen compartido
        return recargar_hechos_en_prolog()


def recargar_hechos_en_prolog():
    prolog_url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")
    try:
        print("🔄 Recargando hechos en Prolog...")
        r = requests.post(f"{prolog_url}/reload_hechos", timeout=10)
        r.raise_for_status()
        print("✅ Recarga exitosa")
        return r.json()
    except Exception as e:
        print("❌ Error recargando hechos en Prolog:", e)
        return {"status": "error", "detalle": str(e)}