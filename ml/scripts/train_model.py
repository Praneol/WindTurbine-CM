from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "care"
    / "simulated_sensor_data.csv"
)

MODEL_DIR = PROJECT_ROOT / "ml" / "models"
MODEL_FILE = MODEL_DIR / "random_forest_fault_model.pkl"


def main():
    print("Loading dataset...")

    df = pd.read_csv(DATA_FILE)

    features = [
        "wind_speed",
        "rotor_speed",
        "vibration",
        "gearbox_temperature",
        "generator_temperature",
        "acoustic_level",
        "power_output",
    ]

    X = df[features]
    y = df["status"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    print("Training Random Forest model...")

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        class_weight="balanced",
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print("\nModel training completed.")
    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification report:")
    print(classification_report(y_test, predictions))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_FILE)

    print(f"Model saved to: {MODEL_FILE}")


if __name__ == "__main__":
    main()