import io
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

# Global variables for model and processor
_fire_processor = None
_fire_model = None

def get_fire_model():
    global _fire_processor, _fire_model
    if _fire_processor is None or _fire_model is None:
        import os
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../saved_fire_model"))
        # Replace backslashes for Hugging Face on Windows
        model_path = model_path.replace("\\", "/")
        try:
            print(f"Loading fire model from local path: {model_path}...")
            _fire_processor = AutoImageProcessor.from_pretrained(model_path, local_files_only=True)
            _fire_model = AutoModelForImageClassification.from_pretrained(model_path, local_files_only=True)
            print("Fire model loaded successfully.")
        except Exception as e:
            print(f"Error loading fire model: {e}")
    return _fire_processor, _fire_model

async def process_fire_image(image_bytes: bytes) -> str:
    """
    Process the image bytes and pass to the Hugging Face fire detection model.
    """
    processor, model = get_fire_model()
    if processor is None or model is None:
        return "Model not loaded"
        
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess the image for the model
        inputs = processor(images=image, return_tensors="pt")
        
        # Run the image through the model (Inference)
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Get the predicted class
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        
        # Get label
        predicted_label = model.config.id2label[predicted_class_idx]
        
        # e.g., 'Fire', 'Normal', 'Smoke'
        return predicted_label
        
    except Exception as e:
        print(f"Error processing fire image: {e}")
        return "Error Processing Image"
