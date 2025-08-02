from sqlalchemy import Column, Integer, String, Table, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .db import Base

# Tabla de asociación para la relación muchos a muchos entre Materia y Alumno
materia_alumno = Table(
    'materia_alumno', Base.metadata,
    Column('materia_id', Integer, ForeignKey('materias.id'), primary_key=True),
    Column('alumno_id', Integer, ForeignKey('alumnos.id'), primary_key=True)
)

# Tabla de asociación para la relación muchos a muchos entre Materia y Profesor
materia_profesor = Table(
    'materia_profesor', Base.metadata,
    Column('materia_id', Integer, ForeignKey('materias.id'), primary_key=True),
    Column('profesor_id', Integer, ForeignKey('profesores.id'), primary_key=True)
)

class AlumnoDB(Base):
    __tablename__ = 'alumnos'
    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String, nullable=False)  # Tipo de documento (DNI, Pasaporte, etc.)
    nro_doc = Column(String, unique=True, nullable=False)  # Número de documento
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    nacimiento = Column(String, nullable=True)  # Fecha de nacimiento
    mail = Column(String, unique=True, nullable=False)
    telefono = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    cohorte = Column(String, nullable=True)  # Año de ingreso o cohorte
    estado = Column(String, nullable=True)  # Estado del alumno (Activo, Inactivo, etc.)
    al_dia = Column(Boolean, default=True)  # Si está al día con los pagos
    carrera_id = Column(Integer, nullable=True)  # ID de la carrera (puede ser ForeignKey en el futuro)
    materias = relationship('MateriaDB', secondary=materia_alumno, back_populates='alumnos')

class MateriaDB(Base):
    __tablename__ = 'materias'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    alumnos = relationship('AlumnoDB', secondary=materia_alumno, back_populates='materias')
    profesores = relationship('ProfesorDB', secondary=materia_profesor, back_populates='materias')

class ProfesorDB(Base):
    __tablename__ = 'profesores'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    legajo = Column(Integer, unique=True, nullable=False)
    materias = relationship('MateriaDB', secondary=materia_profesor, back_populates='profesores') 

class MaterialDB(Base):
    __tablename__ = 'materiales'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    archivo = Column(String, nullable=False)  # Ruta o nombre del archivo

class TareaDB(Base):
    __tablename__ = 'tareas'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    materia_id = Column(Integer, ForeignKey('materias.id'), nullable=False)
    apartado = Column(String, nullable=True)  # Ruta o nombre del archivo entregado
    entregada = Column(Boolean, default=False)
    materia = relationship('MateriaDB', backref='tareas') 