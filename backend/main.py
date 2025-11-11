from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine  
from app.personas.models import Persona
from app.empresas.models import Empresa
from app.personas.routes import router as personas_router
from app.empresas.routes import router as empresas_router

# Crear tablas
Persona.metadata.create_all(bind=engine)
Empresa.metadata.create_all(bind=engine)

app = FastAPI(title="Bolsa de Talentos", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(personas_router, prefix="/api")
app.include_router(empresas_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "✅ Bolsa de Talentos API - Multiparadigma"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}