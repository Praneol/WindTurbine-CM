import serial
import threading
import math
from datetime import datetime
from collections import deque

# ============================================================
# LIVE ESP8266 HARDWARE SERVICE
# ============================================================

PORT = "COM3"
BAUD_RATE = 115200

# Keep recent sensor readings
MAX_HISTORY = 5

hardware_history = deque(
    maxlen=MAX_HISTORY
)

latest_hardware_data = None

serial_thread = None
serial_connection = None


# ============================================================
# SERIAL READER
# ============================================================

def read_serial_data():

    global latest_hardware_data
    global serial_connection

    try:

        serial_connection = serial.Serial(
            PORT,
            BAUD_RATE,
            timeout=1
        )

        print("========================================")
        print(" LIVE HARDWARE SERIAL")
        print("========================================")
        print()
        print("ESP8266 connected:", PORT)
        print()

        while True:

            line = serial_connection.readline().decode(
                "utf-8",
                errors="ignore"
            ).strip()

            if not line:
                continue

            if not line.startswith("DATA,"):
                continue

            parts = line.split(",")

            if len(parts) != 9:
                continue

            # ====================================================
            # READ ESP8266 VALUES
            # ====================================================

            data = {

                "pc_timestamp": datetime.now().isoformat(),

                "esp_timestamp_ms": int(parts[1]),

                "acc_x": float(parts[2]),
                "acc_y": float(parts[3]),
                "acc_z": float(parts[4]),

                "gyro_x": float(parts[5]),
                "gyro_y": float(parts[6]),
                "gyro_z": float(parts[7]),

                "sound": int(parts[8])
            }

            # ====================================================
            # CALCULATE MAGNITUDES
            # ====================================================

            data["acc_magnitude"] = math.sqrt(
                data["acc_x"] ** 2 +
                data["acc_y"] ** 2 +
                data["acc_z"] ** 2
            )

            data["gyro_magnitude"] = math.sqrt(
                data["gyro_x"] ** 2 +
                data["gyro_y"] ** 2 +
                data["gyro_z"] ** 2
            )

            # ====================================================
            # ADD TO HISTORY
            # ====================================================

            hardware_history.append(data)

            # ====================================================
            # CALCULATE ACCELERATION VARIATION
            # ====================================================

            acc_values = [
                item["acc_magnitude"]
                for item in hardware_history
            ]

            acc_mean = sum(acc_values) / len(acc_values)

            data["acc_variation"] = abs(
                data["acc_magnitude"] - acc_mean
            )

            # ====================================================
            # CALCULATE SOUND DEVIATION
            # ====================================================

            sound_values = [
                item["sound"]
                for item in hardware_history
            ]

            sound_mean = sum(sound_values) / len(sound_values)

            data["sound_deviation"] = abs(
                data["sound"] - sound_mean
            )

            # ====================================================
            # VIBRATION ROLLING STANDARD DEVIATION
            # ====================================================

            if len(acc_values) > 1:

                acc_variance = sum(
                    (value - acc_mean) ** 2
                    for value in acc_values
                ) / (len(acc_values) - 1)

                data["vibration_rolling_std"] = math.sqrt(
                    acc_variance
                )

            else:

                data["vibration_rolling_std"] = 0.0

            # ====================================================
            # SOUND ROLLING STANDARD DEVIATION
            # ====================================================

            if len(sound_values) > 1:

                sound_variance = sum(
                    (value - sound_mean) ** 2
                    for value in sound_values
                ) / (len(sound_values) - 1)

                data["sound_rolling_std"] = math.sqrt(
                    sound_variance
                )

            else:

                data["sound_rolling_std"] = 0.0

            # ====================================================
            # UPDATE LATEST DATA
            # ====================================================

            latest_hardware_data = data

    except Exception as error:

        print()
        print("LIVE HARDWARE ERROR:")
        print(error)

        latest_hardware_data = None


# ============================================================
# START SERIAL THREAD
# ============================================================

def start_hardware_service():

    global serial_thread

    if serial_thread is not None:
        return

    serial_thread = threading.Thread(
        target=read_serial_data,
        daemon=True
    )

    serial_thread.start()


# ============================================================
# GET LATEST HARDWARE DATA
# ============================================================

def get_latest_hardware_data():

    return latest_hardware_data


# ============================================================
# GET HARDWARE HISTORY
# ============================================================

def get_hardware_history():

    return list(hardware_history)