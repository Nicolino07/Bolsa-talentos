#!/bin/bash
# Evitar que el script termine
# Arranca FastAPI en segundo plano
uvicorn main:app --host 0.0.0.0 --port 3000 &

# Arranca Prolog en primer plano (manteniéndose vivo)
swipl -s /app/prolog/server.pl -g start_server
