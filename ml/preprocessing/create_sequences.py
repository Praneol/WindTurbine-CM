import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# Configuration
# --------------------------------------------------

INPUT_FILE = "data/processed/care_dataset_0_labeled.csv"
OUTPUT_FILE = "data/processed/care_sequences.npz"

WINDOW_SIZE = 36
EXPECTED_INTERVAL_MINUTES = 10

# --------------------------------------------------
# Load dataset
# --------------------------------------------------

print("Loading labeled CARE dataset...")

df = pd.read_csv(INPUT_FILE, low_memory=False)

df["time_stamp"] = pd.to_datetime(df["time_stamp"])

# Only use the official prediction period for now.
df = (
    df[df["train_test"] == "prediction"]
    .sort_values("time_stamp")
    .reset_index(drop=True)
)

print("Prediction rows:", len(df))

# --------------------------------------------------
# Identify numeric sensor features
# --------------------------------------------------

excluded_columns = {
    "time_stamp",
    "asset_id",
    "id",
    "train_test",
    "status_type_id",
    "anomaly_label",
    "event_id",
}

feature_columns = [
    column
    for column in df.columns
    if column not in excluded_columns
    and pd.api.types.is_numeric_dtype(df[column])
]

print("Number of sensor features:", len(feature_columns))

# --------------------------------------------------
# Create continuous segments
# --------------------------------------------------

gap_minutes = (
    df["time_stamp"]
    .diff()
    .dt.total_seconds()
    .div(60)
)

df["segment_id"] = (
    gap_minutes.fillna(EXPECTED_INTERVAL_MINUTES)
    > EXPECTED_INTERVAL_MINUTES
).cumsum()

print("\nContinuous segments:")
print(
    df.groupby("segment_id")
    .agg(
        rows=("time_stamp", "size"),
        start=("time_stamp", "min"),
        end=("time_stamp", "max"),
    )
    .to_string()
)

# --------------------------------------------------
# Generate sequences
# --------------------------------------------------

X_sequences = []
y_targets = []
timestamps = []

for segment_id, segment in df.groupby("segment_id"):

    segment = segment.reset_index(drop=True)

    features = segment[feature_columns].to_numpy(dtype=np.float32)
    labels = segment["anomaly_label"].to_numpy(dtype=np.int8)
    times = segment["time_stamp"].to_numpy()

    if len(segment) < WINDOW_SIZE:
        continue

    for end in range(WINDOW_SIZE, len(segment) + 1):

        start = end - WINDOW_SIZE

        window_times = times[start:end]

        # Safety check: every reading inside the window
        # must be exactly 10 minutes apart.
        intervals = (
            pd.Series(window_times)
            .diff()
            .dt.total_seconds()
            .div(60)
            .dropna()
        )

        if not (intervals == EXPECTED_INTERVAL_MINUTES).all():
            continue

        X_sequences.append(features[start:end])

        # Target = condition at the final reading
        y_targets.append(labels[end - 1])

        timestamps.append(times[end - 1])

# --------------------------------------------------
# Convert to NumPy arrays
# --------------------------------------------------

X = np.asarray(X_sequences, dtype=np.float32)
y = np.asarray(y_targets, dtype=np.int8)
timestamps = np.asarray(timestamps)

print("\n--- SEQUENCE RESULTS ---")

print("X shape:", X.shape)
print("y shape:", y.shape)

print("\nTarget distribution:")

unique, counts = np.unique(y, return_counts=True)

for label, count in zip(unique, counts):
    name = "Normal" if label == 0 else "Anomaly"
    print(f"{label} ({name}): {count}")

print("\nExpected sequence format:")
print("(samples, 36 time steps, 81 features)")

# --------------------------------------------------
# Save
# --------------------------------------------------

Path(OUTPUT_FILE).parent.mkdir(parents=True, exist_ok=True)

np.savez_compressed(
    OUTPUT_FILE,
    X=X,
    y=y,
    timestamps=timestamps,
    feature_columns=np.asarray(feature_columns),
)

print("\nSequences saved to:")
print(Path(OUTPUT_FILE).resolve())

print("\nSTEP 12 COMPLETE")