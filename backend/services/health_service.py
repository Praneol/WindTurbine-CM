def calculate_health(sensor_data, prediction=None):

    vibration = sensor_data["vibration"]
    gearbox_temp = sensor_data["gearbox_temperature"]
    generator_temp = sensor_data["generator_temperature"]
    acoustic = sensor_data["acoustic_level"]

    health_score = 100

    # Vibration assessment
    if vibration >= 4.0:
        health_score -= 30
    elif vibration >= 3.5:
        health_score -= 20
    elif vibration >= 3.0:
        health_score -= 10

    # Gearbox temperature assessment
    if gearbox_temp >= 75:
        health_score -= 25
    elif gearbox_temp >= 70:
        health_score -= 15
    elif gearbox_temp >= 65:
        health_score -= 8

    # Generator temperature assessment
    if generator_temp >= 80:
        health_score -= 20
    elif generator_temp >= 75:
        health_score -= 15
    elif generator_temp >= 70:
        health_score -= 8

    # Acoustic assessment
    if acoustic >= 70:
        health_score -= 15
    elif acoustic >= 65:
        health_score -= 10
    elif acoustic >= 60:
        health_score -= 5

    health_score = max(0, min(100, health_score))

    # AI fault overrides sensor condition
    if prediction is not None:
        prediction_name = prediction.get("prediction")
        model_risk = prediction.get("risk_level")

        if prediction_name == "FAULT" or model_risk == "HIGH":
            condition = "CRITICAL"
            risk_level = "HIGH"

        # Otherwise, health score determines operational condition
        elif health_score >= 85:
            condition = "NORMAL"
            risk_level = "LOW"

        elif health_score >= 65:
            condition = "WARNING"
            risk_level = "MEDIUM"

        else:
            condition = "CRITICAL"
            risk_level = "HIGH"

    else:
        if health_score >= 85:
            condition = "NORMAL"
            risk_level = "LOW"

        elif health_score >= 65:
            condition = "WARNING"
            risk_level = "MEDIUM"

        else:
            condition = "CRITICAL"
            risk_level = "HIGH"

    return {
        "health_score": health_score,
        "condition": condition,
        "risk_level": risk_level
    }