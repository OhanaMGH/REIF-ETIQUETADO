from pymongo import MongoClient
import sys

# Configuración de conexión
MONGO_URI = "mongodb://localhost:27017/"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Según tu imagen, la base de datos es "REIF" y la colección es "imagenes"
    db = client["REIF_test"]
    coleccion_imagenes = db["imagenes"]
    
    # Prueba de conexión rápida
    client.server_info() 
    print("Conexión exitosa a MongoDB: REIF > imagenes")
except Exception as e:
    print(f"Error al conectar a MongoDB: {e}")
    sys.exit(1)

def obtener_coleccion():
    return coleccion_imagenes