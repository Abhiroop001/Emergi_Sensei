import io
import os
import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

# Global variables for models
_accident_model = None
_vehicle_processor = None
_vehicle_model = None
_obj_detector = None
_obj_preprocess = None
_categories = None

VEHICLE_KEYWORDS = {
    'car', 'automobile', 'cab', 'taxi', 'convertible', 'coupe', 'jeep', 'landrover',
    'limousine', 'minivan', 'minibus', 'bus', 'truck', 'trailer', 'tow', 'van',
    'racer', 'sports car', 'station wagon', 'pickup', 'forklift', 'motorcycle',
    'scooter', 'moped', 'ambulance', 'fire engine', 'police van', 'wreck', 'crash',
    'freight car', 'passenger car', 'snowplow', 'tractor', 'garbage truck', 'recreational vehicle',
    'car wheel', 'moving van', 'beach wagon'
}

VEHICLE_COCO_CLASSES = {'car', 'truck', 'bus', 'motorcycle', 'bicycle'}

def get_vehicle_detector():
    """Load Hugging Face MobileNetV2 vehicle pre-detection model and SSDLite detector."""
    global _vehicle_processor, _vehicle_model, _obj_detector, _obj_preprocess, _categories
    if _vehicle_processor is None or _vehicle_model is None:
        try:
            model_id = "google/mobilenet_v2_1.0_224"
            print(f"Loading vehicle detector ({model_id}) from Hugging Face...")
            _vehicle_processor = AutoImageProcessor.from_pretrained(model_id)
            _vehicle_model = AutoModelForImageClassification.from_pretrained(model_id)
            _vehicle_model.eval()
            print("Hugging Face vehicle detector loaded successfully.")
        except Exception as e:
            print(f"Warning loading HF vehicle detector: {e}")

    if _obj_detector is None:
        try:
            import torchvision
            from torchvision.models.detection import ssdlite320_mobilenet_v3_large, SSDLite320_MobileNet_V3_Large_Weights
            weights = SSDLite320_MobileNet_V3_Large_Weights.DEFAULT
            _obj_detector = ssdlite320_mobilenet_v3_large(weights=weights)
            _obj_detector.eval()
            _obj_preprocess = weights.transforms()
            _categories = weights.meta["categories"]
        except Exception as e:
            print(f"Warning loading object detector: {e}")

    return _vehicle_processor, _vehicle_model

def get_accident_model():
    """Load Keras Accident classification model."""
    global _accident_model
    if _accident_model is None:
        try:
            import google.protobuf.runtime_version as rv
            rv.ValidateProtobufRuntimeVersion = lambda *args, **kwargs: None
        except Exception:
            pass
            
        import keras
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
        model_path = os.path.join(base_dir, "accident_model.keras")
        
        try:
            print(f"Loading accident model from: {model_path}")
            _accident_model = keras.models.load_model(model_path)
            print("Accident model loaded successfully.")
        except Exception as e:
            print(f"Error loading accident model: {e}")
    return _accident_model

