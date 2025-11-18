#!/bin/bash
echo "🚀 Iniciando Bolsa de Talentos API..."

# Lanzar FastAPI desde el WORKDIR /app
exec uvicorn main:app --host 0.0.0.0 --port 3000 --reload
