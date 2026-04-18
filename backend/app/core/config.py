from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Admin Panel Backend"
    API_V1_STR: str = "/api/v1"
    
    # CORS setup (allowing frontend localhost port)
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # API Keys
    GEMINI_API_KEY: str = "AIzaSyC55mceTCgmxVdFEzYbs1cxBXUhj3m7K8g"

    class Config:
        case_sensitive = True

settings = Settings()
