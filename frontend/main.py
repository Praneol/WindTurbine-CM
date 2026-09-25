from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.turbines.router import router as turbine_router
from api.sensors.router import router as sensor_router

app = FastAPI(
    title="Wind Turbine Condition Monitoring AI",
    description="AI-powered wind turbine condition monitoring and predictive maintenance platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(turbine_router)
app.include_router(sensor_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Wind Turbine Condition Monitoring AI"
    }