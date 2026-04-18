from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, accident, fire

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(accident.router, prefix="/accidentmodel", tags=["Accident Detection"])
app.include_router(fire.router, prefix="/firemodel", tags=["Fire Detection"])

@app.get("/")
def root():
    return {"message": "Welcome to the Admin Panel Backend API"}
