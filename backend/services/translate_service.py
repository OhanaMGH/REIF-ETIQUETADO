from transformers import MarianMTModel, MarianTokenizer

MODEL_NAME = "Helsinki-NLP/opus-mt-en-es"

tokenizer = None
model = None


def cargar_modelo():
    global tokenizer, model

    if tokenizer is None or model is None:
        print("Cargando traductor inglés → español...")

        tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)

        model = MarianMTModel.from_pretrained(MODEL_NAME)

        print("Traductor cargado correctamente")


def traducir_es(texto):
    cargar_modelo()

    inputs = tokenizer(
        texto,
        return_tensors="pt",
        padding=True
    )

    translated = model.generate(**inputs)

    resultado = tokenizer.decode(
        translated[0],
        skip_special_tokens=True
    )

    return resultado