import os
import logging
from typing import List, Dict, Any
from pyswip import Prolog
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class MotorProlog:
    def __init__(self, db_session: Session = None):
        self.prolog = Prolog()
        self.db_session = db_session
        self.reglas_path = os.path.join(os.path.dirname(__file__), "reglas.pl")
        
        self._inicializar_prolog()
    
    def _inicializar_prolog(self):
        """Inicializa Prolog y carga las reglas desde reglas.pl"""
        try:
            # Cargar reglas desde archivo
            if os.path.exists(self.reglas_path):
                self.prolog.consult(self.reglas_path)
                logger.info("✅ Reglas Prolog cargadas desde reglas.pl")
            else:
                logger.warning("⚠️ Archivo reglas.pl no encontrado, usando reglas básicas")
                self._cargar_reglas_basicas()
                
        except Exception as e:
            logger.error(f"❌ Error inicializando Prolog: {e}")
            self._cargar_reglas_basicas()
    
    def _cargar_reglas_basicas(self):
        """Carga reglas básicas si no existe reglas.pl"""
        reglas = """
        nivel_valor('PRINCIPIANTE', 1).
        nivel_valor('INTERMEDIO', 2).
        nivel_valor('AVANZADO', 3).
        nivel_valor('EXPERTO', 4).
        sum_list([], 0).
        sum_list([H|T], Sum) :- sum_list(T, SumT), Sum is H + SumT.
        """
        for regla in reglas.strip().split('.'):
            if regla.strip():
                try:
                    self.prolog.assertz(regla.strip() + '.')
                except:
                    pass
    
    def generar_hechos_desde_db(self):
        """Genera hechos Prolog desde PostgreSQL"""
        if not self.db_session:
            return
        
        try:
            from app.personas.models import Persona, PersonaActividad
            from app.actividades.models import Actividad
            from app.ofertas.models import OfertaEmpleo, OfertaActividad
            from app.empresas.models import Empresa
            
            hechos = []
            
            # Personas
            personas = self.db_session.query(Persona).all()
            for p in personas:
                exp_total = sum(pa.años_experiencia for pa in p.actividades) or 1
                hechos.append(f"persona({p.dni}, '{p.nombre} {p.apellido}', {exp_total})")
                hechos.append(f"persona_info({p.dni}, '{p.nombre} {p.apellido}', '{p.ciudad}', '{p.email}')")
            
            # Habilidades de personas
            for pa in self.db_session.query(PersonaActividad).join(Actividad).all():
                hechos.append(f"tiene_habilidad({pa.dni}, '{pa.actividad.nombre}', '{pa.nivel_experiencia}', {pa.años_experiencia})")
            
            # Ofertas y empresas
            for oferta in self.db_session.query(OfertaEmpleo).all():
                empresa_nombre = "Empresa"
                if oferta.id_empresa:
                    emp = self.db_session.query(Empresa).get(oferta.id_empresa)
                    empresa_nombre = emp.nombre if emp else "Empresa"
                
                exp_req = 2  # Podría calcularse de OfertaActividad
                hechos.append(f"oferta({oferta.id_oferta}, '{oferta.titulo}', '{oferta.descripcion}', {exp_req}, '{empresa_nombre}')")
            
            # Requisitos de ofertas
            for oa in self.db_session.query(OfertaActividad).join(Actividad).all():
                hechos.append(f"requiere_habilidad({oa.id_oferta}, '{oa.actividad.nombre}', '{oa.nivel_requerido}')")
            
            # Cargar hechos
            for hecho in hechos:
                try:
                    self.prolog.assertz(hecho)
                except:
                    pass
            
            logger.info(f"✅ {len(hechos)} hechos cargados desde DB")
            
        except Exception as e:
            logger.error(f"❌ Error generando hechos: {e}")
    
    def consultar(self, consulta: str) -> List[Dict[str, Any]]:
        """Ejecuta consulta Prolog"""
        try:
            return list(self.prolog.query(consulta))
        except Exception as e:
            logger.error(f"❌ Consulta fallida: {consulta} - {e}")
            return []
    
    # Métodos específicos que usan las reglas de reglas.pl
    def recomendar_ofertas_persona(self, dni: int):
        return self.consultar(f"recomendar_ofertas_persona({dni}, OfertaID, Titulo, Empresa, Puntaje)")
    
    def recomendar_personas_oferta(self, oferta_id: int):
        return self.consultar(f"recomendar_personas_oferta({oferta_id}, DNI, Nombre, Puntaje)")
    
    def buscar_personas_habilidad(self, habilidad: str):
        return self.consultar(f"buscar_personas_habilidad('{habilidad}', DNI, Nombre, Nivel, Años, Ciudad)")
    
    def buscar_ofertas_habilidad(self, habilidad: str):
        return self.consultar(f"buscar_ofertas_habilidad('{habilidad}', OfertaID, Titulo, Empresa, NivelReq)")