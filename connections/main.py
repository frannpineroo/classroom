from fastapi import FastAPI, status, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from connections.alumnos import router as alumnos_router
from connections.materias import router as materias_router
from connections.profesores import router as profesores_router
from connections.materiales import router as materiales_router
from connections.tareas import router as tareas_router
from backend.auth import get_current_user, create_access_token
from backend.db import engine, SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
from backend import auth, modelos
from backend.auth import get_current_user
from backend.modelos import UsuarioDB
import os


app = FastAPI()
app.include_router(auth.router)

modelos.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

# Autenticacion de usuario
@app.get("/user", status_code=status.HTTP_200_OK) 
async def get_user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Autenticacion fallida")
    return {"User":user}

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="frontend"), name="static")

app.include_router(alumnos_router)
app.include_router(materias_router)
app.include_router(profesores_router)
app.include_router(materiales_router)
app.include_router(tareas_router)

@app.get("/")
def read_root():
    """Redirigir a la página principal"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/index.html")

@app.get("/alumnos-page")
def alumnos_page():
    """Redirigir a la página de alumnos"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/alumnos.html")

@app.get("/crear-alumnos-page")
def crear_alumnos_page():
    """Redirigir a la página de crear alumnos"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/crearAlumnos.html")

@app.get("/materias-page")
def materias_page():
    """Redirigir a la página de materias"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/materias.html")

@app.get("/crear-materia-page")
def crear_materia_page():
    """Redirigir a la página de crear materias"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/crearMateria.html")

@app.get("/editar-materia-page")
def editar_materia_page():
    """Redirigir a la página de editar materias"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/editarMateria.html")

@app.get("/profesores-page")
def profesores_page():
    """Redirigir a la página de profesores"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/profesores.html")

@app.get("/materiales-page")
def materiales_page():
    """Redirigir a la página de materiales"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/materiales.html")

@app.get("/tareas-page")
def tareas_page():
    """Redirigir a la página de tareas"""
    from fastapi.responses import FileResponse
    return FileResponse("frontend/tareas.html") 

