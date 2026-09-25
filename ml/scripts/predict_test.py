from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "random_forest_fault_model.pkl"
)


def main():
    print("Loading trained AI model...")

    model = joblib.load(MODEL_FILE)

    sample_data = pd.DataFrame([{
      "wind_speed": 8.5,
"rotor_speed": 13.2,
"vibration": 1.5,
"gearbox_temperature": 60.0,
"generator_temperature": 65.0,
"acoustic_level": 50.0,
"power_output": 2.0,  
    }])

    prediction = model.predict(sample_data)[0]
    probabilities = model.predict_proba(sample_data)[0]

    confidence = max(probabilities)

    print("\nAI prediction completed.")
    print(f"Predicted condition: {prediction}")
    print(f"Confidence: {confidence:.2%}")


if __name__ == "__main__":
    main()