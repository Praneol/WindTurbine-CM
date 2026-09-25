from fastapi import APIRouter
from services.snapshot_service import get_turbine_snapshot

router = APIRouter(
    prefix="/api/predictions",
    tags=["AI Predictions"]
)


@router.get("/latest")
def get_latest_prediction():

    snapshot = get_turbine_snapshot()

    prediction = snapshot["prediction"]

    return {
        "turbine_id": "WT-001",
        "prediction": prediction["prediction"],
        "risk_level": prediction["risk_level"],
        "confidence": prediction["confidence"],
        "anomaly_score": prediction["anomaly_score"],
        "sensor_data": snapshot["sensor_data"]
    }