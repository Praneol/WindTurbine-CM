import pandas as pd
import numpy as np
import pickle
import os

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

INPUT_FILE = "hardware_features_100hz.csv"
MODEL_DIR = "ml/models"
MODEL_FILE = os.path.join(
    MODEL_DIR,
    "hardware_anomaly_model_100hz.pkl"
)

# Features learned from the real ESP8266 hardware
FEATURES = [
    "acc_magnitude",
    "gyro_magnitude",
    "acc_variation",
    "sound_deviation",
    "vibration_rolling_std",
    "sound_rolling_std"
]

print("========================================")
print("  100 Hz HARDWARE AI MODEL TRAINING")
print("========================================")
print()

# --------------------------------------------------
# Read feature dataset
# --------------------------------------------------

print("Reading:", INPUT_FILE)

df = pd.read_csv(INPUT_FILE)

print("Rows:", len(df))
print()

# --------------------------------------------------
# Check required features
# --------------------------------------------------

missing_features = [
    feature for feature in FEATURES
    if feature not in df.columns
]

if missing_features:
    print("ERROR: Missing features:")
    for feature in missing_features:
        print("-", feature)

    input("Press Enter to exit...")
    raise SystemExit

# --------------------------------------------------
# Prepare training data
# --------------------------------------------------

X = df[FEATURES].copy()

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)

X = X.fillna(0)

print("Training features:")
for feature in FEATURES:
    print("-", feature)

print()

# --------------------------------------------------
# AI model
# --------------------------------------------------
# Isolation Forest learns the normal baseline.
#
# contamination=0.01 means approximately 1% of the
# training observations are allowed to behave as
# potential outliers.
#
# This is a prototype anomaly model, NOT a validated
# mechanical fault classifier.
# --------------------------------------------------

model = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "isolation_forest",
        IsolationForest(
            n_estimators=200,
            contamination=0.01,
            random_state=42,
            n_jobs=-1
        )
    )
])

print("Training Isolation Forest...")
print()

model.fit(X)

print("Training completed.")
print()

# --------------------------------------------------
# Calculate training anomaly scores
# --------------------------------------------------

isolation_model = model.named_steps["isolation_forest"]

raw_scores = isolation_model.decision_function(
    model.named_steps["scaler"].transform(X)
)

predictions = isolation_model.predict(
    model.named_steps["scaler"].transform(X)
)

normal_count = int(np.sum(predictions == 1))
anomaly_count = int(np.sum(predictions == -1))

print("Training samples:", len(X))
print("Normal baseline samples:", normal_count)
print("Potential outliers:", anomaly_count)
print()

# --------------------------------------------------
# Save model information
# --------------------------------------------------

model_package = {
    "model": model,
    "features": FEATURES,
    "sampling_rate_hz": 100,
    "training_samples": len(X),
    "model_type": "IsolationForest",
    "contamination": 0.01,
    "description": (
        "Hardware anomaly detection model trained on "
        "100 Hz ESP8266 MPU6050 and MAX4466 baseline data. "
        "Prototype baseline only; not a validated fault classifier."
    )
}

# Create model directory
os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

# Save model
with open(
    MODEL_FILE,
    "wb"
) as file:
    pickle.dump(
        model_package,
        file
    )

print("Model saved:")
print(MODEL_FILE)
print()

print("========================================")
print("       HARDWARE AI TRAINING DONE")
print("========================================")