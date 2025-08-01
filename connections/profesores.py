from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.modelos import ProfesorDB
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profesores", tags=["profesores"])

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas Pydantic
class ProfesorCreate(BaseModel):
    nombre: str
    apellido: str
    legajo: int

class ProfesorOut(BaseModel):
    id: int
    nombre: str
    apellido: str
    legajo: int
    
    model_config = ConfigDict(from_attributes=True)

# Crear Profesor
@router.post("/", response_model=ProfesorOut)
def crear_profesor(profesor: ProfesorCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando crear profesor: {profesor.model_dump()}")
        
        # Verificar si ya existe un profesor con el mismo legajo
        existing_legajo = db.query(ProfesorDB).filter(ProfesorDB.legajo == profesor.legajo).first()
        if existing_legajo:
            raise HTTPException(status_code=400, detail=f"Ya existe un profesor con el legajo {profesor.legajo}")
        
        db_profesor = ProfesorDB(**profesor.model_dump())
        db.add(db_profesor)
        db.commit()
        db.refresh(db_profesor)
        
        logger.info(f"Profesor creado exitosamente con ID: {db_profesor.id}")
        return db_profesor
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear profesor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Profesores
@router.get("/", response_model=List[ProfesorOut])
def listar_profesores(db: Session = Depends(get_db)):
    try:
        profesores = db.query(ProfesorDB).all()
        logger.info(f"Listando {len(profesores)} profesores")
        return profesores
    except Exception as e:
        logger.error(f"Error al listar profesores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Profesor por ID
@router.get("/{profesor_id}", response_model=ProfesorOut)
def obtener_profesor(profesor_id: int, db: Session = Depends(get_db)):
    try:
        profesor = db.query(ProfesorDB).filter(ProfesorDB.id == profesor_id).first()
        if not profesor:
            raise HTTPException(status_code=404, detail="Profesor no encontrado")
        return profesor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener profesor {profesor_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Actualizar Profesor
@router.put("/{profesor_id}", response_model=ProfesorOut)
def actualizar_profesor(profesor_id: int, datos: ProfesorCreate, db: Session = Depends(get_db)):
    try:
        profesor = db.query(ProfesorDB).filter(ProfesorDB.id == profesor_id).first()
        if not profesor:
            raise HTTPException(status_code=404, detail="Profesor no encontrado")
        
        for key, value in datos.model_dump().items():
            setattr(profesor, key, value)
        
        db.commit()
        db.refresh(profesor)
        return profesor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar profesor {profesor_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Eliminar Profesor
@router.delete("/{profesor_id}")
def eliminar_profesor(profesor_id: int, db: Session = Depends(get_db)):
    try:
        profesor = db.query(ProfesorDB).filter(ProfesorDB.id == profesor_id).first()
        if not profesor:
            raise HTTPException(status_code=404, detail="Profesor no encontrado")
        db.delete(profesor)
        db.commit()
        return {"ok": True, "mensaje": "Profesor eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar profesor {profesor_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}") 