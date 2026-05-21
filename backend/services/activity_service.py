import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"

model_name = "openai/clip-vit-base-patch32"

model = None
processor = None


def _load_clip():

    global model, processor

    if model is None or processor is None:

        print("Cargando modelo CLIP...")

        model = CLIPModel.from_pretrained(model_name).to(device)

        processor = CLIPProcessor.from_pretrained(model_name)

    return model, processor


def clasificar_actividad(imagen_pil, objetos):

    """
    Clasifica actividades institucionales utilizando CLIP
    y genera explicaciones apoyadas con YOLOv8.
    """

    model, processor = _load_clip()

    categorias_dict = {

        "Clase":
        "a university classroom with students attending class, desks, chairs, professor teaching, indoor academic environment",

        "Cancha":
        "students playing sports on an outdoor university court, soccer field or basketball court, athletic activity",

        "Conferencia":
        "a formal academic conference or seminar, audience seated, speaker presenting, projector screen, university event",

        "Reconocimiento":
        "a university recognition ceremony, people receiving diplomas, certificates, awards, formal group photo",

        "Celebracion":
        "a university social celebration, group of people smiling, party, food, cake, gathering event",

        "Centro Computo":
        "a university computer lab with students using desktop computers, monitors, keyboards, technology classroom",

        "Otros":
        "an unrelated image, random object, empty place, outdoor scene, street, landscape, animal, or non institutional content"
    }

    nombres_es = list(categorias_dict.keys())
    descripciones_en = list(categorias_dict.values())

    # =====================================================
    # Inferencia con CLIP
    # =====================================================

    inputs = processor(
        text=descripciones_en,
        images=imagen_pil,
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():

        outputs = model(**inputs)

    probs = outputs.logits_per_image.softmax(dim=1)

    idx_max = torch.argmax(probs).item()

    actividad_final = nombres_es[idx_max]

    confianza = probs[0][idx_max].item()

    # =====================================================
    # Top 2 categorías
    # =====================================================

    top2 = torch.topk(probs, 2)

    idx1 = top2.indices[0][0].item()
    idx2 = top2.indices[0][1].item()

    categoria_1 = nombres_es[idx1]
    categoria_2 = nombres_es[idx2]

    score_1 = probs[0][idx1].item()
    score_2 = probs[0][idx2].item()

    motivos = []

    motivos.append(
        f"La imagen presenta características visuales asociadas a una actividad de tipo {actividad_final}."
    )

    # =====================================================
    # Explicaciones por categoría
    # =====================================================

    if actividad_final == "Clase":

        motivos.append(
            "El entorno visual parece corresponder a un salón o espacio académico universitario."
        )

        if "chair" in objetos:
            motivos.append(
                "Se identificó mobiliario típico de un aula."
            )

        if "laptop" in objetos:
            motivos.append(
                "La presencia de equipos de cómputo sugiere actividades de aprendizaje."
            )

    elif actividad_final == "Conferencia":

        motivos.append(
            "La disposición de las personas sugiere una presentación o evento formal."
        )

        motivos.append(
            "El contexto visual coincide con actividades académicas de exposición o conferencia."
        )

    elif actividad_final == "Cancha":

        motivos.append(
            "La escena presenta características relacionadas con actividades deportivas."
        )

        if "sports ball" in objetos:
            motivos.append(
                "Se detectó equipamiento deportivo dentro del área."
            )

    elif actividad_final == "Reconocimiento":

        motivos.append(
            "La imagen parece corresponder a una ceremonia o actividad de reconocimiento académico."
        )

        motivos.append(
            "La composición visual coincide con eventos formales institucionales."
        )

    elif actividad_final == "Celebracion":

        motivos.append(
            "La imagen muestra un ambiente social o de convivencia grupal."
        )

        if "cup" in objetos or "bottle" in objetos:

            motivos.append(
                "Se identificaron elementos asociados a reuniones o celebraciones."
            )

    elif actividad_final == "Centro Computo":

        motivos.append(
            "El entorno visual coincide con un laboratorio o centro de cómputo universitario."
        )

        if "laptop" in objetos or "monitor" in objetos:

            motivos.append(
                "Se detectaron equipos tecnológicos utilizados en actividades académicas."
            )

    elif actividad_final == "Otros":

        motivos.append(
            "La imagen no presenta suficientes elementos relacionados con actividades institucionales."
        )

    diferencia = abs(score_1 - score_2)

    if diferencia < 0.10:

        motivos.append(
            f"La imagen comparte características visuales similares entre '{categoria_1}' y '{categoria_2}'."
        )

    if actividad_final != "Otros" and not objetos:

        actividad_final = "Otros"

        confianza = 0.20

        motivos = [
            "La imagen no contiene suficientes elementos visuales para identificar una actividad institucional."
        ]

    confianza = min(confianza, 0.95)

    return actividad_final, confianza, motivos