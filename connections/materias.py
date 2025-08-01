from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.modelos import MateriaDB
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/materias", tags=["materias"])

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas Pydantic
class MateriaCreate(BaseModel):
    nombre: str
    codigo: str

class MateriaOut(BaseModel):
    id: int
    nombre: str
    codigo: str
    
    model_config = ConfigDict(from_attributes=True)

# Crear Materia
@router.post("/", response_model=MateriaOut)
def crear_materia(materia: MateriaCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando crear materia: {materia.model_dump()}")
        
        # Verificar si ya existe una materia con el mismo código
        existing_codigo = db.query(MateriaDB).filter(MateriaDB.codigo == materia.codigo).first()
        if existing_codigo:
            raise HTTPException(status_code=400, detail=f"Ya existe una materia con el código {materia.codigo}")
        
        db_materia = MateriaDB(**materia.model_dump())
        db.add(db_materia)
        db.commit()
        db.refresh(db_materia)
        
        logger.info(f"Materia creada exitosamente con ID: {db_materia.id}")
        return db_materia
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear materia: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Materias
@router.get("/", response_model=List[MateriaOut])
def listar_materias(db: Session = Depends(get_db)):
    try:
        materias = db.query(MateriaDB).all()
        logger.info(f"Listando {len(materias)} materias")
        return materias
    except Exception as e:
        logger.error(f"Error al listar materias: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Materia por ID
@router.get("/{materia_id}", response_model=MateriaOut)
def obtener_materia(materia_id: int, db: Session = Depends(get_db)):
    try:
        materia = db.query(MateriaDB).filter(MateriaDB.id == materia_id).first()
        if not materia:
            raise HTTPException(status_code=404, detail="Materia no encontrada")
        return materia
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener materia {materia_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Actualizar Materia
@router.put("/{materia_id}", response_model=MateriaOut)
def actualizar_materia(materia_id: int, datos: MateriaCreate, db: Session = Depends(get_db)):
    try:
        materia = db.query(MateriaDB).filter(MateriaDB.id == materia_id).first()
        if not materia:
            raise HTTPException(status_code=404, detail="Materia no encontrada")
        
        for key, value in datos.model_dump().items():
            setattr(materia, key, value)
        
        db.commit()
        db.refresh(materia)
        return materia
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar materia {materia_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Eliminar Materia
@router.delete("/{materia_id}")
def eliminar_materia(materia_id: int, db: Session = Depends(get_db)):
    try:
        materia = db.query(MateriaDB).filter(MateriaDB.id == materia_id).first()
        if not materia:
            raise HTTPException(status_code=404, detail="Materia no encontrada")
        db.delete(materia)
        db.commit()
        return {"ok": True, "mensaje": "Materia eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar materia {materia_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}") 