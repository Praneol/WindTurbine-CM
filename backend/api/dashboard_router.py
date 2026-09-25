from fastapi import APIRouter

from services.snapshot_service import get_turbine_snapshot
from services.alert_service import create_alert
from services.maintenance_service import calculate_maintenance

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard Intelligence"]
)


@router.get("/snapshot")
def get_dashboard_snapshot():

    snapshot = get_turbine_snapshot()

    sensor_data = snapshot["sensor_data"]
    prediction = snapshot["prediction"]
    health = snapshot["health"]

    alert = create_alert(health)

    maintenance = calculate_maintenance(
        prediction,
        health,
        sensor_data
    )

    return {
        "turbine_id": "WT-001",

        "sensor_data": sensor_data,

        "prediction": prediction,

        "health": health,

        "alert": {
            "active": alert["severity"] != "NORMAL",
            "severity": alert["severity"],
            "risk_level": alert["risk_level"],
            "message": alert["message"],
            "acknowledged": alert["acknowledged"]
        },

        "maintenance": maintenance
    }