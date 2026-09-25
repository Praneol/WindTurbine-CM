from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.turbines.router import router as turbine_router
from api.sensors.router import router as sensor_router
from api.alerts.router import router as alert_router
from api.predictions.router import router as prediction_router
from api.dashboard_router import router as dashboard_router
from api.hardware_router import router as hardware_router
from api.replay_router import router as replay_router

app = FastAPI(
    title="Wind Turbine Condition Monitoring AI",
    description="AI-powered wind turbine condition monitoring and predictive maintenance platform",
    version="1.0.0"
)


# =========================================================
# CORS configuration
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API routers
# =========================================================

app.include_router(turbine_router)
app.include_router(sensor_router)
app.include_router(alert_router)
app.include_router(prediction_router)
app.include_router(dashboard_router)
app.include_router(hardware_router)
app.include_router(replay_router)

# =========================================================
# Root endpoint
# =========================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Wind Turbine Condition Monitoring AI"
    }