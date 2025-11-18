import os
import unicodedata
import requests
from sqlalchemy import text
from app.database import SessionLocal


def limpiar_y_formatear(texto):
    if texto is None:
        return ""
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    texto = " ".join([t.capitalize() for t in texto.split()])
    return texto


def generar_hechos():
    db = SessionLocal()
    
    # RUTAS - escribir en volumen Y en directorio del código
    rutas_hechos = [
        "/app/prolog_data/hechos.pl",      # ← Volumen compartido (funcionalidad)
        "/app/app/prolog/hechos_visible.pl" # ← Directorio código (para ver)
    ]
    
    rutas_ofertas = [
        "/app/prolog_data/ofertas.pl",      # ← Volumen compartido  
        "/app/app/prolog/ofertas_visible.pl" # ← Directorio código (para ver)
    ]


    lineas_hechos = []
    lineas_ofertas = []

    # -------------------------
    # PERSONA
    # -------------------------
    personas = db.execute(text("""
        SELECT dni, nombre, apellido, ciudad, provincia
        FROM persona
    """)).fetchall()

    for p in personas:
        lineas_hechos.append(
            f'persona({p.dni}, "{limpiar_y_formatear(p.nombre)}", "{limpiar_y_formatear(p.apellido)}", '
            f'"{limpiar_y_formatear(p.ciudad)}", "{limpiar_y_formatear(p.provincia)}").'
        )

    # -------------------------
    # PERSONA_ACTIVIDAD
    # -------------------------
    pa = db.execute(text("""
        SELECT dni, id_actividad, nivel_experiencia, años_experiencia
        FROM persona_actividad
    """)).fetchall()

    for a in pa:
        nivel = limpiar_y_formatear(a.nivel_experiencia).lower()
        lineas_hechos.append(
            f'persona_actividad({a.dni}, {a.id_actividad}, "{nivel}", {a.años_experiencia}).'
        )

    # -------------------------
    # OFERTAS
    # -------------------------
    ofertas = db.execute(text("""
        SELECT id_oferta, id_empresa, titulo, activa
        FROM oferta_empleo
    """)).fetchall()

    for o in ofertas:
        activa_atom = "true" if o.activa else "false"
        lineas_ofertas.append(
            f'oferta({o.id_oferta}, {o.id_empresa}, "{limpiar_y_formatear(o.titulo)}", {activa_atom}).'
        )

    # -------------------------
    # OFERTA_ACTIVIDAD
    # -------------------------
    oa = db.execute(text("""
        SELECT id_oferta, id_actividad, nivel_requerido
        FROM oferta_actividad
    """)).fetchall()

    for o in oa:
        nivel = limpiar_y_formatear(o.nivel_requerido).lower()
        lineas_ofertas.append(
            f'oferta_actividad({o.id_oferta}, {o.id_actividad}, "{nivel}").'
        )

    # -------------------------
    # ESCRIBIR EN AMBAS RUTAS
    # -------------------------
    contenido_hechos = "\n".join(lineas_hechos)
    contenido_ofertas = "\n".join(lineas_ofertas)

    # Escribir en todas las rutas de hechos
    for ruta in rutas_hechos:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_hechos)
            print(f"✅ hechos.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    for ruta in rutas_ofertas:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_ofertas)
            print(f"✅ ofertas.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    db.close()

    print("🎯 Archivos generados en todas las rutas configuradas")

    # SOLO RECARGAR (NO UPLOAD NECESARIO)
    try:
        PROLOG_URL = os.getenv("PROLOG_URL", "http://prolog-engine:4000")
        
        print("🔄 Solicitando recarga de hechos en Prolog...")
        resp = requests.post(f"{PROLOG_URL}/reload_hechos", timeout=10)
        resp.raise_for_status()
        print("✅ Recarga de hechos exitosa")

    except Exception as e:
        print(f"❌ ERROR recargando hechos en Prolog: {e}")

    return {
        "hechos": rutas_hechos,
        "ofertas": rutas_ofertas,
        "reglas_hechos": len(lineas_hechos),
        "reglas_ofertas": len(lineas_ofertas)
    }