from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.modelos import AlumnoDB
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    mail: str

class AlumnoOut(BaseModel):
    id: int
    nombre: str
    apellido: str
    legajo: int
    mail: str
    
    model_config = ConfigDict(from_attributes=True)

# Crear Alumno
@router.post("/", response_model=AlumnoOut)
def crear_alumno(alumno: AlumnoCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando crear alumno: {alumno.model_dump()}")
        
        # Verificar si ya existe un alumno con el mismo legajo
        existing_legajo = db.query(AlumnoDB).filter(AlumnoDB.legajo == alumno.legajo).first()
        if existing_legajo:
            raise HTTPException(status_code=400, detail=f"Ya existe un alumno con el legajo {alumno.legajo}")
        
        # Verificar si ya existe un alumno con el mismo email
        existing_email = db.query(AlumnoDB).filter(AlumnoDB.mail == alumno.mail).first()
        if existing_email:
            raise HTTPException(status_code=400, detail=f"Ya existe un alumno con el email {alumno.mail}")
        
        db_alumno = AlumnoDB(**alumno.model_dump())
        db.add(db_alumno)
        db.commit()
        db.refresh(db_alumno)
        
        logger.info(f"Alumno creado exitosamente con ID: {db_alumno.id}")
        return db_alumno
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear alumno: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Alumnos
@router.get("/", response_model=List[AlumnoOut])
def listar_alumnos(db: Session = Depends(get_db)):
    try:
        alumnos = db.query(AlumnoDB).all()
        logger.info(f"Listando {len(alumnos)} alumnos")
        return alumnos
    except Exception as e:
        logger.error(f"Error al listar alumnos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Alumno por ID
@router.get("/{alumno_id}", response_model=AlumnoOut)
def obtener_alumno(alumno_id: int, db: Session = Depends(get_db)):
    try:
        alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
        if not alumno:
            raise HTTPException(status_code=404, detail="Alumno no encontrado")
        return alumno
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener alumno {alumno_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Actualizar Alumno
@router.put("/{alumno_id}", response_model=AlumnoOut)
def actualizar_alumno(alumno_id: int, datos: AlumnoCreate, db: Session = Depends(get_db)):
    try:
        alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
        if not alumno:
            raise HTTPException(status_code=404, detail="Alumno no encontrado")
        
        for key, value in datos.model_dump().items():
            setattr(alumno, key, value)
        
        db.commit()
        db.refresh(alumno)
        return alumno
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar alumno {alumno_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Eliminar Alumno
@router.delete("/{alumno_id}")
def eliminar_alumno(alumno_id: int, db: Session = Depends(get_db)):
    try:
        alumno = db.query(AlumnoDB).filter(AlumnoDB.id == alumno_id).first()
        if not alumno:
            raise HTTPException(status_code=404, detail="Alumno no encontrado")
        db.delete(alumno)
        db.commit()
        return {"ok": True, "mensaje": "Alumno eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar alumno {alumno_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}") 