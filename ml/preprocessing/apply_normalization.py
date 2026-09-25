import numpy as np
from pathlib import Path
import joblib

DATA_DIR = Path("data/processed")
MODEL_DIR = Path("ml/models")

SCALER_FILE = MODEL_DIR / "care_standard_scaler.pkl"

print("Loading scaler...")
scaler = joblib.load(SCALER_FILE)

datasets = ["train", "validation", "test"]

for dataset_name in datasets:
    print(f"\nLoading {dataset_name} sequences...")

    input_file = DATA_DIR / f"care_{dataset_name}_sequences.npz"
    output_file = DATA_DIR / f"care_{dataset_name}_normalized.npz"

    data = np.load(input_file)

    X = data["X"]
    y = data["y"]
    timestamps = data["timestamps"]
    feature_columns = data["feature_columns"]

    print("Original shape:", X.shape)

    # Reshape for scaling
    X_2d = X.reshape(-1, X.shape[-1])

    # Apply the training scaler
    X_scaled = scaler.transform(X_2d)

    # Restore sequence shape
    X_scaled = X_scaled.reshape(X.shape).astype(np.float32)

    np.savez_compressed(
        output_file,
        X=X_scaled,
        y=y,
        timestamps=timestamps,
        feature_columns=feature_columns,
    )

    print("Normalized shape:", X_scaled.shape)
    print("Saved:", output_file.resolve())

print("\nSTEP 20 COMPLETE")