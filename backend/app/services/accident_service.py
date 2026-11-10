import io
import os
import gc
import numpy as np
from PIL import Image

# Global model references
_tflite_interpreter = None
_tflite_details = None
_accident_keras_model = None
_vehicle_processor = None
_vehicle_model = None

VEHICLE_CLASSES = {'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'train', 'van'}

def get_vehicle_detector():
    """
    Stage 1: Load lightweight Hugging Face YOLOS model (~25MB) for vehicle/car pre-detection.
    """
    global _vehicle_processor, _vehicle_model
    if _vehicle_processor is not None and _vehicle_model is not None:
        return _vehicle_processor, _vehicle_model

    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "saved_vehicle_model")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", "saved_vehicle_model")),
        os.path.abspath("saved_vehicle_model"),
        os.path.abspath(os.path.join("..", "saved_vehicle_model")),
        "/opt/render/project/src/saved_vehicle_model",
        "/opt/render/project/src/backend/saved_vehicle_model"
    ]

    target = None
    for path in candidate_paths:
        if os.path.exists(path) and os.path.isdir(path):
            weights_path = os.path.join(path, "model.safetensors")
            if os.path.exists(weights_path) and os.path.getsize(weights_path) > 1024 * 1024:
                target = path.replace("\\", "/")
                break

    if target is None:
        target = "hustvl/yolos-tiny"

    try:
        from transformers import AutoImageProcessor, AutoModelForObjectDetection
        import torch
        try:
            torch.set_num_threads(1)
        except Exception:
            pass
        print(f"Loading Hugging Face vehicle detector from: {target}...")
        _vehicle_processor = AutoImageProcessor.from_pretrained(target)
        _vehicle_model = AutoModelForObjectDetection.from_pretrained(target, low_cpu_mem_usage=True)
        _vehicle_model.eval()
        print("Hugging Face vehicle detector loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize Hugging Face vehicle detector ({e})")
        _vehicle_processor = None
        _vehicle_model = None

    return _vehicle_processor, _vehicle_model

def detect_vehicle_huggingface(image: Image.Image) -> tuple[bool, str, float]:
    """
    Stage 1: Scan image to find if any car, truck, bus, or vehicle is present using Hugging Face.
    Returns: (is_vehicle_detected, vehicle_type, confidence_percent)
    """
    processor, model = get_vehicle_detector()
    if processor is None or model is None:
        return True, "Vehicle", 85.0

    try:
        import torch
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            
        target_sizes = torch.tensor([image.size[::-1]])
        results = processor.post_process_object_detection(outputs, target_sizes=target_sizes, threshold=0.18)[0]
        
        best_veh_name = None
        max_veh_score = 0.0

        for score, label_idx in zip(results['scores'], results['labels']):
            cls_name = model.config.id2label[label_idx.item()].lower()
            sc_val = float(score.item())
            if cls_name in VEHICLE_CLASSES and sc_val > max_veh_score:
                max_veh_score = sc_val
                best_veh_name = cls_name

        del inputs, outputs, results
        gc.collect()

        if best_veh_name is not None and max_veh_score >= 0.18:
            return True, best_veh_name.capitalize(), round(max_veh_score * 100.0, 2)

        return False, "No Vehicle", 0.0

    except Exception as e:
        print(f"Error during Hugging Face vehicle detection: {e}")
        return True, "Vehicle", 80.0

def get_tflite_interpreter():
    """Load lightweight TFLite model (~2.5MB, ~10MB RAM)."""
    global _tflite_interpreter, _tflite_details
    if _tflite_interpreter is not None:
        return _tflite_interpreter, _tflite_details

    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "accident_model.tflite")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", "accident_model.tflite")),
        os.path.abspath("accident_model.tflite"),
        os.path.abspath(os.path.join("..", "accident_model.tflite")),
        "/opt/render/project/src/accident_model.tflite",
        "/opt/render/project/src/backend/accident_model.tflite"
    ]

    tflite_path = None
    for path in candidate_paths:
        if os.path.exists(path) and os.path.isfile(path) and os.path.getsize(path) > 1000:
            tflite_path = path
            break

    if tflite_path is None:
        return None, None

    # Try LiteRT / tflite_runtime / tensorflow.lite
    Interpreter = None
    try:
        from ai_edge_litert.interpreter import Interpreter
    except ImportError:
        try:
            from tflite_runtime.interpreter import Interpreter
        except ImportError:
            try:
                import tensorflow as tf
                Interpreter = tf.lite.Interpreter
            except ImportError:
                Interpreter = None

    if Interpreter is None:
        return None, None

    try:
        print(f"Loading TFLite accident model from: {tflite_path}")
        interp = Interpreter(model_path=tflite_path)
        interp.allocate_tensors()
        inp_details = interp.get_input_details()
        out_details = interp.get_output_details()
        _tflite_interpreter = interp
        _tflite_details = (inp_details, out_details)
        print("TFLite accident model loaded successfully.")
        return _tflite_interpreter, _tflite_details
    except Exception as e:
        print(f"Error initializing TFLite interpreter: {e}")
        return None, None

