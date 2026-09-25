import pandas as pd
import time
import math
import urllib.request
import json

CSV_FILE = r"C:\Users\Srinivas ND\WindTurbine-CM\hardware_sensor_data_100hz.csv"

API_URL = "http://127.0.0.1:8000/api/replay/hardware"

df = pd.read_csv(CSV_FILE)

print("===================================")
print("AERION TEMPORARY HARDWARE REPLAY")
print("===================================")
print(f"Total rows: {len(df)}")
print("Starting from ROW 1")
print("Replay speed: 100 Hz")
print("===================================")

previous_acc = None

try:
    for index, row in df.iterrows():

        acc_x = float(row["acc_x"])
        acc_y = float(row["acc_y"])
        acc_z = float(row["acc_z"])

        gyro_x = float(row["gyro_x"])
        gyro_y = float(row["gyro_y"])
        gyro_z = float(row["gyro_z"])

        sound = float(row["sound"])

        acc_magnitude = math.sqrt(
            acc_x**2 + acc_y**2 + acc_z**2
        )

        gyro_magnitude = math.sqrt(
            gyro_x**2 + gyro_y**2 + gyro_z**2
        )

        acc_variation = 0.0

        if previous_acc is not None:
            acc_variation = abs(
                acc_magnitude - previous_acc
            )

        previous_acc = acc_magnitude

        data = {
            "turbine_id": "WT-001",
            "session_id": str(row["session_id"]),
            "pc_timestamp": str(row["pc_timestamp"]),
            "esp_timestamp_ms": int(row["esp_timestamp_ms"]),

            "acc_x": acc_x,
            "acc_y": acc_y,
            "acc_z": acc_z,

            "gyro_x": gyro_x,
            "gyro_y": gyro_y,
            "gyro_z": gyro_z,

            "sound": sound,

            "acc_magnitude": acc_magnitude,
            "gyro_magnitude": gyro_magnitude,
            "acc_variation": acc_variation,

            "sound_deviation": 0.0,
            "vibration_rolling_std": 0.0,
            "sound_rolling_std": 0.0,

            "source": "temporary_csv_replay",
            "replay_row": index + 1
        }

        payload = json.dumps(data).encode("utf-8")

        request = urllib.request.Request(
            API_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            urllib.request.urlopen(request, timeout=2).read()
        except Exception as e:
            print(f"Backend connection error at row {index + 1}: {e}")
            break

        if index % 100 == 0:
            print(
                f"Row {index + 1}/{len(df)} | "
                f"ACC={acc_magnitude:.3f} | "
                f"GYRO={gyro_magnitude:.4f} | "
                f"SOUND={sound:.0f}"
            )

        time.sleep(0.01)

except KeyboardInterrupt:
    print("\nReplay stopped.")

print("Replay finished.")