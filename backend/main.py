from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from datetime import datetime

# Base de datos
from database import obtener_coleccion
from schemas import ImagenREIF

# Servicios IA
from services.yolo_service import detectar_objetos
from services.activity_service import clasificar_actividad
import services.blip_service as blip
import services.translate_service as ts


app = FastAPI(title="REIF API - Repositorio de Etiquetado Imágenes FEI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    print("Sistema REIF iniciado correctamente")
    print("Modelos cargados: YOLOv8, BLIP, CLIP")



@app.get("/")
def home():
    return {"mensaje": "API REIF funcionando correctamente"}


@app.post("/analizar")
async def analizar(file: UploadFile = File(...)):
    try:
        
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        caption_en = blip.generar_descripcion(image).lower()
        caption_es = ts.traducir_es(caption_en)
        objetos = detectar_objetos(image)
        actividad, confianza, motivos = clasificar_actividad(image, objetos)
        if confianza > 0.35 and actividad != "Desconocido":
            tipo = "claro"
        else:
            tipo = "dudoso"
        return {
            "success": True,
            "descripcion": caption_es,
            "descripcion_original": caption_en,
            "actividad": actividad,
            "confianza": round(float(confianza), 2), 
            "objetos": objetos,
            "motivos": motivos,
            "tipo": tipo
        }

    except Exception as e:
        print(f"ERROR ANALIZANDO IMAGEN: {e}")
        return {
            "success": False,
            "mensaje": f"Error procesando imagen: {str(e)}"
        }

@app.post("/guardar")
async def guardar_imagen(datos: ImagenREIF):
    try:
        coleccion = obtener_coleccion()

        # Convertir objeto Pydantic a diccionario
        documento = datos.dict()

        # Metadatos automáticos
        documento["fechaRegistro"] = datetime.utcnow()
        
        # Asegurar que la confianza sea float en la BD
        if "confianza" in documento:
            documento["confianzaIA"] = float(documento["confianzaIA"])

        # Insertar en MongoDB
        resultado = coleccion.insert_one(documento)

        return {
            "success": True,
            "id_insertado": str(resultado.inserted_id),
            "mensaje": "Imagen registrada en el repositorio REIF"
        }

    except Exception as e:
        print(f"ERROR GUARDANDO EN BD: {e}")
        return {
            "success": False,
            "mensaje": f"Error al guardar en base de datos: {str(e)}"
        }