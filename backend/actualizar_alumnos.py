from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configuración de la conexión desde variables de entorno
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_PORT = os.getenv('POSTGRES_PORT')

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def actualizar_tabla_alumnos():
    """Actualiza la tabla alumnos con los nuevos campos"""
    try:
        with engine.connect() as connection:
            # Verificar si la tabla existe
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'alumnos'
                );
            """))
            
            if not result.scalar():
                print("La tabla 'alumnos' no existe. Creando nueva tabla...")
                # Crear la tabla con todos los campos nuevos
                connection.execute(text("""
                    CREATE TABLE alumnos (
                        id SERIAL PRIMARY KEY,
                        documento VARCHAR NOT NULL,
                        nro_doc VARCHAR UNIQUE NOT NULL,
                        nombre VARCHAR NOT NULL,
                        apellido VARCHAR NOT NULL,
                        nacimiento VARCHAR,
                        mail VARCHAR UNIQUE NOT NULL,
                        telefono VARCHAR,
                        direccion VARCHAR,
                        cohorte VARCHAR,
                        estado VARCHAR,
                        al_dia BOOLEAN DEFAULT TRUE,
                        carrera_id INTEGER
                    );
                """))
                connection.commit()
                print("✅ Tabla 'alumnos' creada exitosamente con todos los campos nuevos.")
                return
            
            # Verificar si ya existen los nuevos campos
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'alumnos' AND column_name = 'documento';
            """))
            
            if result.fetchone():
                print("✅ La tabla 'alumnos' ya tiene los campos nuevos.")
                return
            
            print("🔄 Actualizando tabla 'alumnos' con nuevos campos...")
            
            # Agregar los nuevos campos uno por uno
            nuevos_campos = [
                ("documento", "VARCHAR NOT NULL DEFAULT 'DNI'"),
                ("nro_doc", "VARCHAR UNIQUE"),
                ("nacimiento", "VARCHAR"),
                ("telefono", "VARCHAR"),
                ("direccion", "VARCHAR"),
                ("cohorte", "VARCHAR"),
                ("estado", "VARCHAR"),
                ("al_dia", "BOOLEAN DEFAULT TRUE"),
                ("carrera_id", "INTEGER")
            ]
            
            for campo, tipo in nuevos_campos:
                try:
                    connection.execute(text(f"ALTER TABLE alumnos ADD COLUMN {campo} {tipo};"))
                    print(f"✅ Campo '{campo}' agregado exitosamente.")
                except Exception as e:
                    print(f"⚠️  Campo '{campo}' ya existe o hubo un error: {e}")
            
            # Migrar datos existentes
            print("🔄 Migrando datos existentes...")
            
            # Si existe el campo 'legajo', migrar a 'nro_doc'
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'alumnos' AND column_name = 'legajo';
            """))
            
            if result.fetchone():
                print("🔄 Migrando 'legajo' a 'nro_doc'...")
                connection.execute(text("""
                    UPDATE alumnos 
                    SET nro_doc = CAST(legajo AS VARCHAR) 
                    WHERE nro_doc IS NULL;
                """))
                
                # Eliminar el campo legajo después de migrar
                try:
                    connection.execute(text("ALTER TABLE alumnos DROP COLUMN legajo;"))
                    print("✅ Campo 'legajo' eliminado después de migrar a 'nro_doc'.")
                except Exception as e:
                    print(f"⚠️  No se pudo eliminar 'legajo': {e}")
            
            # Establecer valores por defecto para campos obligatorios
            connection.execute(text("""
                UPDATE alumnos 
                SET documento = 'DNI' 
                WHERE documento IS NULL;
            """))
            
            connection.execute(text("""
                UPDATE alumnos 
                SET estado = 'Activo' 
                WHERE estado IS NULL;
            """))
            
            connection.commit()
            print("✅ Migración completada exitosamente.")
            
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        raise

if __name__ == "__main__":
    print("🚀 Iniciando actualización de la tabla alumnos...")
    actualizar_tabla_alumnos()
    print("✅ Proceso completado.") 