import pandas as pd
import numpy as np


INPUT_FILE = "hardware_sensor_data.csv"
OUTPUT_FILE = "hardware_features.csv"


# Load hardware sensor data
df = pd.read_csv(INPUT_FILE)


# Convert sensor columns to numeric values
sensor_columns = [
    "acc_x",
    "acc_y",
    "acc_z",
    "gyro_x",
    "gyro_y",
    "gyro_z",
    "sound"
]

for column in sensor_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")


# Remove invalid rows
df = df.dropna(subset=sensor_columns)


# Acceleration magnitude
df["acc_magnitude"] = np.sqrt(
    df["acc_x"] ** 2 +
    df["acc_y"] ** 2 +
    df["acc_z"] ** 2
)


# Gyroscope magnitude
df["gyro_magnitude"] = np.sqrt(
    df["gyro_x"] ** 2 +
    df["gyro_y"] ** 2 +
    df["gyro_z"] ** 2
)


# Acceleration variation from the mean
df["acc_variation"] = (
    df["acc_magnitude"] - df["acc_magnitude"].mean()
).abs()


# Sound deviation from normal average
df["sound_deviation"] = (
    df["sound"] - df["sound"].mean()
).abs()


# Rolling vibration feature
df["vibration_rolling_std"] = (
    df["acc_magnitude"]
    .rolling(window=5, min_periods=1)
    .std()
    .fillna(0)
)


# Rolling sound variation
df["sound_rolling_std"] = (
    df["sound"]
    .rolling(window=5, min_periods=1)
    .std()
    .fillna(0)
)


# Select final hardware features
feature_columns = [
    "acc_magnitude",
    "gyro_magnitude",
    "acc_variation",
    "sound_deviation",
    "vibration_rolling_std",
    "sound_rolling_std"
]


features = df[
    [
        "pc_timestamp",
        "esp_timestamp_ms",
        "acc_x",
        "acc_y",
        "acc_z",
        "gyro_x",
        "gyro_y",
        "gyro_z",
        "sound"
    ]
    + feature_columns
]


# Save processed hardware dataset
features.to_csv(OUTPUT_FILE, index=False)


print("========================================")
print(" HARDWARE FEATURE EXTRACTION")
print("========================================")
print()
print("Input file:", INPUT_FILE)
print("Output file:", OUTPUT_FILE)
print("Rows processed:", len(features))
print()
print("Hardware features:")
for feature in feature_columns:
    print("-", feature)

print()
print("Feature statistics:")
print(features[feature_columns].describe())

print()
print("========================================")
print("FEATURE EXTRACTION COMPLETE")
print("========================================")