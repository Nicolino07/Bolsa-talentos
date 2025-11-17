import os
import requests

PROLOG_URL = os.getenv("PROLOG_URL", "http://prolog-engine:4000")

class MotorProlog:



    @staticmethod
    def cargar_hechos(archivo_texto: str):
        files = {"file": ("hechos.pl", archivo_texto, "text/plain")}
        try:
            r = requests.post(f"{PROLOG_URL}/upload_hechos", files=files, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"status": "error", "detalle": str(e)}

    @staticmethod
    def consultar(predicado: str):
        try:
            r = requests.post(f"{PROLOG_URL}/consultar", json={"query": predicado}, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"status": "error", "detalle": str(e)}
        
    def __init__(self):
        self.prolog_url = os.getenv("PROLOG_URL", "http://prolog-engine:4000")

    def buscar_recomendaciones(self, dni: int):
        """Consulta al microservicio Prolog para obtener recomendaciones."""
        try:
            r = requests.get(f"{self.prolog_url}/matching/{dni}", timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}