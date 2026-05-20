import re
from config.etiquetas import palabras_ignorar


def extraer_objetos(descripcion):

    palabras = re.findall(r'\b\w+\b', descripcion.lower())

    objetos = []

    for p in palabras:

        if p not in palabras_ignorar and len(p) > 3:

            objetos.append({"clase": p})

    objetos_unicos = list({obj["clase"]: obj for obj in objetos}.values())

    return objetos_unicos