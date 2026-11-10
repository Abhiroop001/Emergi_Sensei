import os
import io
import asyncio
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TEST_DIR = os.path.join(BASE_DIR, "Sample_Test_Images")
OUTPUT_DIR = os.path.join(BASE_DIR, "Output_Results")

def process_images():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    if not os.path.exists(TEST_DIR):
        print(f"Test directory not found: {TEST_DIR}")
        return
    
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))
    
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
                result = await process_accident_image(image_bytes)
                prediction = result.get("prediction", "Unknown")
                confidence = result.get("confidence", 0)
                vehicle_type = result.get("vehicle_type", "Unknown")
                is_veh = result.get("vehicle_detected", False)
                
                print(f"Prediction for {filename}: Vehicle={vehicle_type} (Detected={is_veh}) -> {prediction} ({confidence}%)")
                
                # Draw on image
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                draw = ImageDraw.Draw(img)
                
                # Load default font
                font = ImageFont.load_default()
                text = f"[{'VEHICLE: ' + vehicle_type if is_veh else 'NO VEHICLE'}] {prediction} ({confidence}%)"
                
                # Determine color based on prediction
                color = "red" if "Accident" in prediction else "green"
                
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

