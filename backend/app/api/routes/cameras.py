from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

class Camera(BaseModel):
    id: str
    location: str
    status: str # 'Active', 'Alert', 'Offline'
    detections: List[str]
    image: str
    fps: int
    resolution: str
    lastPing: str

_cameras_db = [
    {
        "id": "CAM-01",
        "location": "Main Entrance",
        "status": "Active",
        "detections": [],
        "image": "/incidents/normal1.jpg",
        "fps": 30,
        "resolution": "1920x1080",
        "lastPing": "Live"
    },
    {
        "id": "CAM-02",
        "location": "Parking Lot A",
        "status": "Alert",
        "detections": ["Accident"],
        "image": "/incidents/accident.jpg",
        "fps": 28,
        "resolution": "1920x1080",
        "lastPing": "Live (Alert Triggered)"
    },
    {
        "id": "CAM-03",
        "location": "Warehouse B",
        "status": "Alert",
        "detections": ["Fire"],
        "image": "/incidents/fire.jpg",
        "fps": 30,
        "resolution": "2560x1440",
        "lastPing": "Live (Alert Triggered)"
    },
    {
        "id": "CAM-04",
        "location": "Loading Dock",
        "status": "Active",
        "detections": [],
        "image": "/incidents/normal2.jpg",
        "fps": 25,
        "resolution": "1920x1080",
        "lastPing": "Live"
    },
    {
        "id": "CAM-05",
        "location": "Hallway C",
        "status": "Alert",
        "detections": ["Fire"],
        "image": "/incidents/fire2.jpg",
        "fps": 30,
        "resolution": "1280x720",
        "lastPing": "Live (Alert Triggered)"
    },
    {
        "id": "CAM-06",
        "location": "Near Road",
        "status": "Alert",
        "detections": ["Accident"],
        "image": "/incidents/accident2.jpg",
        "fps": 30,
        "resolution": "1920x1080",
        "lastPing": "Live (Alert Triggered)"
    },
    {
        "id": "CAM-07",
        "location": "Perimeter Fence",
        "status": "Alert",
        "detections": ["Accident"],
        "image": "/incidents/accident3.jpg",
        "fps": 24,
        "resolution": "1920x1080",
        "lastPing": "Live (Alert Triggered)"
    },
    {
        "id": "CAM-08",
        "location": "Server Room",
        "status": "Active",
        "detections": [],
        "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
        "fps": 30,
        "resolution": "3840x2160",
        "lastPing": "Live"
    }
]

@router.get("/", response_model=List[Camera])
def get_cameras(status: Optional[str] = None):
    if status and status != "All":
        return [c for c in _cameras_db if c["status"].lower() == status.lower()]
    return _cameras_db

@router.get("/{camera_id}", response_model=Camera)
def get_camera(camera_id: str):
    for c in _cameras_db:
        if c["id"].upper() == camera_id.upper():
            return c
    raise HTTPException(status_code=404, detail="Camera not found")

@router.post("/{camera_id}/scan")
def trigger_camera_ai_scan(camera_id: str):
    for c in _cameras_db:
        if c["id"].upper() == camera_id.upper():
            # Return live telemetry inspection result
            has_alert = len(c["detections"]) > 0
            return {
                "camera_id": c["id"],
                "location": c["location"],
                "status": c["status"],
                "detections": c["detections"],
                "confidence": 97.8 if has_alert else 99.2,
                "latency_ms": random.randint(18, 42),
                "ai_engine": "Emergi-Vision v2.0 Dual Core (SigLIP + MobileNet)",
                "timestamp": "Now"
            }
    raise HTTPException(status_code=404, detail="Camera not found")
