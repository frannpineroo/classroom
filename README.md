# 🎓 Sistema de Gestión de Aula - Classroom Management System

Sistema completo de gestión de aula desarrollado con FastAPI, SQLAlchemy, PostgreSQL y Alembic para las migraciones.

## 📁 Estructura del Proyecto

```
classroom/
├── backend/                    # Backend con FastAPI y SQLAlchemy
│   ├── __init__.py
│   ├── db.py                  # Configuración de base de datos
│   ├── modelos.py             # Modelos SQLAlchemy
│   ├── actualizar_alumnos.py
│   └── crear_tablas.py
├── connections/               # Conexiones y endpoints
│   ├── main.py
│   ├── alumnos.py
│   ├── materias.py
│   ├── profesores.py
│   ├── materiales.py
│   └── tareas.py
├── frontend/                  # Frontend con HTML, CSS y JS
│   ├── index.html
│   ├── alumnos.html
│   ├── materias.html
│   ├── profesores.html
│   ├── css/
│   └── js/
├── alembic/                   # Migraciones de base de datos
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── requirements.txt           # Dependencias de Python
├── alembic.ini               # Configuración de Alembic
└── README.md                 # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- PostgreSQL
- pip

### 1. Clonar el repositorio

```bash
git clone <https://github.com/frannpineroo/classroom>
cd classroom
```

### 2. Crear entorno virtual

```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=nombre_base_datos
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 5. Configurar la base de datos

```bash
# Generar migraciones
alembic revision --autogenerate -m "Initial migration"

# Aplicar migraciones
alembic upgrade head
```

### 6. Ejecutar la aplicación

```bash
# Desde el directorio connections
cd connections
uvicorn main:app --reload
```

## 📊 Modelos de Datos

### UsuarioDB
- Gestión de usuarios del sistema
- Roles y permisos
- Autenticación

### AlumnoDB
- Información personal de alumnos
- Documentación
- Estado académico

### MateriaDB
- Materias/cursos
- Códigos únicos
- Relaciones con profesores y alumnos

### ProfesorDB
- Información de profesores
- Especialidades
- Materias asignadas

### MaterialDB
- Materiales de estudio
- Archivos y recursos
- Asociación con materias

### TareaDB
- Tareas y evaluaciones
- Fechas de entrega
- Puntajes

## 🔄 Migraciones

El proyecto usa Alembic para manejar las migraciones de la base de datos.

### Comandos principales:

```bash
# Generar nueva migración
alembic revision --autogenerate -m "Descripción de cambios"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1

# Ver estado actual
alembic current

# Ver historial
alembic history
```

## 🛠️ Desarrollo

### Estructura de archivos importantes:

- `backend/modelos.py` - Modelos SQLAlchemy
- `backend/db.py` - Configuración de base de datos
- `connections/main.py` - Aplicación principal FastAPI
- `alembic/env.py` - Configuración de migraciones

### Agregar nuevos modelos:

1. Editar `backend/modelos.py`
2. Generar migración: `alembic revision --autogenerate -m "Nuevo modelo"`
3. Aplicar migración: `alembic upgrade head`

## 📝 API Endpoints

### Alumnos
- `GET /alumnos` - Listar alumnos
- `POST /alumnos` - Crear alumno
- `GET /alumnos/{id}` - Obtener alumno
- `PUT /alumnos/{id}` - Actualizar alumno
- `DELETE /alumnos/{id}` - Eliminar alumno

### Materias
- `GET /materias` - Listar materias
- `POST /materias` - Crear materia
- `GET /materias/{id}` - Obtener materia
- `PUT /materias/{id}` - Actualizar materia
- `DELETE /materias/{id}` - Eliminar materia

### Profesores
- `GET /profesores` - Listar profesores
- `POST /profesores` - Crear profesor
- `GET /profesores/{id}` - Obtener profesor
- `PUT /profesores/{id}` - Actualizar profesor
- `DELETE /profesores/{id}` - Eliminar profesor

## 🔒 Seguridad

- Variables de entorno para credenciales
- Validación de datos con Pydantic
- Manejo seguro de contraseñas

## 📚 Documentación

- [Guía de Migraciones](MIGRACIONES_README.md)
- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Documentación de SQLAlchemy](https://docs.sqlalchemy.org/)
- [Documentación de Alembic](https://alembic.sqlalchemy.org/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- Francisco Pinero - Desarrollo inicial

## 🙏 Agradecimientos

- FastAPI por el framework web
- SQLAlchemy por el ORM
- Alembic por las migraciones
- PostgreSQL por la base de datos