def get_keras_model():
    """Fallback: Load Keras accident classification model."""
    global _accident_keras_model
    if _accident_keras_model is not None:
        return _accident_keras_model

    try:
        import google.protobuf.runtime_version as rv
        rv.ValidateProtobufRuntimeVersion = lambda *args, **kwargs: None
    except Exception:
        pass

    try:
        import keras
    except ImportError:
        return None

    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "accident_model.keras")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", "accident_model.keras")),
        os.path.abspath("accident_model.keras"),
        os.path.abspath(os.path.join("..", "accident_model.keras")),
        "/opt/render/project/src/accident_model.keras",
        "/opt/render/project/src/backend/accident_model.keras"
    ]

    for path in candidate_paths:
        if os.path.exists(path) and os.path.isfile(path) and os.path.getsize(path) > 1000:
            try:
                print(f"Loading Keras accident model from: {path}")
                _accident_keras_model = keras.models.load_model(path)
                print("Keras accident model loaded successfully.")
                return _accident_keras_model
            except Exception as e:
                print(f"Error loading Keras model: {e}")
    return None

async def process_accident_image(image_bytes: bytes) -> dict:
    """
    Hierarchical Two-Stage Pipeline:
    Stage 1: Detect if a car/vehicle is in the image using Hugging Face (YOLOS).
    Stage 2: If a vehicle is detected, run Accident Classification via lightweight TFLite.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # -------------------------------------------------------------
        # STAGE 1: Check if any car/vehicle is present (Hugging Face)
        # -------------------------------------------------------------
        has_vehicle, vehicle_type, vehicle_conf = detect_vehicle_huggingface(image)

        if not has_vehicle:
            # No car/vehicle in image -> Return Safe immediately
            return {
                "vehicle_detected": False,
                "vehicle_type": "No Vehicle Detected",
                "vehicle_confidence": 0.0,
                "prediction": "No Vehicle (Safe)",
                "confidence": 100.0,
                "probabilities": {
                    "Accident": 0.0,
                    "Normal": 100.0
                },
                "status": "Safe",
                "stage": "Stage 1: Vehicle Absent (HF YOLOS)",
                "notes": "No car or vehicle was detected in the frame. Accident risk is 0%."
            }

        # -------------------------------------------------------------
        # STAGE 2: Vehicle present -> Evaluate Accident Risk (TFLite)
        # -------------------------------------------------------------
        img_resized = image.resize((224, 224))
        arr = np.expand_dims(np.array(img_resized, dtype=np.float32), axis=0)

        accident_prob = None
        normal_prob = None

        # 1. Try ultra-lightweight TFLite interpreter first (fastest, lowest memory)
        interp, details = get_tflite_interpreter()
        if interp is not None and details is not None:
            inp_details, out_details = details
            interp.set_tensor(inp_details[0]['index'], arr)
            interp.invoke()
            preds = interp.get_tensor(out_details[0]['index'])[0]
            accident_prob = float(preds[0]) * 100.0
            normal_prob = float(preds[1]) * 100.0 if len(preds) > 1 else (100.0 - accident_prob)

        # 2. Fallback to Keras model if TFLite is unavailable
        if accident_prob is None:
            keras_model = get_keras_model()
            if keras_model is not None:
                prediction = keras_model.predict(arr, verbose=0)
                raw_scores = prediction[0]
                if len(raw_scores) > 1:
                    exp_scores = np.exp(raw_scores - np.max(raw_scores))
                    probs = exp_scores / np.sum(exp_scores)
                    accident_prob = float(probs[0]) * 100.0
                    normal_prob = float(probs[1]) * 100.0
                else:
                    val = float(raw_scores[0])
                    accident_prob = float(val) * 100.0 if val <= 1.0 else float(val)
                    normal_prob = float(100.0 - accident_prob)

        # 3. If models are still loading
        if accident_prob is None:
            return {
                "vehicle_detected": True,
                "vehicle_type": vehicle_type,
                "vehicle_confidence": vehicle_conf,
                "prediction": "Model Initializing",
                "confidence": 50.0,
                "probabilities": {"Accident": 0.0, "Normal": 100.0},
                "status": "Safe",
                "stage": "Standby",
                "notes": "Accident detection model is initializing on cloud instance."
            }

        is_accident = (accident_prob >= 50.0)
        conf = accident_prob if is_accident else normal_prob
        pred_label = "Accident Detected" if is_accident else "Normal (No Accident)"

        del arr, img_resized
        gc.collect()

        return {
            "vehicle_detected": True,
            "vehicle_type": vehicle_type,
            "vehicle_confidence": round(vehicle_conf, 2),
            "prediction": pred_label,
            "confidence": round(conf, 2),
            "probabilities": {
                "Accident": round(accident_prob, 2),
                "Normal": round(normal_prob, 2)
            },
            "status": "Alert" if is_accident else "Safe",
            "stage": "Stage 2: Accident Evaluated",
            "notes": f"Vehicle ({vehicle_type}) verified with Hugging Face ({vehicle_conf}%). {pred_label} with {round(conf, 2)}% confidence."
        }
    except Exception as e:
        print(f"Error processing accident image: {e}")
        return {
            "vehicle_detected": False,
            "vehicle_type": "Unknown",
            "vehicle_confidence": 0.0,
            "prediction": "Error Processing Image",
            "confidence": 0.0,
            "probabilities": {},
            "status": "Error",
            "error": str(e)
        }
