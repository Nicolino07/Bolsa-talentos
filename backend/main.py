from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine  
from app.personas.models import Persona
from app.empresas.models import Empresa
from app.autenticacion.models import Usuario 
from app.personas.routes import router as personas_router
from app.empresas.routes import router as empresas_router
from app.autenticacion.routes import router as auth_router 

# Crear las tablas en la base de datos si no existen aún
Persona.metadata.create_all(bind=engine)
Empresa.metadata.create_all(bind=engine)
Usuario.metadata.create_all(bind=engine)

# Instancia principal de la aplicación FastAPI
app = FastAPI(title="Bolsa de Talentos", version="1.0.0")

# Configuración del middleware CORS para permitir peticiones desde frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers con prefijo común para organizar las rutas de la API
app.include_router(personas_router, prefix="/api")
app.include_router(empresas_router, prefix="/api")
app.include_router(auth_router)

@app.get("/")
def root():
    """
    Endpoint root para verificar que la API está corriendo.
    Retorna un mensaje simple de confirmación.
    """
    return {"message": "✅ Bolsa de Talentos API - Multiparadigma"}

@app.get("/health")
def health():
    """
    Endpoint para verificar el estado de salud de la API y conexión a DB.
    Retorna un estado ok y confirma conexión a la base de datos.
    """
    return {"status": "ok", "database": "connected"}
