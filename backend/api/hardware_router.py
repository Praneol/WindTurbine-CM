from fastapi import APIRouter, HTTPException

from services.live_hardware_service import (
    start_hardware_service,
    get_latest_hardware_data
)

from services.hardware_prediction_service import (
    predict_hardware_condition
)

from services.maintenance_service import (
    evaluate_maintenance,
    get_maintenance_history
)

router = APIRouter(
    prefix="/api/hardware",
    tags=["Hardware AI"]
)


@router.get("/latest")
def get_latest_hardware():
    data = get_latest_hardware_data()

    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Waiting for ESP8266 hardware data"
        )

    return {
        "turbine_id": "WT-001",
        "sensor_data": data
    }


@router.get("/prediction")
def get_hardware_prediction():
    data = get_latest_hardware_data()

    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Waiting for ESP8266 hardware data"
        )

    result = predict_hardware_condition(data)
    maintenance = evaluate_maintenance(result)

    return {
        "turbine_id": "WT-001",
        "hardware_ai": result,
        "maintenance": maintenance,
        "sensor_data": data
    }


@router.get("/maintenance")
def get_hardware_maintenance():
    data = get_latest_hardware_data()

    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Waiting for ESP8266 hardware data"
        )

    result = predict_hardware_condition(data)
    maintenance = evaluate_maintenance(result)

    return {
        "turbine_id": "WT-001",
        "maintenance": maintenance,
        "hardware_ai": result,
        "sensor_data": data,
        "recent_history": get_maintenance_history()
    }





@router.get("/test-anomaly")
def test_anomaly():

    data = get_latest_hardware_data()

    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Waiting for ESP8266 hardware data"
        )

    test_data = data.copy()

    # Explicit abnormal feature values for safe software simulation.
    test_data["acc_magnitude"] = 25.0
    test_data["gyro_magnitude"] = 2.0
    test_data["acc_variation"] = 5.0
    test_data["sound_deviation"] = 100.0
    test_data["vibration_rolling_std"] = 5.0
    test_data["sound_rolling_std"] = 50.0

    result = predict_hardware_condition(test_data)
    maintenance = evaluate_maintenance(result)

    return {
        "turbine_id": "WT-001",
        "test_mode": True,
        "message": "Safe simulated anomaly test. Physical hardware values were not modified.",
        "hardware_ai": result,
        "maintenance": maintenance,
        "sensor_data": test_data
    }



start_hardware_service()

