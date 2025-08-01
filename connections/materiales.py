from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.modelos import MaterialDB
from pydantic import BaseModel, ConfigDict
from typing import List
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/materiales", tags=["materiales"])

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas Pydantic
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
def crear_material(material: MaterialCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Intentando crear material: {material.model_dump()}")
        
        db_material = MaterialDB(**material.model_dump())
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        
        logger.info(f"Material creado exitosamente con ID: {db_material.id}")
        return db_material
        
    except Exception as e:
        logger.error(f"Error al crear material: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Listar Materiales
@router.get("/", response_model=List[MaterialOut])
def listar_materiales(db: Session = Depends(get_db)):
    try:
        materiales = db.query(MaterialDB).all()
        logger.info(f"Listando {len(materiales)} materiales")
        return materiales
    except Exception as e:
        logger.error(f"Error al listar materiales: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

# Obtener Material por ID
@router.get("/{material_id}", response_model=MaterialOut)
def obtener_material(material_id: int, db: Session = Depends(get_db)):
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
def actualizar_material(material_id: int, datos: MaterialCreate, db: Session = Depends(get_db)):
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
def eliminar_material(material_id: int, db: Session = Depends(get_db)):
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