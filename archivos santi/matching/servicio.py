# backend/app/matching/servicio.py
import os
from sqlalchemy import text
from app.database import engine
from app.prolog.motor import MotorProlog

HECHOS_PATH = os.path.join(os.path.dirname(__file__), "..", "prolog", "hechos.pl")

def slug_nivel(n):
    if not n:
        return "'PRINCIPIANTE'"
    s = n.strip().upper()
    # garantizamos que sea uno de los 4 valores
    if s in ('PRINCIPIANTE','INTERMEDIO','AVANZADO','EXPERTO'):
        return f"'{s}'"
    return "'INTERMEDIO'"

def generar_hechos():
    with engine.connect() as conn:
        with open(HECHOS_PATH, "w", encoding="utf8") as f:
            f.write("% hechos generados automáticamente\n\n")
            # Personas
            for row in conn.execute(text("SELECT dni, ciudad, provincia FROM persona WHERE activa = true")).fetchall():
                dni, ciudad, provincia = row
                ciudad_s = ciudad.replace('"','\\"') if ciudad else ""
                prov_s = provincia.replace('"','\\"') if provincia else ""
                f.write(f"persona({dni}, \"{ciudad_s}\", \"{prov_s}\").\n")
            f.write("\n")
            # persona_actividad(dni, id_actividad, nivel, anos)
            for row in conn.execute(text("SELECT dni, id_actividad, nivel_experiencia, años_experiencia FROM persona_actividad")).fetchall():
                dni, id_act, nivel, anos = row
                nivel_atom = slug_nivel(nivel)
                anos_val = anos if anos is not None else 0
                f.write(f"persona_actividad({dni}, {id_act}, {nivel_atom}, {anos_val}).\n")
            f.write("\n")
            # empresas
            for row in conn.execute(text("SELECT id_empresa, nombre, ciudad, provincia, email, telefono FROM empresa WHERE activa = true")).fetchall():
                id_e, nombre, ciudad, provincia, email, telefono = row
                nombre_s = nombre.replace('"','\\"') if nombre else ""
                ciudad_s = ciudad.replace('"','\\"') if ciudad else ""
                prov_s = provincia.replace('"','\\"') if provincia else ""
                f.write(f"empresa({id_e}, \"{nombre_s}\", \"{ciudad_s}\", \"{prov_s}\", \"{email}\", \"{telefono}\").\n")
            f.write("\n")
            # ofertas
            for row in conn.execute(text("SELECT id_oferta, id_empresa, titulo, descripcion, fecha_publicacion, activa FROM oferta_empleo")).fetchall():
                id_of, id_emp, titulo, desc, fecha, activa = row
                titulo_s = (titulo or "").replace('"','\\"')
                desc_s = (desc or "").replace('"','\\"')
                f.write(f"oferta_empleo({id_of}, {id_emp}, \"{titulo_s}\", \"{desc_s}\").\n")
            f.write("\n")
            # oferta_actividad(id_oferta, id_actividad, nivel_requerido)
            for row in conn.execute(text("SELECT id_oferta, id_actividad, nivel_requerido FROM oferta_actividad")).fetchall():
                id_of, id_act, nivel_req = row
                nivel_atom = slug_nivel(nivel_req)
                f.write(f"oferta_actividad({id_of}, {id_act}, {nivel_atom}).\n")
            # si querés generar actividad_relacionada lo hacés manual o desde una tabla
            f.write("\n% actividad_relacionada Ejemplos (si no tenés tabla propia)\n")
            f.write("actividad_relacionada(1,2).\nactividad_relacionada(2,1).\n")
    return HECHOS_PATH

def obtener_matches_para_oferta(id_oferta, top_n=10):
    # 1) regenerar hechos
    generar_hechos()
    # 2) usar motor prolog
    motor = MotorProlog()
    top = motor.top_n_for_offer(id_oferta, n=top_n)
    # formatear
    formatted = [{"dni": int(r["DNI"]), "score": float(r["Score"])} for r in top]
    return formatted