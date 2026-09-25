from pathlib import Path
import random
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = PROJECT_ROOT / "ml" / "data" / "processed" / "care"
OUTPUT_FILE = OUTPUT_DIR / "simulated_sensor_data.csv"


def generate_data(rows=2000):
    data = []

    for i in range(rows):
        vibration = round(random.uniform(1.0, 4.5), 2)
        gearbox_temperature = round(random.uniform(55.0, 85.0), 2)
        generator_temperature = round(random.uniform(60.0, 90.0), 2)
        acoustic_level = round(random.uniform(45.0, 75.0), 2)

        if (
            vibration >= 4.0
            or gearbox_temperature >= 80
            or generator_temperature >= 85
            or acoustic_level >= 70
        ):
            status = "FAULT"
        else:
            status = "NORMAL"

        data.append({
            "timestamp": i,
            "turbine_id": "WT-001",
            "wind_speed": round(random.uniform(4.0, 14.0), 2),
            "rotor_speed": round(random.uniform(8.0, 20.0), 2),
            "vibration": vibration,
            "gearbox_temperature": gearbox_temperature,
            "generator_temperature": generator_temperature,
            "acoustic_level": acoustic_level,
            "power_output": round(random.uniform(0.5, 3.0), 2),
            "status": status
        })

    return pd.DataFrame(data)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = generate_data()
    df.to_csv(OUTPUT_FILE, index=False)

    print("Simulated dataset created successfully.")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()