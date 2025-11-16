#!/bin/bash
echo "🚀 Iniciando Bolsa de Talentos API..."
exec uvicorn main:app --host 0.0.0.0 --port 3000 --reload
