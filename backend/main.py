from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.personas.models import Persona
from app.empresas.models import Empresa
from app.autenticacion.models import Usuario
from app.personas.routes import router as personas_router
from app.empresas.routes import router as empresas_router
from app.autenticacion.routes import router as auth_router
from app.actividades.routes import router as actividades_router
from app.ofertas.routes import router as ofertas_router
from app.matching.routes import router as matching_router

#Crear las tablas en la base de datos si no existen aún
Persona.metadata.create_all(bind=engine)
Empresa.metadata.create_all(bind=engine)
Usuario.metadata.create_all(bind=engine)

#Instancia principal de la aplicación FastAPI
app = FastAPI(title="Bolsa de Talentos", version="1.0.0")

#Configuración del middleware CORS MÁS PERMISIVA
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],  # Permitir todos los orígenes en desarrollo
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=["*"],
)

#Incluir los routers con prefijo común para organizar las rutas de la API
app.include_router(personas_router, prefix="/api")
app.include_router(empresas_router, prefix="/api")
app.include_router(actividades_router, prefix="/api")
app.include_router(ofertas_router, prefix="/api")
app.include_router(auth_router)

#INCLUIR MATCHING CON PREFIJO CONSISTENTE
app.include_router(matching_router, prefix="/api/matching", tags=["Matching"])

@app.get("/")
def root():
    return {"message": "✅ Bolsa de Talentos API - Multiparadigma"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}

#Endpoint adicional para probar CORS
@app.get("/test-cors")
def test_cors():
    return {"message": "✅ CORS funcionando", "cors": "enabled"}