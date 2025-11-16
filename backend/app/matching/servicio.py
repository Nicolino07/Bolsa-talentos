from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..prolog.motor import MotorProlog
import logging

logger = logging.getLogger(__name__)

class ServicioMatching:
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.motor_prolog = MotorProlog(db_session)
    
    def buscar_por_habilidad(self, habilidad: str) -> List[Dict[str, Any]]:
        """Busca personas por habilidad usando Prolog"""
        try:
            # Consultar Prolog (solo datos demo por ahora)
            resultados_prolog = self.motor_prolog.buscar_personas_con_habilidad(habilidad)
            
            # Enriquecer con datos de la base de datos
            personas_enriquecidas = []
            for resultado in resultados_prolog:
                dni = resultado['DNI']
                
                # Obtener datos completos de la persona
                from ..personas.models import Persona
                persona = self.db_session.query(Persona).filter(Persona.dni == dni).first()
                
                if persona:
                    personas_enriquecidas.append({
                        'dni': persona.dni,
                        'nombre_completo': f"{persona.nombre} {persona.apellido}",
                        'email': persona.email,
                        'ciudad': persona.ciudad,
                        'habilidad_buscada': habilidad,
                        'nivel_habilidad': resultado['Nivel'],
                        'telefono': persona.telefono
                    })
                else:
                    # Si no existe en BD, usar datos demo
                    personas_enriquecidas.append({
                        'dni': resultado['DNI'],
                        'nombre_completo': resultado['Nombre'],
                        'email': 'demo@example.com',
                        'ciudad': 'Ciudad Demo',
                        'habilidad_buscada': habilidad,
                        'nivel_habilidad': resultado['Nivel'],
                        'telefono': '000-0000'
                    })
            
            return personas_enriquecidas
            
        except Exception as e:
            logger.error(f"Error buscando personas con habilidad {habilidad}: {e}")
            return []