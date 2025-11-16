# backend/app/prolog/motor.py
from pyswip import Prolog
import os

BASE = os.path.dirname(__file__)
REGLAS = os.path.join(BASE, "reglas.pl")
HECHOS = os.path.join(BASE, "hechos.pl")

class MotorProlog:
    def __init__(self):
        self.prolog = Prolog()
        # Consultamos las reglas una vez (están estáticas)
        self.prolog.consult(REGLAS)

    def recargar_hechos(self):
        # (re)consultamos hechos para que reflejen el nuevo hechos.pl
        # en algunos entornos es más seguro crear un nuevo Prolog() por request,
        # pero intentamos reconsultar aquí
        try:
            self.prolog.consult(HECHOS)
        except Exception:
            # si falla, crear nueva instancia (más robusto en entornos concurridos)
            self.prolog = Prolog()
            self.prolog.consult(REGLAS)
            self.prolog.consult(HECHOS)

    def score_for_offer(self, oferta_id):
        self.recargar_hechos()
        q = f"score_total(DNI, {oferta_id}, Score)"
        resultados = list(self.prolog.query(q))
        # cada elemento: {'DNI': 12345678, 'Score': 82.5}
        return resultados

    def top_n_for_offer(self, oferta_id, n=10):
        res = self.score_for_offer(oferta_id)
        # ordenar por Score desc (y convertir valores si vienen como Decimals)
        res_sorted = sorted(res, key=lambda r: float(r['Score']), reverse=True)
        return res_sorted[:n]