from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.accident_service import process_accident_image

router = APIRouter()

@router.post("/")
async def detect_accident(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"detail": "File provided is not an image.", "status": "Error"}
        )
    
    # Read image contents into memory for speed
    image_bytes = await file.read()
    
    # Process image through ML service
    try:
        result = await process_accident_image(image_bytes)
        return {
            "filename": file.filename,
            **result
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "status": "Error", "filename": file.filename}
        )
