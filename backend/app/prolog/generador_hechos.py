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
        "/app/app/prolog/hechos.pl"        # ← para ver en local
    ]
    
    rutas_ofertas = [
        "/app/prolog_data/ofertas.pl",     # ← Volumen compartido  
        "/app/app/prolog/ofertas.pl"       # ← para ver en local
    ]
    
    rutas_relaciones = [
        "/app/prolog_data/relaciones.pl",  # ← Volumen compartido
        "/app/app/prolog/relaciones.pl"    # ← para ver en local
    ]
    
    rutas_postulaciones = [
        "/app/prolog_data/postulaciones.pl",  # ← Volumen compartido
        "/app/app/prolog/postulaciones.pl"    # ← para ver en local
    ]

    lineas_hechos = []
    lineas_ofertas = []
    lineas_relaciones = []
    lineas_postulaciones = []

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
    # ACTIVIDAD (necesario para las relaciones)
    # -------------------------
    actividades = db.execute(text("""
        SELECT id_actividad, nombre, area, especialidad, descripcion
        FROM actividad
    """)).fetchall()

    for act in actividades:
        lineas_hechos.append(
            f'actividad({act.id_actividad}, "{limpiar_y_formatear(act.nombre)}", '
            f'"{limpiar_y_formatear(act.area)}", "{limpiar_y_formatear(act.especialidad)}", '
            f'"{limpiar_y_formatear(act.descripcion)}").'
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
    # RELACIONES APRENDIDAS
    # -------------------------
    relaciones = db.execute(text("""
        SELECT habilidad_base, habilidad_objetivo, confianza, frecuencia, fuente
        FROM relaciones_aprendidas
        WHERE activo = true
    """)).fetchall()

    for rel in relaciones:
        lineas_relaciones.append(
            f'relacion_aprendida("{limpiar_y_formatear(rel.habilidad_base)}", '
            f'"{limpiar_y_formatear(rel.habilidad_objetivo)}", {float(rel.confianza)}, '
            f'{rel.frecuencia}, "{rel.fuente}").'
        )

    # Si no hay relaciones, agregar algunas por defecto
    if not lineas_relaciones:
        lineas_relaciones.extend([
            '% Relaciones por defecto (se aprenderán automáticamente con el tiempo)',
            'relacion_aprendida("Python", "Django", 0.85, 1, "manual").',
            'relacion_aprendida("Python", "Flask", 0.78, 1, "manual").',
            'relacion_aprendida("Java", "Spring Boot", 0.82, 1, "manual").',
            'relacion_aprendida("JavaScript", "React", 0.90, 1, "manual").',
            'relacion_aprendida("SQL", "PostgreSQL", 0.88, 1, "manual").'
        ])

    # -------------------------
    # POSTULACIONES
    # -------------------------
    postulaciones = db.execute(text("""
        SELECT dni, id_oferta, estado
        FROM postulaciones
    """)).fetchall()

    for post in postulaciones:
        lineas_postulaciones.append(
            f'postulacion({post.dni}, {post.id_oferta}, "{post.estado}").'
        )

    # -------------------------
    # EMPRESA (opcional, para búsquedas semánticas)
    # -------------------------
    empresas = db.execute(text("""
        SELECT id_empresa, nombre, rubro, ciudad, provincia
        FROM empresa
        WHERE activa = true
    """)).fetchall()

    for emp in empresas:
        lineas_hechos.append(
            f'empresa({emp.id_empresa}, "{limpiar_y_formatear(emp.nombre)}", '
            f'"{limpiar_y_formatear(emp.rubro)}", "{limpiar_y_formatear(emp.ciudad)}", '
            f'"{limpiar_y_formatear(emp.provincia)}").'
        )

    # -------------------------
    # EMPRESA_ACTIVIDAD (opcional)
    # -------------------------
    ea = db.execute(text("""
        SELECT id_empresa, id_actividad, especializacion
        FROM empresa_actividad
    """)).fetchall()

    for emp_act in ea:
        lineas_hechos.append(
            f'empresa_actividad({emp_act.id_empresa}, {emp_act.id_actividad}, '
            f'"{limpiar_y_formatear(emp_act.especializacion)}").'
        )

    # -------------------------
    # ESCRIBIR EN TODAS LAS RUTAS
    # -------------------------
    contenido_hechos = "\n".join(lineas_hechos)
    contenido_ofertas = "\n".join(lineas_ofertas)
    contenido_relaciones = "\n".join(lineas_relaciones)
    contenido_postulaciones = "\n".join(lineas_postulaciones)

    # Escribir hechos.pl
    for ruta in rutas_hechos:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_hechos)
            print(f"✅ hechos.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    # Escribir ofertas.pl
    for ruta in rutas_ofertas:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_ofertas)
            print(f"✅ ofertas.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    # Escribir relaciones.pl
    for ruta in rutas_relaciones:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_relaciones)
            print(f"✅ relaciones.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    # Escribir postulaciones.pl
    for ruta in rutas_postulaciones:
        try:
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido_postulaciones)
            print(f"✅ postulaciones.pl generado en: {ruta}")
        except Exception as e:
            print(f"⚠️  No se pudo escribir en {ruta}: {e}")

    db.close()

    print("🎯 Todos los archivos Prolog generados en las rutas configuradas")
    print(f"📊 Estadísticas: {len(lineas_hechos)} hechos, {len(lineas_ofertas)} ofertas, "
          f"{len(lineas_relaciones)} relaciones, {len(lineas_postulaciones)} postulaciones")

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
        "relaciones": rutas_relaciones,
        "postulaciones": rutas_postulaciones,
        "reglas_hechos": len(lineas_hechos),
        "reglas_ofertas": len(lineas_ofertas),
        "reglas_relaciones": len(lineas_relaciones),
        "reglas_postulaciones": len(lineas_postulaciones)
    }


# Para ejecutar directamente si es necesario
if __name__ == "__main__":
    generar_hechos()