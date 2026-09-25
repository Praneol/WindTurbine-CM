import os
import pickle
import numpy as np

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "ml",
    "models",
    "hardware_anomaly_model_100hz.pkl"
)

print("Loading 100 Hz hardware AI model...")

try:
    with open(MODEL_PATH, "rb") as file:
        model_package = pickle.load(file)

    model = model_package["model"]
    FEATURES = model_package["features"]

    print("100 Hz hardware AI model loaded successfully.")

except Exception as error:
    print("ERROR loading hardware AI model:")
    print(error)
    model = None
    FEATURES = []


def predict_hardware_condition(sensor_data):
    """
    Predict the condition of the real ESP8266 hardware.

    This model is an unsupervised anomaly detector trained
    on normal baseline hardware data.

    ANOMALY does not automatically mean mechanical failure.
    """

    if model is None:
        return {
            "prediction": "UNAVAILABLE",
            "risk_level": "UNKNOWN",
            "anomaly_score": None,
            "threshold": None,
            "model": "100 Hz Isolation Forest"
        }

    try:
        # --------------------------------------------------
        # Get hardware features
        # --------------------------------------------------

        feature_values = []

        for feature in FEATURES:

            value = sensor_data.get(feature, 0)

            try:
                value = float(value)
            except (TypeError, ValueError):
                value = 0.0

            feature_values.append(value)

        X = np.array(
            [feature_values],
            dtype=float
        )

        # --------------------------------------------------
        # Model prediction
        # --------------------------------------------------

        prediction_value = model.predict(X)[0]

        # Isolation Forest:
        # +1 = normal
        # -1 = anomaly
        if prediction_value == 1:
            prediction = "NORMAL"
        else:
            prediction = "ANOMALY"

        # --------------------------------------------------
        # Decision score
        # --------------------------------------------------

        decision_score = float(
            model.decision_function(X)[0]
        )

        # Convert decision score into a readable
        # anomaly indicator.
        #
        # Higher value = more normal
        # Lower value = more unusual
        anomaly_score = max(
            0.0,
            min(
                1.0,
                0.5 - decision_score
            )
        )

        # --------------------------------------------------
        # Risk level
        # --------------------------------------------------

        if prediction == "NORMAL":
            risk_level = "LOW"

        else:
            if anomaly_score >= 0.75:
                risk_level = "HIGH"
            elif anomaly_score >= 0.50:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

        return {
            "prediction": prediction,
            "risk_level": risk_level,
            "anomaly_score": round(
                anomaly_score,
                4
            ),
            "decision_score": round(
                decision_score,
                4
            ),
            "model": "100 Hz Isolation Forest",
            "sampling_rate_hz": 100,
            "interpretation": (
                "Anomaly indicates unusual sensor behavior "
                "relative to the normal baseline; it is not "
                "by itself a confirmed mechanical fault."
            )
        }

    except Exception as error:

        return {
            "prediction": "ERROR",
            "risk_level": "UNKNOWN",
            "anomaly_score": None,
            "model": "100 Hz Isolation Forest",
            "error": str(error)
        }