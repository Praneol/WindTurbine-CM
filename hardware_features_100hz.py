import pandas as pd
import numpy as np

INPUT_FILE = "hardware_sensor_data_100hz.csv"
OUTPUT_FILE = "hardware_features_100hz.csv"

print("========================================")
print("  100 Hz HARDWARE FEATURE EXTRACTION")
print("========================================")
print()

print("Reading:", INPUT_FILE)

df = pd.read_csv(INPUT_FILE)

print("Rows:", len(df))
print("Columns:", len(df.columns))
print()

# --------------------------------------------------
# 1. Acceleration magnitude
# --------------------------------------------------

df["acc_magnitude"] = np.sqrt(
    df["acc_x"] ** 2 +
    df["acc_y"] ** 2 +
    df["acc_z"] ** 2
)

# --------------------------------------------------
# 2. Gyroscope magnitude
# --------------------------------------------------

df["gyro_magnitude"] = np.sqrt(
    df["gyro_x"] ** 2 +
    df["gyro_y"] ** 2 +
    df["gyro_z"] ** 2
)

# --------------------------------------------------
# 3. Acceleration variation
# --------------------------------------------------

df["acc_variation"] = df["acc_magnitude"].diff().abs()

df["acc_variation"] = df["acc_variation"].fillna(0)

# --------------------------------------------------
# 4. Sound deviation
# --------------------------------------------------

sound_mean = df["sound"].rolling(
    window=100,
    min_periods=1
).mean()

df["sound_deviation"] = (
    df["sound"] - sound_mean
).abs()

# --------------------------------------------------
# 5. Vibration rolling standard deviation
# --------------------------------------------------

df["vibration_rolling_std"] = (
    df["acc_magnitude"]
    .rolling(
        window=100,
        min_periods=1
    )
    .std()
    .fillna(0)
)

# --------------------------------------------------
# 6. Sound rolling standard deviation
# --------------------------------------------------

df["sound_rolling_std"] = (
    df["sound"]
    .rolling(
        window=100,
        min_periods=1
    )
    .std()
    .fillna(0)
)

# --------------------------------------------------
# Remove invalid values
# --------------------------------------------------

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.fillna(0)

# --------------------------------------------------
# Save feature dataset
# --------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Feature extraction completed.")
print()

print("Output file:", OUTPUT_FILE)
print("Rows:", len(df))
print("Columns:", len(df.columns))
print()

print("New features:")
print("1. acc_magnitude")
print("2. gyro_magnitude")
print("3. acc_variation")
print("4. sound_deviation")
print("5. vibration_rolling_std")
print("6. sound_rolling_std")
print()

print("========================================")
print("       FEATURE EXTRACTION DONE")
print("========================================")