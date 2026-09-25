import pandas as pd
import joblib

MODEL_PATH = "ml/models/final_sensor_detector.pkl"

model = joblib.load(MODEL_PATH)

FEATURES = model["features"]
BASELINE = model["baseline"]
STD = model["std"]
THRESHOLD = model["threshold"]

data = {}

print()
print("======================================")
print("   WIND TURBINE CONDITION MONITORING")
print("======================================")
print()

for i, feature in enumerate(FEATURES, 1):
    print(f"[{i}/10] Sensor: {feature}")
    value = float(input("Enter value: "))
    data[feature] = value
    print()

df = pd.DataFrame([data])

score = (((df[FEATURES] - BASELINE) / STD).abs()).mean(axis=1).iloc[0]

if score > THRESHOLD:
    status = "ANOMALY"
else:
    status = "NORMAL"

print("======================================")
print("RESULT")
print("======================================")
print("Anomaly Score:", round(score, 2))
print("Threshold:", THRESHOLD)
print("Condition:", status)
print("======================================")