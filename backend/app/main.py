# Apply protobuf runtime patch before imports
try:
    import google.protobuf.runtime_version as rv
    rv.ValidateProtobufRuntimeVersion = lambda *args, **kwargs: None
except Exception:
    pass

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.routes import auth, accident, fire, alerts, cameras, analytics

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Robust CORS Configuration: Allow all origins and pattern-match cloud domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://emergi-sensei-frontend.onrender.com",
        "https://frontend-sigma-three-ydmjinndgp.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "*"
    ],
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global error handlers ensuring CORS headers are ALWAYS returned even on failure
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin") or "*"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "Error"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def custom_global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin") or "*"
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "status": "Error"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(accident.router, prefix="/accidentmodel", tags=["Accident Detection"])
app.include_router(fire.router, prefix="/firemodel", tags=["Fire Detection"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts Management"])
app.include_router(cameras.router, prefix="/cameras", tags=["CCTV Cameras"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "app": "Emergi-Sensei AI Surveillance Backend",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "engine": "running"}
