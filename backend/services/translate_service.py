from transformers import MarianMTModel, MarianTokenizer

print("Cargando traductor inglés → español...")

tokenizer = MarianTokenizer.from_pretrained(
    "Helsinki-NLP/opus-mt-en-es"
)

model = MarianMTModel.from_pretrained(
    "Helsinki-NLP/opus-mt-en-es"
)


def traducir_es(texto):

    inputs = tokenizer(texto, return_tensors="pt", padding=True)

    translated = model.generate(**inputs)

    resultado = tokenizer.decode(
        translated[0],
        skip_special_tokens=True
    )

    return resultado