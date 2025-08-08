# Guía de Migraciones con Alembic y SQLAlchemy

Este proyecto utiliza **Alembic** para manejar las migraciones de la base de datos PostgreSQL con SQLAlchemy.

## Estructura de Archivos

```
classroom/
├── alembic/                    # Directorio de migraciones
│   ├── versions/              # Archivos de migración
│   ├── env.py                 # Configuración del entorno
│   └── script.py.mako         # Template para migraciones
├── backend/
│   ├── modelos.py             # Modelos SQLAlchemy
│   ├── db.py                  # Configuración de la base de datos
│   └── crear_tablas.py        # Script para crear tablas (legacy)
├── alembic.ini                # Configuración de Alembic
├── requirements.txt           # Dependencias
└── inicializar_alembic.py     # Script de inicialización
```

## Configuración Inicial

### 1. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=nombre_base_datos
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 3. Inicializar Alembic

```bash
python inicializar_alembic.py
```

O manualmente:

```bash
# Inicializar Alembic (solo la primera vez)
alembic init alembic

# Generar la primera migración
alembic revision --autogenerate -m "Initial migration"
```

## Comandos Principales

### Generar Migraciones

```bash
# Generar migración automática basada en cambios en modelos
alembic revision --autogenerate -m "Descripción de los cambios"

# Generar migración vacía (para cambios manuales)
alembic revision -m "Descripción de los cambios"
```

### Aplicar Migraciones

```bash
# Aplicar todas las migraciones pendientes
alembic upgrade head

# Aplicar una migración específica
alembic upgrade <revision_id>

# Aplicar una migración hacia adelante
alembic upgrade +1
```

### Revertir Migraciones

```bash
# Revertir una migración
alembic downgrade -1

# Revertir a una versión específica
alembic downgrade <revision_id>

# Revertir todas las migraciones
alembic downgrade base
```

### Información y Estado

```bash
# Ver la versión actual
alembic current

# Ver historial de migraciones
alembic history

# Ver información detallada de una migración
alembic show <revision_id>
```

## Flujo de Trabajo Típico

### 1. Hacer Cambios en los Modelos

Edita los modelos en `backend/modelos.py`:

```python
class AlumnoDB(Base):
    __tablename__ = 'alumnos'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    # Agregar nuevo campo
    fecha_ingreso = Column(String, nullable=True)  # Nuevo campo
```

### 2. Generar Migración

```bash
alembic revision --autogenerate -m "Agregar fecha_ingreso a alumnos"
```

### 3. Revisar la Migración

Revisa el archivo generado en `alembic/versions/` para asegurarte de que los cambios son correctos.

### 4. Aplicar la Migración

```bash
alembic upgrade head
```

## Casos Especiales

### Migraciones Manuales

Para cambios complejos que Alembic no puede detectar automáticamente:

```bash
# Generar migración vacía
alembic revision -m "Migración manual para cambios complejos"
```

Luego edita el archivo generado:

```python
def upgrade() -> None:
    # Ejecutar SQL personalizado
    op.execute("ALTER TABLE alumnos ADD COLUMN nuevo_campo VARCHAR(255)")
    
    # O usar operaciones de Alembic
    op.add_column('alumnos', sa.Column('nuevo_campo', sa.String(255)))

def downgrade() -> None:
    # Revertir los cambios
    op.drop_column('alumnos', 'nuevo_campo')
```

### Datos de Inicialización

Para insertar datos iniciales:

```python
def upgrade() -> None:
    # Insertar datos de ejemplo
    op.bulk_insert(
        sa.table('usuarios',
            sa.column('username', sa.String),
            sa.column('email', sa.String),
            sa.column('hashed_password', sa.String)
        ),
        [
            {'username': 'admin', 'email': 'admin@example.com', 'hashed_password': 'hashed_password'}
        ]
    )
```

## Solución de Problemas

### Error: "Target database is not up to date"

```bash
# Verificar el estado actual
alembic current

# Aplicar migraciones pendientes
alembic upgrade head
```

### Error: "Can't locate revision identified by"

```bash
# Ver historial completo
alembic history --verbose

# Si hay discrepancias, puedes marcar la revisión actual
alembic stamp head
```

### Error: "Table already exists"

Esto puede ocurrir si las tablas ya existen. En este caso:

1. Marca la base de datos como actualizada:
   ```bash
   alembic stamp head
   ```

2. O elimina las tablas existentes y vuelve a crear:
   ```bash
   # Cuidado: esto eliminará todos los datos
   alembic downgrade base
   alembic upgrade head
   ```

## Mejores Prácticas

1. **Siempre revisa** las migraciones generadas antes de aplicarlas
2. **Usa nombres descriptivos** para las migraciones
3. **Haz backup** de la base de datos antes de aplicar migraciones en producción
4. **Prueba las migraciones** en un entorno de desarrollo primero
5. **Documenta cambios complejos** en los comentarios de la migración

## Comandos Útiles para Desarrollo

```bash
# Ver diferencias entre modelo y base de datos
alembic check

# Generar SQL sin ejecutar
alembic upgrade head --sql

# Verificar estado de migraciones
alembic heads
```
