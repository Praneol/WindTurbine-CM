from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "random_forest_fault_model.pkl"
)


def predict_turbine_condition(sensor_data):
    model = joblib.load(MODEL_FILE)

    features = [
        "wind_speed",
        "rotor_speed",
        "vibration",
        "gearbox_temperature",
        "generator_temperature",
        "acoustic_level",
        "power_output",
    ]

    input_data = pd.DataFrame([{
        feature: sensor_data[feature]
        for feature in features
    }])

    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]

    confidence = float(max(probabilities))

    if prediction == "FAULT":
        risk_level = "HIGH"
    else:
        risk_level = "LOW"

    return {
        "prediction": prediction,
        "risk_level": risk_level,
        "confidence": round(confidence, 4),
    }