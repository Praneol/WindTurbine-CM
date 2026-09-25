from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "final_sensor_detector.pkl"
)


model = joblib.load(MODEL_FILE)

FEATURES = model["features"]
BASELINE = model["baseline"]
STD = model["std"]
THRESHOLD = model["threshold"]


def predict_turbine_condition(sensor_data):

    input_data = pd.DataFrame([{
        feature: float(sensor_data[feature])
        for feature in FEATURES
    }])

    score = (
        ((input_data[FEATURES] - BASELINE) / STD)
        .abs()
        .mean(axis=1)
        .iloc[0]
    )

    if score > THRESHOLD:
        prediction = "FAULT"
        risk_level = "HIGH"
    else:
        prediction = "NORMAL"
        risk_level = "LOW"

    confidence = min(score / THRESHOLD, 1.0)

    return {
        "prediction": prediction,
        "risk_level": risk_level,
        "confidence": round(float(confidence), 4),
        "anomaly_score": round(float(score), 2),
    }