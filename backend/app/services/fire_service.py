import io
import os
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

# Global variables for model and processor
_fire_processor = None
_fire_model = None

def get_fire_model():
    global _fire_processor, _fire_model
    if _fire_processor is None or _fire_model is None:
        candidate_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "saved_fire_model")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", "saved_fire_model")),
            os.path.abspath("saved_fire_model"),
            os.path.abspath(os.path.join("..", "saved_fire_model")),
            "/opt/render/project/src/saved_fire_model",
            "/opt/render/project/src/backend/saved_fire_model"
        ]
        
        model_path = None
        for path in candidate_paths:
            if os.path.exists(path) and os.path.isdir(path):
                # Verify it has config.json
                if os.path.exists(os.path.join(path, "config.json")):
                    model_path = path.replace("\\", "/")
                    break
        
        if model_path is None:
            print(f"Warning: valid saved_fire_model directory not found in: {candidate_paths}")
            return None, None
            
        try:
            print(f"Loading fire model from local path: {model_path}...")
            _fire_processor = AutoImageProcessor.from_pretrained(model_path, local_files_only=True)
            _fire_model = AutoModelForImageClassification.from_pretrained(model_path, local_files_only=True)
            _fire_model.eval()
            print("Fire model loaded successfully.")
        except Exception as e:
            print(f"Error loading fire model: {e}")
    return _fire_processor, _fire_model

async def process_fire_image(image_bytes: bytes) -> dict:
    """
    Process the image bytes and pass to the Hugging Face fire detection model.
    Returns a structured dictionary with prediction, confidence, probabilities, and status.
    """
    processor, model = get_fire_model()
    if processor is None or model is None:
        return {
            "prediction": "Model not loaded",
            "confidence": 0.0,
            "probabilities": {},
            "status": "Safe",
            "notes": "Fire model weights initializing or unavailable on cloud instance."
        }
        
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess the image for the model
        inputs = processor(images=image, return_tensors="pt")
        
        # Run the image through the model (Inference)
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Get the predicted class logits and compute softmax probabilities
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)[0]
        
        predicted_class_idx = int(logits.argmax(-1).item())
        predicted_label = model.config.id2label[predicted_class_idx]
        
        # Build class probabilities map
        probabilities = {}
        for idx, label in model.config.id2label.items():
            probabilities[label.capitalize()] = round(float(probs[int(idx)].item()) * 100, 2)
            
        confidence = float(probs[predicted_class_idx].item() * 100)
        
        # Determine status
        is_hazard = predicted_label.lower() in ["fire", "smoke"]
        
        formatted_pred = f"{predicted_label.capitalize()} Detected" if is_hazard else "Normal (No Fire/Smoke)"
        
        return {
            "prediction": formatted_pred,
            "raw_label": predicted_label,
            "confidence": round(confidence, 2),
            "probabilities": probabilities,
            "status": "Alert" if is_hazard else "Safe"
        }
        
    except Exception as e:
        print(f"Error processing fire image: {e}")
        return {
            "prediction": "Error Processing Image",
            "confidence": 0.0,
            "probabilities": {},
            "status": "Error",
            "error": str(e)
        }
