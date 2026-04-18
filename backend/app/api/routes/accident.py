from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.accident_service import process_accident_image

router = APIRouter()

@router.post("/")
async def detect_accident(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    # Read image contents into memory for speed
    image_bytes = await file.read()
    
    # Process image through our ML service
    try:
        prediction = await process_accident_image(image_bytes)
        return {"filename": file.filename, "prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
