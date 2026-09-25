import pandas as pd
import numpy as np
import joblib
from pathlib import Path


# ============================================================
# HARDWARE AI MODEL
# ============================================================

INPUT_FILE = "hardware_features.csv"

MODEL_DIR = Path("ml/models")

MODEL_FILE = MODEL_DIR / "hardware_anomaly_model.pkl"


# ============================================================
# LOAD HARDWARE DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)


# ============================================================
# HARDWARE FEATURES
# ============================================================

FEATURES = [
    "acc_magnitude",
    "gyro_magnitude",
    "acc_variation",
    "sound_deviation",
    "vibration_rolling_std",
    "sound_rolling_std"
]


# ============================================================
# CONVERT FEATURES TO NUMERIC
# ============================================================

for feature in FEATURES:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# ============================================================
# REMOVE INVALID DATA
# ============================================================

df = df.dropna(
    subset=FEATURES
).reset_index(drop=True)


# ============================================================
# CALCULATE NORMAL BASELINE
# ============================================================

baseline = df[FEATURES].mean()


# ============================================================
# CALCULATE STANDARD DEVIATION
# ============================================================

std = df[FEATURES].std()


# Prevent division by zero

std = std.replace(
    0,
    0.000001
)


# ============================================================
# CALCULATE NORMALIZED ANOMALY SCORE
# ============================================================

normalized_deviation = (
    (df[FEATURES] - baseline) / std
).abs()


# ============================================================
# FINAL ANOMALY SCORE
# ============================================================

df["anomaly_score"] = (
    normalized_deviation.mean(axis=1)
)


# ============================================================
# CALCULATE THRESHOLD
# ============================================================

score_mean = df["anomaly_score"].mean()

score_std = df["anomaly_score"].std()

threshold = float(
    score_mean + (3 * score_std)
)


# Keep minimum threshold

if threshold < 2.0:

    threshold = 2.0


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# MODEL INFORMATION
# ============================================================

model_data = {

    "features": FEATURES,

    "baseline": baseline.to_dict(),

    "std": std.to_dict(),

    "threshold": threshold

}


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model_data,
    MODEL_FILE
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print()
print("========================================")
print("       HARDWARE AI MODEL")
print("========================================")
print()

print("Input file:")
print(INPUT_FILE)

print()

print("Rows used:")
print(len(df))

print()

print("Features used:")

for feature in FEATURES:

    print(" -", feature)


print()

print("========================================")
print("          NORMAL BASELINE")
print("========================================")
print()

for feature in FEATURES:

    print(
        feature,
        "=",
        round(
            float(baseline[feature]),
            6
        )
    )


print()

print("========================================")
print("          MODEL THRESHOLD")
print("========================================")
print()

print(
    "Average anomaly score:",
    round(float(score_mean), 6)
)

print(
    "Anomaly score std:",
    round(float(score_std), 6)
)

print(
    "Threshold:",
    round(float(threshold), 6)
)


print()

print("========================================")
print("        ANOMALY SCORE RANGE")
print("========================================")
print()

print(
    "Minimum:",
    round(
        float(df["anomaly_score"].min()),
        6
    )
)

print(
    "Maximum:",
    round(
        float(df["anomaly_score"].max()),
        6
    )
)


print()

print("========================================")
print("           MODEL SAVED")
print("========================================")
print()

print(
    "Model file:",
    MODEL_FILE
)

print()

print("========================================")
print("     HARDWARE AI MODEL READY")
print("========================================")
print()