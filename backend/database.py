from pymongo import MongoClient
import os
import sys

# URI obtenida desde Render Environment Variables
MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

    # Base de datos
    db = client["REIF_test"]

    # Colección
    coleccion_imagenes = db["imagenes"]

    # Verificar conexión
    client.server_info()

    print("✅ Conexión exitosa a MongoDB Atlas")

except Exception as e:
    print(f"❌ Error al conectar a MongoDB Atlas: {e}")
    sys.exit(1)


def obtener_coleccion():
    return coleccion_imagenes