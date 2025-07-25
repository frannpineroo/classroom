from sqlalchemy import Column, Integer, String, Table, ForeignKey
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
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    legajo = Column(Integer, unique=True, nullable=False)
    mail = Column(String, unique=True, nullable=False) 
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