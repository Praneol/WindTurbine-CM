
from services.sensor_service import generate_sensor_data
from services.hardware_prediction_service import predict_hardware_condition
from services.health_service import calculate_health


sensor_history = []


def get_turbine_snapshot():

    sensor_data = generate_sensor_data()

    # Store sensor reading for dashboard graphs
    sensor_history.insert(0, sensor_data)

    if len(sensor_history) > 100:
        sensor_history.pop()

    prediction = predict_hardware_condition(sensor_data)

    health = calculate_health(
        sensor_data,
        prediction
    )

    return {
        "sensor_data": sensor_data,
        "prediction": prediction,
        "health": health
    }


def get_sensor_history():

    return sensor_history

