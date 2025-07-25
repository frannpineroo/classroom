from fastapi import FastAPI
from connections.alumnos import router as alumnos_router

app = FastAPI()

app.include_router(alumnos_router)

@app.get("/")
def read_root():
    return {"mensaje": "¡Bienvenido a la API del aula virtual!"} 