from fastapi import FastAPI
from app.api.persona_api import router as persona_router


app = FastAPI()

app.include_router(persona_router)


@app.get("/")
def home():
    return {"msg": "API funcionando!"}
