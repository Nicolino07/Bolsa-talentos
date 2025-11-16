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
        """Genera hechos Prolog desde la base de datos - VERSIÓN CORREGIDA"""
        if not self.db_session:
            return
        
        try:
            from app.personas.models import Persona
            from app.actividades.models import Actividad, PersonaActividad
            from app.ofertas.models import OfertaEmpleo, OfertaActividad
            from app.empresas.models import Empresa
            
            hechos = []
            
            # Limpiar hechos anteriores
            try:
                list(self.prolog.query("retractall(persona(_, _, _))"))
                list(self.prolog.query("retractall(persona_info(_, _, _, _))"))
                list(self.prolog.query("retractall(tiene_habilidad(_, _, _, _))"))
                list(self.prolog.query("retractall(oferta(_, _, _, _, _))"))
                list(self.prolog.query("retractall(requiere_habilidad(_, _, _))"))
            except:
                pass
            
            # Obtener todas las personas
            personas = self.db_session.query(Persona).all()
            
            # Para cada persona, calcular experiencia y habilidades
            for persona in personas:
                # Obtener actividades de esta persona con JOIN
                actividades_persona = self.db_session.query(PersonaActividad, Actividad)\
                    .join(Actividad, PersonaActividad.id_actividad == Actividad.id_actividad)\
                    .filter(PersonaActividad.dni == persona.dni)\
                    .all()
                
                # Calcular experiencia total
                exp_total = 0
                for pa, actividad in actividades_persona:
                    exp_total += pa.años_experiencia or 0
                
                if exp_total == 0:
                    exp_total = 1
                
                # Agregar hecho de persona
                hechos.append(f"persona({persona.dni}, '{persona.nombre} {persona.apellido}', {exp_total})")
                hechos.append(f"persona_info({persona.dni}, '{persona.nombre} {persona.apellido}', '{persona.ciudad}', '{persona.email}')")
                
                # Agregar habilidades de la persona
                for pa, actividad in actividades_persona:
                    nivel = pa.nivel_experiencia or 'PRINCIPIANTE'
                    años = pa.años_experiencia or 0
                    # CORRECTO: usar 'actividad.nombre' del join
                    hechos.append(f"tiene_habilidad({persona.dni}, '{actividad.nombre}', '{nivel}', {años})")
            
            # Ofertas de empleo
            ofertas = self.db_session.query(OfertaEmpleo).filter(OfertaEmpleo.activa == True).all()
            for oferta in ofertas:
                empresa_nombre = "Empresa"
                if oferta.id_empresa:
                    empresa = self.db_session.query(Empresa).filter(Empresa.id_empresa == oferta.id_empresa).first()
                    if empresa:
                        empresa_nombre = empresa.nombre
                
                exp_req = 2  # Valor por defecto
                hechos.append(f"oferta({oferta.id_oferta}, '{oferta.titulo}', '{oferta.descripcion}', {exp_req}, '{empresa_nombre}')")
                
                # Requisitos de la oferta
                requisitos = self.db_session.query(OfertaActividad, Actividad)\
                    .join(Actividad, OfertaActividad.id_actividad == Actividad.id_actividad)\
                    .filter(OfertaActividad.id_oferta == oferta.id_oferta)\
                    .all()
                
                for oa, actividad in requisitos:
                    nivel = oa.nivel_requerido or 'INTERMEDIO'
                    hechos.append(f"requiere_habilidad({oferta.id_oferta}, '{actividad.nombre}', '{nivel}')")
            
            # Cargar hechos en Prolog
            for hecho in hechos:
                try:
                    self.prolog.assertz(hecho)
                except Exception as e:
                    logger.debug(f"Hecho no cargado: {hecho}")
            
            logger.info(f"✅ {len(hechos)} hechos cargados en Prolog desde BD")
        
        except Exception as e:
            logger.error(f"❌ Error generando hechos: {e}")
            import traceback
            traceback.print_exc()
            
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
    
    def buscar_personas_con_habilidad(self, habilidad: str):
        """Busca personas que tengan una habilidad específica"""
        try:
            # Generar hechos actualizados
            self.generar_hechos_desde_db()
            
            # Consultar Prolog
            consulta = f"buscar_personas_habilidad('{habilidad}', DNI, Nombre, Nivel, Años, Ciudad)"
            return self.consultar(consulta)
        except Exception as e:
            logger.error(f"❌ Error buscando personas con habilidad {habilidad}: {e}")
            return []