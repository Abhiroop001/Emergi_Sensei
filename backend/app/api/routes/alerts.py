from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter()

class AlertItem(BaseModel):
    id: str
    type: str # 'Fire' or 'Accident'
    location: str
    time: str
    severity: str # 'Critical', 'High', 'Medium', 'Low'
    status: str # 'Active', 'Resolved', 'False Alarm'
    conf: float
    snapshot: Optional[str] = None
    notes: Optional[str] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class AlertCreate(BaseModel):
    type: str
    location: str
    severity: str
    conf: float
    snapshot: Optional[str] = None
    notes: Optional[str] = None

# In-memory alerts store initialized with realistic initial items
_alerts_db = [
    {
        "id": "ALT-1045",
        "type": "Fire",
        "location": "Warehouse Sector B",
        "time": "Today, 14:32:01",
        "severity": "Critical",
        "status": "Active",
        "conf": 98.4,
        "snapshot": "/incidents/fire.jpg",
        "notes": "Thermal sensor detected rapid temperature rise alongside smoke emission."
    },
    {
        "id": "ALT-1044",
        "type": "Accident",
        "location": "Main Intersection",
        "time": "Today, 12:15:44",
        "severity": "High",
        "status": "Active",
        "conf": 89.2,
        "snapshot": "/incidents/accident.jpg",
        "notes": "Multi-vehicle collision near crosswalk camera CAM-02."
    },
    {
        "id": "ALT-1043",
        "type": "Accident",
        "location": "Loading Dock A",
        "time": "Yesterday, 08:22:10",
        "severity": "Medium",
        "status": "Resolved",
        "conf": 75.0,
        "snapshot": "/incidents/accident2.jpg",
        "notes": "Forklift minor impact with barrier. Cleared by security team."
    },
    {
        "id": "ALT-1042",
        "type": "Fire",
        "location": "Cafeteria Kitchen",
        "time": "2 days ago, 19:05:00",
        "severity": "Critical",
        "status": "Resolved",
        "conf": 99.1,
        "snapshot": "/incidents/fire2.jpg",
        "notes": "Stove flare-up immediately suppressed by automatic mist."
    },
    {
        "id": "ALT-1041",
        "type": "Accident",
        "location": "Parking Lot C",
        "time": "3 days ago, 11:45:22",
        "severity": "Low",
        "status": "False Alarm",
        "conf": 45.3,
        "snapshot": "/incidents/accident3.jpg",
        "notes": "Vehicle parked closely to bollard falsely flagged."
    }
]

@router.get("/", response_model=List[AlertItem])
def get_alerts(status: Optional[str] = None, type: Optional[str] = None):
    results = _alerts_db
    if status and status != "All":
        results = [a for a in results if a["status"].lower() == status.lower()]
    if type and type != "All":
        results = [a for a in results if a["type"].lower() == type.lower()]
    return results

@router.get("/{alert_id}", response_model=AlertItem)
def get_alert_by_id(alert_id: str):
    for a in _alerts_db:
        if a["id"].upper() == alert_id.upper():
            return a
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/", response_model=AlertItem)
def create_alert(alert: AlertCreate):
    new_id = f"ALT-{1000 + len(_alerts_db) + 1}"
    current_time = datetime.datetime.now().strftime("Today, %H:%M:%S")
    
    new_item = {
        "id": new_id,
        "type": alert.type,
        "location": alert.location,
        "time": current_time,
        "severity": alert.severity,
        "status": "Active",
        "conf": alert.conf,
        "snapshot": alert.snapshot or "/incidents/fire.jpg",
        "notes": alert.notes or "Automated AI detection alert."
    }
    _alerts_db.insert(0, new_item)
    return new_item

@router.patch("/{alert_id}", response_model=AlertItem)
def update_alert(alert_id: str, update: AlertUpdate):
    for a in _alerts_db:
        if a["id"].upper() == alert_id.upper():
            if update.status:
                a["status"] = update.status
            if update.notes:
                a["notes"] = update.notes
            return a
    raise HTTPException(status_code=404, detail="Alert not found")
