from fastapi import APIRouter, HTTPException
from backend.modelos import MaterialDB
from backend.db import db_dependency 
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/materiales", tags=["materiales"])

class MaterialCreate(BaseModel):
    titulo: str
    descripcion: str = None
    archivo: str

class MaterialOut(BaseModel):
    id: int
    titulo: str
    descripcion: str = None
    archivo: str
    
    model_config = ConfigDict(from_attributes=True)

# Crear Material
@router.post("/", response_model=MaterialOut)
def crear_material(material: MaterialCreate, db: db_dependency):
    try:
        logger.info(f"Intentando crear material: {material.model_dump()}")
        
        db_material = MaterialDB(**material.model_dump())
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        
        logger.info(f"Material creado exitosamente con ID: {db_material.id}")
        return db_material
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear material: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Materiales
@router.get("/", response_model=List[MaterialOut])
def listar_materiales(db: db_dependency):
    try:
        materiales = db.query(MaterialDB).all()
        logger.info(f"Listando {len(materiales)} materiales")
        return materiales
    except Exception as e:
        logger.error(f"Error al listar materiales: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Material por ID
@router.get("/{material_id}", response_model=MaterialOut)
def obtener_material(material_id: int, db: db_dependency):
    try:
        material = db.query(MaterialDB).filter(MaterialDB.id == material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Material no encontrado")
        return material
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener material {material_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Actualizar Material
@router.put("/{material_id}", response_model=MaterialOut)
def actualizar_material(material_id: int, datos: MaterialCreate, db: db_dependency):
    try:
        material = db.query(MaterialDB).filter(MaterialDB.id == material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Material no encontrado")
        
        for key, value in datos.model_dump().items():
            setattr(material, key, value)
        
        db.commit()
        db.refresh(material)
        return material
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al actualizar material {material_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Eliminar Material
@router.delete("/{material_id}")
def eliminar_material(material_id: int, db: db_dependency):
    try:
        material = db.query(MaterialDB).filter(MaterialDB.id == material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Material no encontrado")
        db.delete(material)
        db.commit()
        return {"ok": True, "mensaje": "Material eliminado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar material {material_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}") 