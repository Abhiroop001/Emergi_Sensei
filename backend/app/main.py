# Apply protobuf runtime patch before imports
try:
    import google.protobuf.runtime_version as rv
    rv.ValidateProtobufRuntimeVersion = lambda *args, **kwargs: None
except Exception:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, accident, fire, alerts, cameras, analytics

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Allow all local origins during development
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(accident.router, prefix="/accidentmodel", tags=["Accident Detection"])
app.include_router(fire.router, prefix="/firemodel", tags=["Fire Detection"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts Management"])
app.include_router(cameras.router, prefix="/cameras", tags=["CCTV Cameras"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {
        "app": "Emergi-Sensei AI Surveillance Backend",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine": "running"}

