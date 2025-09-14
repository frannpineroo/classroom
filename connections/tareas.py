from fastapi import APIRouter, HTTPException
from backend.modelos import TareaDB
from backend.db import db_dependency
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tareas", tags=["tareas"])

# Esquemas Pydantic
class TareaCreate(BaseModel):
    titulo: str
    descripcion: str = None
    fecha_entrega: str = None
    fecha_publicacion: str = None
    materia_id: int = None
    profesor_id: int = None
    tipo: str = None
    puntaje: int = None
    estado: str = None

class TareaOut(BaseModel):
    id: int
    titulo: str
    descripcion: str = None
    fecha_entrega: str = None
    fecha_publicacion: str = None
    materia_id: int = None
    profesor_id: int = None
    tipo: str = None
    puntaje: int = None
    estado: str = None
    
    model_config = ConfigDict(from_attributes=True)

# Crear Tarea
@router.post("/", response_model=TareaOut)
def crear_tarea(tarea: TareaCreate, db: db_dependency):
    try:
        logger.info(f"Intentando crear tarea: {tarea.model_dump()}")
        
        db_tarea = TareaDB(**tarea.model_dump())
        db.add(db_tarea)
        db.commit()
        db.refresh(db_tarea)
        
        logger.info(f"Tarea creada exitosamente con ID: {db_tarea.id}")
        return db_tarea
        
    except Exception as e:
        logger.error(f"Error al crear tarea: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Tareas
@router.get("/", response_model=List[TareaOut])
def listar_tareas(db: db_dependency):
    try:
        tareas = db.query(TareaDB).all()
        logger.info(f"Listando {len(tareas)} tareas")
        return tareas
    except Exception as e:
        logger.error(f"Error al listar tareas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Tareas por Materia
@router.get("/materia/{materia_id}", response_model=List[TareaOut])
def listar_tareas_por_materia(materia_id: int, db: db_dependency):
    try:
        tareas = db.query(TareaDB).filter(TareaDB.materia_id == materia_id).all()
        logger.info(f"Listando {len(tareas)} tareas para la materia {materia_id}")
        return tareas
    except Exception as e:
        logger.error(f"Error al listar tareas por materia {materia_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Tarea por ID
@router.get("/{tarea_id}", response_model=TareaOut)
def obtener_tarea(tarea_id: int, db: db_dependency):
    try:
        tarea = db.query(TareaDB).filter(TareaDB.id == tarea_id).first()
        if not tarea:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
        return tarea
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener tarea {tarea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Actualizar Tarea
@router.put("/{tarea_id}", response_model=TareaOut)
def actualizar_tarea(tarea_id: int, datos: TareaCreate, db: db_dependency):
    try:
        tarea = db.query(TareaDB).filter(TareaDB.id == tarea_id).first()
        if not tarea:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
        for key, value in datos.model_dump().items():
            setattr(tarea, key, value)
        
        db.commit()
        db.refresh(tarea)
        return tarea
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar tarea {tarea_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Marcar Tarea como Entregada
@router.patch("/{tarea_id}/entregar")
def marcar_tarea_entregada(tarea_id: int, db: db_dependency):
    try:
        tarea = db.query(TareaDB).filter(TareaDB.id == tarea_id).first()
        if not tarea:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
        tarea.entregada = True
        db.commit()
        db.refresh(tarea)
        return {"ok": True, "mensaje": "Tarea marcada como entregada"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al marcar tarea {tarea_id} como entregada: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Eliminar Tarea
@router.delete("/{tarea_id}")
def eliminar_tarea(tarea_id: int, db: db_dependency):
    try:
        tarea = db.query(TareaDB).filter(TareaDB.id == tarea_id).first()
        if not tarea:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
        db.delete(tarea)
        db.commit()
        return {"ok": True, "mensaje": "Tarea eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar tarea {tarea_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}") 