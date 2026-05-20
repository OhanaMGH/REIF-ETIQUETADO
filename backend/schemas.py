from pydantic import BaseModel
from typing import Dict, Optional, Any
from datetime import datetime

class ImagenREIF(BaseModel):
    nombreOriginal: str
    urlImagen: str  # Aquí guardarás el Base64 o el path
    etiquetaManual: str
    descripcionIA: str
    actividadIA: str
    confianzaIA: float
    objetosDetectados: Dict[str, int]
    tipoContexto: str
    fechaRegistro: Optional[datetime] = None