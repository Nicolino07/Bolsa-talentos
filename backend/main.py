from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Importar base de datos
from app.database import engine, get_db

# Importar modelos
from app.personas.models import Persona
from app.empresas.models import Empresa
from app.autenticacion.models import Usuario
from app.ofertas.models import OfertaEmpleo, OfertaActividad
from app.actividades.models import Actividad
from app.relaciones.models import RelacionAprendida
from app.postulaciones.models import Postulacion
from app.ofertas.models import OfertaEmpleo, OfertaActividad
from app.actividades.models import Actividad, PersonaActividad, EmpresaActividad

# Importar routers
from app.personas.routes import router as personas_router
from app.empresas.routes import router as empresas_router
from app.autenticacion.routes import router as auth_router
from app.actividades.routes import router as actividades_router
from app.ofertas.routes import router as ofertas_router
from app.matching.routes import router as matching_router
from app.relaciones.routes import router as relaciones_router
from app.postulaciones.routes import router as postulaciones_router

# -------------------------------------------------------------------------
# Crear tablas automáticamente si no existen
# -------------------------------------------------------------------------
Persona.metadata.create_all(bind=engine)
Empresa.metadata.create_all(bind=engine)
Usuario.metadata.create_all(bind=engine)
OfertaEmpleo.metadata.create_all(bind=engine)
OfertaActividad.metadata.create_all(bind=engine)
Actividad.metadata.create_all(bind=engine)
PersonaActividad.metadata.create_all(bind=engine)
EmpresaActividad.metadata.create_all(bind=engine)
RelacionAprendida.metadata.create_all(bind=engine)
Postulacion.metadata.create_all(bind=engine)

# -------------------------------------------------------------------------
# FASTAPI APP
# -------------------------------------------------------------------------
app = FastAPI(
    title="Bolsa de Talentos",
    version="1.0.0"
)

# -------------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------------
# RUTAS PRINCIPALES
# -------------------------------------------------------------------------
app.include_router(personas_router, prefix="/api")
app.include_router(empresas_router, prefix="/api")
app.include_router(actividades_router, prefix="/api")
app.include_router(ofertas_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")


# Matching con prefijo estándar
app.include_router(matching_router, prefix="/api/matching", tags=["Matching"])
# Aprendizaje
app.include_router(relaciones_router, prefix="api/relaciones-aprendidas")
app.include_router(postulaciones_router, prefix="/api/postulaciones")


# -------------------------------------------------------------------------
# RUTAS BÁSICAS
# -------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "✅ Bolsa de Talentos API - Multiparadigma"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}

@app.get("/test-cors")
def test_cors():
    return {"message": "✅ CORS funcionando"}

# -------------------------------------------------------------------------
# CREAR OFERTA
# -------------------------------------------------------------------------
@app.post("/api/ofertas/")
def crear_oferta_main(oferta_data: dict, db: Session = Depends(get_db)):
    try:
        nueva_oferta = OfertaEmpleo(
            id_empresa=oferta_data.get("id_empresa"),
            titulo=oferta_data.get("titulo"),
            descripcion=oferta_data.get("descripcion"),
        )
        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)
        return nueva_oferta

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------------------
# AGREGAR ACTIVIDAD A OFERTA
# -------------------------------------------------------------------------
@app.post("/api/ofertas/{id_oferta}/actividades/")
def agregar_actividad_oferta(id_oferta: int, actividad_data: dict, db: Session = Depends(get_db)):
    try:
        nueva_actividad = OfertaActividad(
            id_oferta=id_oferta,
            id_actividad=actividad_data.get("id_actividad"),
            nivel_requerido=actividad_data.get("nivel_requerido"),
        )
        db.add(nueva_actividad)
        db.commit()
        return {"message": "Actividad agregada correctamente"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
