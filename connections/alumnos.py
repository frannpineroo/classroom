from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.modelos import AlumnoDB
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

# Dependencia para obtener la sesión de base de datos

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas Pydantic
class AlumnoCreate(BaseModel):
    nombre: str
    apellido: str
    legajo: int

class AlumnoOut(BaseModel):
    id: int
    nombre: str
    apellido: str
    legajo: int
    class Config:
        orm_mode = True

# Crear Alumno
@router.post("/", response_model=AlumnoOut)
def crear_alumno(alumno: AlumnoCreate, db: Session = Depends(get_db)):
    db_alumno = AlumnoDB(**alumno.dict())
    db.add(db_alumno)
    db.commit()
    db.refresh(db_alumno)
    return db_alumno

# Listar Alumnos
@router.get("/", response_model=List[AlumnoOut])
def listar_alumnos(db: Session = Depends(get_db)):
    return db.query(AlumnoDB).all()

# Obtener Alumno por ID
@router.get("/{alumno_id}", response_model=AlumnoOut)
def obtener_alumno(alumno_id: int, db: Session = Depends(get_db)):
    alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return alumno

# Actualizar Alumno
@router.put("/{alumno_id}", response_model=AlumnoOut)
def actualizar_alumno(alumno_id: int, datos: AlumnoCreate, db: Session = Depends(get_db)):
    alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    for key, value in datos.dict().items():
        setattr(alumno, key, value)
    db.commit()
    db.refresh(alumno)
    return alumno

# Eliminar Alumno
@router.delete("/{alumno_id}")
def eliminar_alumno(alumno_id: int, db: Session = Depends(get_db)):
    alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    db.delete(alumno)
    db.commit()
    return {"ok": True, "mensaje": "Alumno eliminado"} 