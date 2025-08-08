#!/usr/bin/env python3
"""
Script para inicializar Alembic y generar la primera migración.
Ejecutar este script después de configurar las variables de entorno.
"""

import os
import subprocess
import sys

def run_command(command):
    """Ejecutar un comando y mostrar la salida"""
    print(f"Ejecutando: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print("Salida:", result.stdout)
    if result.stderr:
        print("Errores:", result.stderr)
    
    if result.returncode != 0:
        print(f"Error al ejecutar: {command}")
        return False
    
    return True

def main():
    print("=== Inicializando Alembic para el proyecto Classroom ===")
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists("alembic.ini"):
        print("Error: No se encontró alembic.ini. Asegúrate de estar en el directorio raíz del proyecto.")
        sys.exit(1)
    
    # Verificar que existe el archivo .env
    if not os.path.exists(".env"):
        print("Advertencia: No se encontró el archivo .env. Asegúrate de configurar las variables de entorno.")
        print("Variables necesarias:")
        print("- POSTGRES_USER")
        print("- POSTGRES_PASSWORD") 
        print("- POSTGRES_DB")
        print("- POSTGRES_HOST")
        print("- POSTGRES_PORT")
    
    # Inicializar Alembic (solo si no está ya inicializado)
    if not os.path.exists("alembic/env.py"):
        print("Inicializando Alembic...")
        if not run_command("alembic init alembic"):
            print("Error al inicializar Alembic")
            sys.exit(1)
    
    # Generar la primera migración
    print("\nGenerando la primera migración...")
    if not run_command('alembic revision --autogenerate -m "Initial migration"'):
        print("Error al generar la migración")
        sys.exit(1)
    
    print("\n=== Migración generada exitosamente ===")
    print("\nPara aplicar la migración a la base de datos, ejecuta:")
    print("alembic upgrade head")
    
    print("\nOtros comandos útiles:")
    print("- alembic current          # Ver la versión actual")
    print("- alembic history          # Ver historial de migraciones")
    print("- alembic downgrade -1     # Revertir una migración")
    print("- alembic upgrade +1       # Aplicar una migración")

if __name__ == "__main__":
    main()
