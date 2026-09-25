from fastapi import APIRouter

from services.snapshot_service import (
    get_turbine_snapshot,
    get_sensor_history
)

router = APIRouter(
    prefix="/api/sensors",
    tags=["Sensor Monitoring"]
)


@router.get("/latest")
def get_latest_sensor_data():

    snapshot = get_turbine_snapshot()

    return snapshot["sensor_data"]


@router.get("/history")
def get_sensor_history_data():

    return get_sensor_history()