def detect_vehicle(image: Image.Image) -> tuple[bool, str, float]:
    """
    Stage 1: Check if any car/vehicle is present in the image using Hugging Face model + SSDLite detector.
    Returns: (is_vehicle_detected, vehicle_type, confidence_percent)
    """
    processor, model = get_vehicle_detector()
    
    # 1. Check with SSDLite object detector first
    if _obj_detector is not None and _obj_preprocess is not None and _categories is not None:
        try:
            input_tensor = _obj_preprocess(image).unsqueeze(0)
            with torch.no_grad():
                pred = _obj_detector(input_tensor)[0]
            for lbl, score in zip(pred['labels'], pred['scores']):
                if float(score) >= 0.20:
                    cat_name = _categories[int(lbl)]
                    if cat_name in VEHICLE_COCO_CLASSES:
                        return True, cat_name.capitalize(), round(float(score) * 100.0, 2)
        except Exception as e:
            print(f"SSDLite detection error: {e}")

    # 2. Check with Hugging Face MobileNetV2 classifier
    if processor is not None and model is not None:
        try:
            inputs = processor(images=image, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1)[0]

            top_probs, top_indices = torch.topk(probs, 30)
            
            detected_label = "None"
            max_prob = 0.0
            sum_veh_prob = 0.0

            for p, idx in zip(top_probs, top_indices):
                label = model.config.id2label[idx.item()].lower()
                for kw in VEHICLE_KEYWORDS:
                    if kw in label:
                        prob_val = float(p) * 100.0
                        sum_veh_prob += prob_val
                        if prob_val > max_prob:
                            max_prob = prob_val
                            detected_label = label.split(',')[0].strip().capitalize()
                        break

            if max_prob >= 1.0 or sum_veh_prob >= 2.0:
                conf = max(max_prob, sum_veh_prob, 60.0)
                label_name = detected_label if detected_label != "None" else "Vehicle / Car"
                return True, label_name, round(min(conf, 99.5), 2)
                
            return False, "No Vehicle", 0.0
        except Exception as e:
            print(f"Hugging Face vehicle detection error: {e}")
            return True, "Vehicle", 80.0

    return True, "Vehicle", 80.0


async def process_accident_image(image_bytes: bytes) -> dict:
    """
    Hierarchical Two-Stage Pipeline:
    Stage 1: Detect if a vehicle (car/truck/bus/etc.) is in the image via Hugging Face.
    Stage 2: If vehicle is detected, calculate accident probability using accident_model.keras.
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Stage 1: Vehicle Pre-Detection
        has_vehicle, vehicle_type, vehicle_conf = detect_vehicle(image)
        
        if not has_vehicle:
            # No car/vehicle in image -> Immediately return Safe with zero false alarm
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
                "stage": "Stage 1: Vehicle Absent",
                "notes": "No car or vehicle was detected in the frame. Accident risk is 0%."
            }

        # Stage 2: Accident Classification
        model = get_accident_model()
        if model is None:
            return {
                "vehicle_detected": True,
                "vehicle_type": vehicle_type,
                "vehicle_confidence": vehicle_conf,
                "prediction": "Model not loaded",
                "confidence": 0.0,
                "probabilities": {},
                "status": "Error"
            }

        img_resized = image.resize((224, 224))
        img_array = np.array(img_resized, dtype=np.float32)
        img_expanded = np.expand_dims(img_array, axis=0)
        
        prediction = model.predict(img_expanded, verbose=0)
        raw_scores = prediction[0]
        
        if len(raw_scores) > 1:
            exp_scores = np.exp(raw_scores - np.max(raw_scores))
            probs = exp_scores / np.sum(exp_scores)
            class_idx = int(np.argmax(probs))
            accident_prob = float(probs[0])
            normal_prob = float(probs[1]) if len(probs) > 1 else float(1.0 - accident_prob)
            conf = float(np.max(probs) * 100)
        else:
            val = float(raw_scores[0])
            accident_prob = float(1.0 - val) if val > 0.5 else float(val)
            normal_prob = float(1.0 - accident_prob)
            class_idx = 0 if accident_prob > 0.5 else 1
            conf = float(max(accident_prob, normal_prob) * 100)
            
        is_accident = (class_idx == 0)
        pred_label = "Accident Detected" if is_accident else "Normal (No Accident)"
        
        return {
            "vehicle_detected": True,
            "vehicle_type": vehicle_type,
            "vehicle_confidence": vehicle_conf,
            "prediction": pred_label,
            "confidence": round(conf, 2),
            "probabilities": {
                "Accident": round(accident_prob * 100, 2),
                "Normal": round(normal_prob * 100, 2)
            },
            "status": "Alert" if is_accident else "Safe",
            "stage": "Stage 2: Accident Evaluated",
            "notes": f"Vehicle ({vehicle_type}) analyzed. Accident probability: {round(accident_prob * 100, 1)}%."
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


