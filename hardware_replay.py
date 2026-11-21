import pandas as pd
import time
import math
import urllib.request
import json

CSV_FILE = r"C:\Users\Srinivas ND\WindTurbine-CM\hardware_sensor_data_100hz.csv"

API_URL = "http://127.0.0.1:8000/api/replay/hardware"

df = pd.read_csv(CSV_FILE)

print("===================================")
print("AERION HARDWARE DATASET REPLAY")
print("===================================")
print(f"Total rows: {len(df)}")
print("Starting from ROW 1")
print("Replay speed: 100 Hz")
print("Features: SAME AS TRAINING PIPELINE")
print("===================================")

# Previous acceleration magnitude
previous_acc = None

# Rolling history
sound_history = []
acc_history = []

try:

    for index, row in df.iterrows():

        # --------------------------------------------------
        # RAW SENSOR VALUES
        # --------------------------------------------------

        acc_x = float(row["acc_x"])
        acc_y = float(row["acc_y"])
        acc_z = float(row["acc_z"])

        gyro_x = float(row["gyro_x"])
        gyro_y = float(row["gyro_y"])
        gyro_z = float(row["gyro_z"])

        sound = float(row["sound"])

        # --------------------------------------------------
        # 1. ACCELERATION MAGNITUDE
        # --------------------------------------------------

        acc_magnitude = math.sqrt(
            acc_x**2 +
            acc_y**2 +
            acc_z**2
        )

        # --------------------------------------------------
        # 2. GYROSCOPE MAGNITUDE
        # --------------------------------------------------

        gyro_magnitude = math.sqrt(
            gyro_x**2 +
            gyro_y**2 +
            gyro_z**2
        )

        # --------------------------------------------------
        # 3. ACCELERATION VARIATION
        # SAME AS TRAINING
        # --------------------------------------------------

        if previous_acc is None:
            acc_variation = 0.0
        else:
            acc_variation = abs(
                acc_magnitude - previous_acc
            )

        previous_acc = acc_magnitude

        # --------------------------------------------------
        # UPDATE ACCELERATION HISTORY
        # --------------------------------------------------

        acc_history.append(acc_magnitude)

        if len(acc_history) > 100:
            acc_history.pop(0)

        # --------------------------------------------------
        # UPDATE SOUND HISTORY
        # --------------------------------------------------

        sound_history.append(sound)

        if len(sound_history) > 100:
            sound_history.pop(0)

        # --------------------------------------------------
        # 4. SOUND DEVIATION
        # SAME AS TRAINING
        # rolling(window=100, min_periods=1).mean()
        # --------------------------------------------------

        sound_mean = sum(sound_history) / len(sound_history)

        sound_deviation = abs(
            sound - sound_mean
        )

        # --------------------------------------------------
        # 5. VIBRATION ROLLING STANDARD DEVIATION
        # SAME AS TRAINING
        # --------------------------------------------------

        if len(acc_history) > 1:
            acc_mean = sum(acc_history) / len(acc_history)

            variance = sum(
                (x - acc_mean) ** 2
                for x in acc_history
            ) / (len(acc_history) - 1)

            vibration_rolling_std = math.sqrt(
                variance
            )
        else:
            vibration_rolling_std = 0.0

        # --------------------------------------------------
        # 6. SOUND ROLLING STANDARD DEVIATION
        # SAME AS TRAINING
        # --------------------------------------------------

        if len(sound_history) > 1:
            sound_mean = sum(sound_history) / len(sound_history)

            variance = sum(
                (x - sound_mean) ** 2
                for x in sound_history
            ) / (len(sound_history) - 1)

            sound_rolling_std = math.sqrt(
                variance
            )
        else:
            sound_rolling_std = 0.0

        # --------------------------------------------------
        # DATA SENT TO BACKEND
        # --------------------------------------------------

        data = {

            "turbine_id": "WT-001",

            "session_id": str(
                row["session_id"]
            ),

            "pc_timestamp": str(
                row["pc_timestamp"]
            ),

            "esp_timestamp_ms": int(
                row["esp_timestamp_ms"]
            ),

            # RAW ACCELERATION
            "acc_x": acc_x,
            "acc_y": acc_y,
            "acc_z": acc_z,

            # RAW GYROSCOPE
            "gyro_x": gyro_x,
            "gyro_y": gyro_y,
            "gyro_z": gyro_z,

            # RAW ACOUSTIC
            "sound": sound,

            # AI FEATURES
            "acc_magnitude": acc_magnitude,
            "gyro_magnitude": gyro_magnitude,
            "acc_variation": acc_variation,
            "sound_deviation": sound_deviation,
            "vibration_rolling_std": vibration_rolling_std,
            "sound_rolling_std": sound_rolling_std,

            # SOURCE INFORMATION
            "source": "dataset_replay",
            "replay_row": index + 1
        }

        # --------------------------------------------------
        # SEND TO FASTAPI
        # --------------------------------------------------

        payload = json.dumps(
            data
        ).encode("utf-8")

        request = urllib.request.Request(
            API_URL,
            data=payload,
            headers={
                "Content-Type": "application/json"
            },
            method="POST"
        )

        try:

            urllib.request.urlopen(
                request,
                timeout=2
            ).read()

        except Exception as e:

            print(
                f"Backend connection error "
                f"at row {index + 1}: {e}"
            )

            break

        # --------------------------------------------------
        # DISPLAY PROGRESS
        # --------------------------------------------------

        if index % 100 == 0:

            print(
                f"Row {index + 1}/{len(df)} | "
                f"ACC={acc_magnitude:.3f} | "
                f"GYRO={gyro_magnitude:.4f} | "
                f"SOUND={sound:.0f} | "
                f"VIB_STD={vibration_rolling_std:.4f} | "
                f"SOUND_STD={sound_rolling_std:.2f}"
            )

        # --------------------------------------------------
        # 100 Hz = 0.01 SECOND
        # --------------------------------------------------

        time.sleep(0.01)

except KeyboardInterrupt:

    print()
    print("Replay stopped by user.")

print()
print("===================================")
print("DATASET REPLAY FINISHED")
print("===================================")