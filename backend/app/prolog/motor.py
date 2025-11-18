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
            # URL CORREGIDA: usar parámetro query en lugar de path
            url = f"{self.prolog_url}/matching?dni={dni}"
            print(f"🔍 Llamando a Prolog: {url}")
            
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            
            resultado = r.json()
            print(f"✅ Respuesta de Prolog: {len(resultado.get('recomendaciones', []))} recomendaciones")
            
            return resultado
            
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Error de conexión con Prolog: {e}")
            return {
                "status": "error",
                "message": f"No se pudo conectar con el servicio de matching: {e}",
                "dni": dni,
                "recomendaciones": []
            }
        except requests.exceptions.Timeout as e:
            print(f"❌ Timeout llamando a Prolog: {e}")
            return {
                "status": "error", 
                "message": "El servicio de matching no respondió a tiempo",
                "dni": dni,
                "recomendaciones": []
            }
        except Exception as e:
            print(f"💥 Error llamando a Prolog: {e}")
            return {
                "status": "error",
                "message": f"Error en el servicio de matching: {e}",
                "dni": dni, 
                "recomendaciones": []
            }
            
    def buscar_por_habilidades(self, actividades: list, nivel_minimo: int):
        """Buscar candidatos por habilidades específicas"""
        try:
            actividades_str = str(actividades).replace(" ", "")
            url = f"{self.prolog_url}/buscar_por_habilidades?actividades={actividades_str}&nivel_minimo={nivel_minimo}"
            
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def buscar_por_ubicacion(self, ciudad: str = "", provincia: str = ""):
        """Buscar candidatos por ubicación"""
        try:
            params = {}
            if ciudad: params["ciudad"] = ciudad
            if provincia: params["provincia"] = provincia
            
            url = f"{self.prolog_url}/buscar_por_ubicacion"
            r = requests.get(url, params=params, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def ofertas_por_empresa(self, id_empresa: int):
        """Buscar ofertas por empresa"""
        try:
            url = f"{self.prolog_url}/ofertas_por_empresa?id_empresa={id_empresa}"
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}

    def matching_avanzado(self, dni: int, id_oferta: int):
        """Verificar matching específico entre persona y oferta"""
        try:
            url = f"{self.prolog_url}/matching_avanzado?dni={dni}&id_oferta={id_oferta}"
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"error": str(e)}
        
        