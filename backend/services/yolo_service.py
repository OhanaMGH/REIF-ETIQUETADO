from ultralytics import YOLO

model = None


def _load_yolo():
    global model

    if model is None:
        print("Cargando YOLOv8...")
        model = YOLO("yolov8m.pt")  

    return model


def detectar_objetos(image):
    model = _load_yolo()

    results = model(image)

    detecciones = {}

    for r in results:
        for box in r.boxes:
            clase_id = int(box.cls[0])
            clase_nombre = model.names[clase_id]
            confianza = float(box.conf[0])

            #  filtrar detecciones débiles
            if confianza < 0.25:
                continue

            detecciones[clase_nombre] = detecciones.get(clase_nombre, 0) + 1

    return detecciones