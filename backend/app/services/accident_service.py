import io
import os
import numpy as np
from PIL import Image
from tensorflow import keras

# Global variable to store the loaded model
_accident_model = None

def get_model():
    global _accident_model
    if _accident_model is None:
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../accident_model.keras"))
        try:
            _accident_model = keras.models.load_model(model_path)
            print("Accident model loaded successfully.")
        except Exception as e:
            print(f"Error loading accident model: {e}")
    return _accident_model

async def process_accident_image(image_bytes: bytes) -> str:
    """
    Process the image bytes and pass to the accident classification model.
    """
    model = get_model()
    if model is None:
        return "Model not loaded"
        
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess image for the model
        img_resized = image.resize((224, 224))
        img_array = np.array(img_resized) # The model has a built-in Rescaling layer
        img_expanded = np.expand_dims(img_array, axis=0)
        
        # Run inference
        prediction = model.predict(img_expanded, verbose=0)
        
        # The model has 2 classes: 0 -> Accident, 1 -> Non Accident
        class_idx = np.argmax(prediction[0])
        return "Accident Detected" if class_idx == 0 else "Normal"
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return "Error Processing Image"
