from sqlalchemy.orm import Session
from app.modelos.persona import PersonaModel, persona as persona_poo
from datetime import datetime

def crear_persona(db: Session, persona_data: dict):
    """
    persona_data: dict con claves compatibles con PersonaModel (o Pydantic dict)
    Devuelve el objeto ORM creado.
    """
    # Convertir strings de fecha a date si es necesario
    if isinstance(persona_data.get("fecha_nacimiento"), str):
        persona_data["fecha_nacimiento"] = datetime.fromisoformat(persona_data["fecha_nacimiento"]).date()

    nueva = PersonaModel(**persona_data)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # Si querés también crear el objeto POO en memoria (ejemplo)
    try:
        poo = persona_poo(
            dni=nueva.dni,
            apellido=nueva.apellido,
            nombre=nueva.nombre,
            fecha_nacimiento=nueva.fecha_nacimiento,
            direccion=nueva.direccion,
            ciudad=nueva.ciudad,
            provincia=nueva.provincia,
            sexo=nueva.sexo,
            telefono=nueva.telefono,
            mail=nueva.mail,
            activa=nueva.activa
        )
    except Exception:
        poo = None

    return {"orm": nueva, "poo": poo}

def listar_personas(db: Session):
    return db.query(PersonaModel).all()
