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
    anio_perteneciente = Column(Integer, nullable=False)
    cant_dias = Column(Integer, nullable=False)
    descripcion = Column(String, nullable=True)
    creditos = Column(Integer, nullable=False)
    duracion = Column(Integer, nullable=False)
    modalidad = Column(String, nullable=False)
    profesor_responsable = Column(String, nullable=True)
    horario = Column(String, nullable=True)
    materia_previa_id = Column(Integer, ForeignKey('materias.id'), nullable=True)
    estado = Column(String, nullable=False)
    carga_horaria = Column(Integer, nullable=False)
    observaciones = Column(String, nullable=True)
    alumnos = relationship('AlumnoDB', secondary=materia_alumno, back_populates='materias')
    profesores = relationship('ProfesorDB', secondary=materia_profesor, back_populates='materias')

class ProfesorDB(Base):
    __tablename__ = 'profesores'
    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String, nullable=False)
    nro_doc = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    titulo_universitario = Column(String, nullable=True)
    especialidad = Column(String, nullable=True)
    fecha_alta = Column(String, nullable=True)
    mail = Column(String, unique=True, nullable=False)
    telefono = Column(String, nullable=True)
    estado = Column(String, nullable=False)
    mat_asignadas = Column(Integer, nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    materias = relationship('MateriaDB', secondary=materia_profesor, back_populates='profesores')
    usuario = relationship('UsuarioDB', back_populates='profesores')

class MaterialDB(Base):
    __tablename__ = 'materiales'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    tipo = Column(String, nullable=False)
    archivo = Column(String, nullable=False)  # Ruta o nombre del archivo
    fecha_subida = Column(String, nullable=False)
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=False)
    materia_id = Column(Integer, ForeignKey('materias.id'), nullable=False)
    tamanio = Column(Integer, nullable=False)
    estado = Column(String, nullable=False)
    profesor = relationship('ProfesorDB', backref='materiales')
    materia = relationship('MateriaDB', backref='materiales')

class TareaDB(Base):
    __tablename__ = 'tareas'
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_entrega = Column(String, nullable=False)
    fecha_publicacion = Column(String, nullable=False)
    materia_id = Column(Integer, ForeignKey('materias.id'), nullable=False)
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=False)
    tipo = Column(String, nullable=False)
    puntaje = Column(Integer, nullable=False)
    estado = Column(String, nullable=False)
    materia = relationship('MateriaDB', backref='tareas')

 