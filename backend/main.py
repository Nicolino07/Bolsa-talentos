from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Importar modelos
from app.database import engine, get_db
from app.personas.models import Persona
from app.empresas.models import Empresa
from app.autenticacion.models import Usuario
from app.ofertas.models import OfertaEmpleo, OfertaActividad
from app.actividades.models import Actividad

# Importar routers
from app.personas.routes import router as personas_router
from app.empresas.routes import router as empresas_router
from app.autenticacion.routes import router as auth_router
from app.actividades.routes import router as actividades_router
from app.ofertas.routes import router as ofertas_router
from app.matching.routes import router as matching_router

# Crear las tablas en la base de datos si no existen aún
Persona.metadata.create_all(bind=engine)
Empresa.metadata.create_all(bind=engine)
Usuario.metadata.create_all(bind=engine)
OfertaEmpleo.metadata.create_all(bind=engine)
OfertaActividad.metadata.create_all(bind=engine)
Actividad.metadata.create_all(bind=engine)

# Instancia principal de la aplicación FastAPI
app = FastAPI(title="Bolsa de Talentos", version="1.0.0")

# ✅ CONFIGURACIÓN CORS CORREGIDA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ✅ URL específica de tu frontend
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Permitir todos los métodos
    allow_headers=["*"],  # ✅ Permitir todos los headers
)

# Incluir los routers con prefijo común para organizar las rutas de la API
app.include_router(personas_router, prefix="/api")
app.include_router(empresas_router, prefix="/api")
app.include_router(actividades_router, prefix="/api")
app.include_router(ofertas_router, prefix="/api")
app.include_router(auth_router)

# INCLUIR MATCHING CON PREFIJO CONSISTENTE
app.include_router(matching_router, prefix="/api/matching", tags=["Matching"])

@app.get("/")
def root():
    return {"message": "✅ Bolsa de Talentos API - Multiparadigma"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}

# Endpoint adicional para probar CORS
@app.get("/test-cors")
def test_cors():
    return {"message": "✅ CORS funcionando", "cors": "enabled"}

# Endpoint para crear ofertas
@app.post("/api/ofertas/")
def crear_oferta(oferta_data: dict, db: Session = Depends(get_db)):
    try:
        print("📥 Recibiendo datos de oferta:", oferta_data)
        
        nueva_oferta = OfertaEmpleo(
            id_empresa=oferta_data.get('id_empresa'),
            titulo=oferta_data.get('titulo'),
            descripcion=oferta_data.get('descripcion')
        )
        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)
        
        print("✅ Oferta creada:", nueva_oferta.id_oferta)
        return nueva_oferta
        
    except Exception as e:
        db.rollback()
        print("❌ Error creando oferta:", str(e))
        raise HTTPException(status_code=500, detail=f"Error al crear oferta: {str(e)}")

# Endpoint para agregar actividades a ofertas
@app.post("/api/ofertas/{id_oferta}/actividades/")
def agregar_actividad_oferta(id_oferta: int, actividad_data: dict, db: Session = Depends(get_db)):
    try:
        print(f"📥 Agregando actividad a oferta {id_oferta}:", actividad_data)
        
        nueva_actividad_oferta = OfertaActividad(
            id_oferta=id_oferta,
            id_actividad=actividad_data.get('id_actividad'),
            nivel_requerido=actividad_data.get('nivel_requerido')
        )
        db.add(nueva_actividad_oferta)
        db.commit()
        db.refresh(nueva_actividad_oferta)
        
        print("✅ Actividad agregada a oferta")
        return {"message": "Actividad agregada a la oferta"}
        
    except Exception as e:
        db.rollback()
        print("❌ Error agregando actividad:", str(e))
        raise HTTPException(status_code=500, detail=f"Error al agregar actividad: {str(e)}")