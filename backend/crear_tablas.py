from .db import Base, engine
from . import modelos

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas correctamente.") 