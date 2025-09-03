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

class UsuarioDB(Base):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    fecha_creacion = Column(String, nullable=True)
    rol = Column(String, nullable=True)
    estado = Column(String, nullable=True) 
    imagen_perfil = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    login_fallidos = Column(Integer, nullable=True, default=0) 
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    profesores = relationship('ProfesorDB', back_populates='usuario')

class AlumnoDB(Base):
    __tablename__ = 'alumnos'
    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String, nullable=True) 
    nro_doc = Column(String, unique=True, nullable=False) 
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    nacimiento = Column(String, nullable=True)  # Fecha de nacimiento
    mail = Column(String, unique=True, nullable=False)
    telefono = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    cohorte = Column(String, nullable=True)  # Año de ingreso o cohorte
    estado = Column(String, nullable=True) 
    al_dia = Column(Boolean, default=True) 
    carrera_id = Column(Integer, nullable=True)  # ID de la carrera (puede ser ForeignKey en el futuro)
    materias = relationship('MateriaDB', secondary=materia_alumno, back_populates='alumnos')

class MateriaDB(Base):
    __tablename__ = 'materias'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    anio_perteneciente = Column(Integer, nullable=True) 
    cant_dias = Column(Integer, nullable=True) 
    descripcion = Column(String, nullable=True)
    creditos = Column(Integer, nullable=True)
    duracion = Column(Integer, nullable=True)
    modalidad = Column(String, nullable=True) 
    profesor_responsable = Column(String, nullable=True)
    horario = Column(String, nullable=True)
    materia_previa_id = Column(Integer, ForeignKey('materias.id'), nullable=True)
    estado = Column(String, nullable=True) 
    carga_horaria = Column(Integer, nullable=True) 
    observaciones = Column(String, nullable=True)
    alumnos = relationship('AlumnoDB', secondary=materia_alumno, back_populates='materias')
    profesores = relationship('ProfesorDB', secondary=materia_profesor, back_populates='materias')

class ProfesorDB(Base):
    __tablename__ = 'profesores'
    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String, nullable=True) 
    nro_doc = Column(String, unique=True, nullable=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    legajo = Column(Integer, unique=True, nullable=True) 
    titulo_universitario = Column(String, nullable=True)
    especialidad = Column(String, nullable=True)
    fecha_alta = Column(String, nullable=True)
    mail = Column(String, unique=True, nullable=True)
    telefono = Column(String, nullable=True)
    estado = Column(String, nullable=True) 
    mat_asignadas = Column(Integer, nullable=True, default=0) 
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True) 
    materias = relationship('MateriaDB', secondary=materia_profesor, back_populates='profesores')
    usuario = relationship('UsuarioDB', back_populates='profesores')

class MaterialDB(Base):
    __tablename__ = 'materiales'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    tipo = Column(String, nullable=True) 
    archivo = Column(String, nullable=True)
    fecha_subida = Column(String, nullable=True) 
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=True)
    materia_id = Column(Integer, ForeignKey('materias.id'), nullable=True) 
    tamanio = Column(Integer, nullable=True) 
    estado = Column(String, nullable=True) 
    profesor = relationship('ProfesorDB', backref='materiales')
    materia = relationship('MateriaDB', backref='materiales')

class TareaDB(Base):
    __tablename__ = 'tareas'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_entrega = Column(String, nullable=True) 
    fecha_publicacion = Column(String, nullable=True) 
    materia_id = Column(Integer, ForeignKey('materias.id'), nullable=True)
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=True) 
    tipo = Column(String, nullable=True) 
    puntaje = Column(Integer, nullable=True) 
    estado = Column(String, nullable=True) 
    materia = relationship('MateriaDB', backref='tareas')

 