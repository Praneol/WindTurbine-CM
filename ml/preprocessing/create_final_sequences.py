import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# Configuration
# --------------------------------------------------

INPUT_FILE = "data/processed/care_dataset_0_labeled.csv"
OUTPUT_DIR = Path("data/processed")

WINDOW_SIZE = 36
EXPECTED_INTERVAL_MINUTES = 10

VALIDATION_START = pd.Timestamp("2023-06-01 00:00:00")
VALIDATION_END = pd.Timestamp("2023-06-25 23:59:59")

# --------------------------------------------------
# Load data
# --------------------------------------------------

print("Loading labeled CARE dataset...")

df = pd.read_csv(INPUT_FILE, low_memory=False)
df["time_stamp"] = pd.to_datetime(df["time_stamp"])

df = df.sort_values("time_stamp").reset_index(drop=True)

# --------------------------------------------------
# Select numeric sensor features
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

print("Sensor features:", len(feature_columns))

# --------------------------------------------------
# Split raw data
# --------------------------------------------------

train_raw = df[
    (df["train_test"] == "train")
    & ~(
        (df["time_stamp"] >= VALIDATION_START)
        & (df["time_stamp"] <= VALIDATION_END)
    )
].copy()

validation_raw = df[
    (df["train_test"] == "train")
    & (df["time_stamp"] >= VALIDATION_START)
    & (df["time_stamp"] <= VALIDATION_END)
].copy()

test_raw = df[df["train_test"] == "prediction"].copy()

datasets = {
    "train": train_raw,
    "validation": validation_raw,
    "test": test_raw,
}

# --------------------------------------------------
# Sequence generation function
# --------------------------------------------------

def create_sequences(data, dataset_name):

    data = data.sort_values("time_stamp").reset_index(drop=True)

    gap_minutes = (
        data["time_stamp"]
        .diff()
        .dt.total_seconds()
        .div(60)
    )

    data["segment_id"] = (
        gap_minutes.fillna(EXPECTED_INTERVAL_MINUTES)
        > EXPECTED_INTERVAL_MINUTES
    ).cumsum()

    X_sequences = []
    y_targets = []
    timestamps = []

    for segment_id, segment in data.groupby("segment_id"):

        segment = segment.reset_index(drop=True)

        features = segment[feature_columns].to_numpy(
            dtype=np.float32
        )

        labels = segment["anomaly_label"].to_numpy(
            dtype=np.int8
        )

        times = segment["time_stamp"].to_numpy()

        if len(segment) < WINDOW_SIZE:
            continue

        for end in range(WINDOW_SIZE, len(segment) + 1):

            start = end - WINDOW_SIZE

            window_times = times[start:end]

            intervals = (
                pd.Series(window_times)
                .diff()
                .dt.total_seconds()
                .div(60)
                .dropna()
            )

            if not (
                intervals == EXPECTED_INTERVAL_MINUTES
            ).all():
                continue

            X_sequences.append(features[start:end])
            y_targets.append(labels[end - 1])
            timestamps.append(times[end - 1])

    X = np.asarray(X_sequences, dtype=np.float32)
    y = np.asarray(y_targets, dtype=np.int8)
    timestamps = np.asarray(timestamps)

    output_file = OUTPUT_DIR / f"care_{dataset_name}_sequences.npz"

    np.savez_compressed(
        output_file,
        X=X,
        y=y,
        timestamps=timestamps,
        feature_columns=np.asarray(feature_columns),
    )

    print(f"\n--- {dataset_name.upper()} ---")
    print("Raw rows:", len(data))
    print("Sequences:", len(X))
    print("X shape:", X.shape)
    print("y shape:", y.shape)

    if len(y) > 0:
        unique, counts = np.unique(y, return_counts=True)

        for label, count in zip(unique, counts):
            name = "Normal" if label == 0 else "Anomaly"
            print(f"{label} ({name}): {count}")

        print(
            "Anomaly percentage:",
            round(float(y.mean() * 100), 2),
            "%"
        )

    print("Saved:", output_file.resolve())


# --------------------------------------------------
# Generate all datasets
# --------------------------------------------------

for dataset_name, dataset in datasets.items():
    create_sequences(dataset, dataset_name)

print("\nSTEP 18 COMPLETE")