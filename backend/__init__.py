# Importar los modelos para que Alembic los detecte
from .modelos import (
    UsuarioDB,
    AlumnoDB,
    MateriaDB,
    ProfesorDB,
    MaterialDB,
    TareaDB,
    materia_alumno,
    materia_profesor
)

__all__ = [
    'UsuarioDB',
    'AlumnoDB', 
    'MateriaDB',
    'ProfesorDB',
    'MaterialDB',
    'TareaDB',
    'materia_alumno',
    'materia_profesor'
] 