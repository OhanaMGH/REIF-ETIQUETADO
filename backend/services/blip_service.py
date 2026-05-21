from transformers import BlipProcessor, BlipForConditionalGeneration

processor = None
model = None
_blip_load_failed = False


def _load_blip():

    global processor, model, _blip_load_failed

    if _blip_load_failed:
        return None, None

    if processor is not None and model is not None:
        return processor, model

    print("Cargando modelo BLIP...")

    try:

        processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )

        model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )

        return processor, model

    except Exception as exc:

        print("ERROR: no se pudo cargar el modelo BLIP:", exc)

        _blip_load_failed = True

        return None, None


def generar_descripcion(image):

    proc, mod = _load_blip()

    if proc is None or mod is None:
        return "Modelo BLIP no disponible"

    inputs = proc(image, return_tensors="pt")

    output = mod.generate(**inputs)

    caption = proc.decode(
        output[0],
        skip_special_tokens=True
    )

    return caption