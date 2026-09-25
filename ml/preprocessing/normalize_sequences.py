import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
import joblib

DATA_DIR = Path("data/processed")
MODEL_DIR = Path("ml/models")

print("Loading training sequences...")

train_data = np.load(DATA_DIR / "care_train_sequences.npz")

X_train = train_data["X"]

print("Training shape:", X_train.shape)

# Flatten all time steps so the scaler learns statistics for each sensor
X_train_2d = X_train.reshape(-1, X_train.shape[-1])

print("Fitting StandardScaler...")

scaler = StandardScaler()
scaler.fit(X_train_2d)

# Save scaler
scaler_file = MODEL_DIR / "care_standard_scaler.pkl"
joblib.dump(scaler, scaler_file)

print("Scaler saved:", scaler_file.resolve())

print("STEP 19 COMPLETE")