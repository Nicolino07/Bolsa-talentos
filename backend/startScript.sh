#!/bin/bash
# Evitar que el script termine

# 1️⃣ Arranca Prolog en segundo plano
swipl -s /app/server.pl -g start_server &

# 2️⃣ Arranca FastAPI
uvicorn main:app --host 0.0.0.0 --port 3000