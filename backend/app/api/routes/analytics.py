from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/summary")
def get_analytics_summary() -> Dict[str, Any]:
    return {
        "stats": [
            { "title": "Total Cameras", "value": "42", "change": "+3 this month", "status": "online" },
            { "title": "Active Alerts", "value": "2", "change": "-1 from yesterday", "status": "critical" },
            { "title": "Fire Detections", "value": "19", "change": "+4 this week", "status": "warning" },
            { "title": "Accident Detections", "value": "23", "change": "+2 this week", "status": "success" }
        ],
        "trends_7d": [
            { "name": "Mon", "Fire": 4, "Accident": 2, "Normal": 140 },
            { "name": "Tue", "Fire": 3, "Accident": 1, "Normal": 152 },
            { "name": "Wed", "Fire": 2, "Accident": 5, "Normal": 139 },
            { "name": "Thu", "Fire": 7, "Accident": 3, "Normal": 160 },
            { "name": "Fri", "Fire": 1, "Accident": 2, "Normal": 178 },
            { "name": "Sat", "Fire": 0, "Accident": 6, "Normal": 190 },
            { "name": "Sun", "Fire": 2, "Accident": 4, "Normal": 165 }
        ],
        "trends_30d": [
            { "name": "Week 1", "Fire": 12, "Accident": 15 },
            { "name": "Week 2", "Fire": 8, "Accident": 11 },
            { "name": "Week 3", "Fire": 19, "Accident": 23 },
            { "name": "Week 4", "Fire": 14, "Accident": 18 }
        ],
        "distribution": [
            { "name": "Fire", "value": 19, "color": "#F97316" },
            { "name": "Accident", "value": 23, "color": "#3B82F6" },
            { "name": "False Alarm", "value": 8, "color": "#64748B" }
        ],
        "system_health": {
            "overall": "Nominal",
            "uptime": "99.98%",
            "avg_inference_latency": "24.5ms",
            "active_nodes": 8
        }
    }
