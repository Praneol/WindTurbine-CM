from fastapi import APIRouter

from services.snapshot_service import get_turbine_snapshot

router = APIRouter(
    prefix="/api/turbines",
    tags=["Turbine Monitoring"]
)


@router.get("/status")
def get_turbine_status():

    snapshot = get_turbine_snapshot()

    sensor_data = snapshot["sensor_data"]
    prediction = snapshot["prediction"]
    health = snapshot["health"]

    return {
        "turbine_id": "WT-001",
        "status": health["condition"],
        "health_score": health["health_score"],
        "risk_level": health["risk_level"],
        "operating_mode": "RUNNING",
        "prediction": prediction["prediction"],
        "confidence": prediction["confidence"],
        "sensor_data": sensor_data
    }