import os
import io
import time
from PIL import Image, ImageDraw, ImageFont
import requests

API_URL = "http://127.0.0.1:8000/accidentmodel/"
TEST_DIR = r"d:\Accident\Sample_Test_Images"
OUTPUT_DIR = r"d:\Accident\Output_Results"

def process_images():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    if not os.path.exists(TEST_DIR):
        print(f"Test directory not found: {TEST_DIR}")
        return

    # To ensure backend is running, we could use the service directly,
    # but the API is more robust for a full integration test.
    # Alternatively, let's just use the service directly so we don't need to start the FastAPI server.
    
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))
    
    import asyncio
    from app.services.accident_service import process_accident_image
    
    async def run_processing():
        count = 0
        for filename in os.listdir(TEST_DIR):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(TEST_DIR, filename)
                print(f"Processing {filename}...")
                
                with open(img_path, "rb") as f:
                    image_bytes = f.read()
                
                # Predict
                prediction = await process_accident_image(image_bytes)
                print(f"Prediction for {filename}: {prediction}")
                
                # Draw on image
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                draw = ImageDraw.Draw(img)
                
                # Load default font
                font = ImageFont.load_default()
                text = f"Pred: {prediction}"
                
                # Try to get larger font if possible, else just use default
                try:
                    font = ImageFont.truetype("arial.ttf", 36)
                except IOError:
                    pass
                
                # Determine color based on prediction
                color = "red" if prediction == "Accident Detected" else "green"
                
                # Draw text background
                bbox = draw.textbbox((10, 10), text, font=font)
                draw.rectangle([bbox[0]-5, bbox[1]-5, bbox[2]+5, bbox[3]+5], fill="black")
                draw.text((10, 10), text, fill=color, font=font)
                
                # Save image
                out_path = os.path.join(OUTPUT_DIR, f"pred_{filename}")
                img.save(out_path)
                count += 1
                
        print(f"Processed and saved {count} images to {OUTPUT_DIR}")

    asyncio.run(run_processing())

if __name__ == "__main__":
    process_images()
