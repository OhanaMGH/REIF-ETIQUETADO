from pymongo import MongoClient
import certifi
import os
import sys

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )

    db = client["REIF_test"]
    coleccion_imagenes = db["imagenes"]

    client.server_info()

    print("✅ Conexión exitosa a MongoDB Atlas")

except Exception as e:
    print(f"❌ Error al conectar a MongoDB Atlas: {e}")
    sys.exit(1)


def obtener_coleccion():
    return coleccion_imagenes