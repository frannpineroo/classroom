from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from connections.alumnos import router as alumnos_router

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"mensaje": "¡Bienvenido a la API del aula virtual!"}

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