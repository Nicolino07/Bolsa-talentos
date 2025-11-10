from fastapi import FastAPI
from app.baseDatos.database import engine
from app.modelos.persona import Persona
from app.api.persona import router as persona_router

# Crear tablas
Persona.metadata.create_all(bind=engine)

app = FastAPI()

# Sin prefix o con prefix más simple
app.include_router(persona_router, prefix="/api")  # ← Solo /api

@app.get("/")
def root():
    return {"message": "✅ Backend FUNCIONANDO"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}