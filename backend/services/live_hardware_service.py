import serial
import threading
import math
from datetime import datetime
from collections import deque

# ============================================================
# AERION LIVE HARDWARE SERVICE
# ============================================================

PORT = "COM3"
BAUD_RATE = 115200

MAX_HISTORY = 100

hardware_history = deque(maxlen=MAX_HISTORY)

latest_hardware_data = None

serial_thread = None
serial_connection = None


# ============================================================
# UPDATE SHARED HARDWARE DATA
# ============================================================

def update_hardware_data(data):

    global latest_hardware_data

    try:
        # ----------------------------------------------------
        # Basic sensor values
        # ----------------------------------------------------

        acc_x = float(data.get("acc_x", 0))
        acc_y = float(data.get("acc_y", 0))
        acc_z = float(data.get("acc_z", 0))

        gyro_x = float(data.get("gyro_x", 0))
        gyro_y = float(data.get("gyro_y", 0))

        gyro_z = float(data.get("gyro_z", 0))

        sound = float(data.get("sound", 0))

        # ----------------------------------------------------
        # Magnitudes
        # ----------------------------------------------------

        acc_magnitude = math.sqrt(
            acc_x ** 2 +
            acc_y ** 2 +
            acc_z ** 2
        )

        gyro_magnitude = math.sqrt(
            gyro_x ** 2 +
            gyro_y ** 2 +
            gyro_z ** 2
        )

        # ----------------------------------------------------
        # Previous acceleration
        # ----------------------------------------------------

        previous_acc = None

        if hardware_history:

            previous_acc = hardware_history[-1].get(
                "acc_magnitude"
            )

        if previous_acc is None:
            acc_variation = 0.0
        else:
            acc_variation = abs(
                acc_magnitude - previous_acc
            )

        # ----------------------------------------------------
        # Add current values to temporary calculation history
        # ----------------------------------------------------

        acc_values = [
            item.get("acc_magnitude", 0)
            for item in hardware_history
        ]

        sound_values = [
            item.get("sound", 0)
            for item in hardware_history
        ]

        # Include current value
        acc_values.append(acc_magnitude)
        sound_values.append(sound)

        # Exact 100-sample window
        acc_values = acc_values[-100:]
        sound_values = sound_values[-100:]

        # ----------------------------------------------------
        # Sound deviation
        # Same concept as training pipeline
        # ----------------------------------------------------

        sound_mean = sum(sound_values) / len(sound_values)

        sound_deviation = abs(
            sound - sound_mean
        )

        # ----------------------------------------------------
        # Vibration rolling standard deviation
        # ----------------------------------------------------

        if len(acc_values) > 1:

            acc_mean = sum(acc_values) / len(acc_values)

            acc_variance = sum(
                (value - acc_mean) ** 2
                for value in acc_values
            ) / (len(acc_values) - 1)

            vibration_rolling_std = math.sqrt(
                acc_variance
            )

        else:

            vibration_rolling_std = 0.0

        # ----------------------------------------------------
        # Sound rolling standard deviation
        # ----------------------------------------------------

        if len(sound_values) > 1:

            sound_variance = sum(
                (value - sound_mean) ** 2
                for value in sound_values
            ) / (len(sound_values) - 1)

            sound_rolling_std = math.sqrt(
                sound_variance
            )

        else:

            sound_rolling_std = 0.0

        # ----------------------------------------------------
        # Final unified data object
        # ----------------------------------------------------

        data["acc_x"] = acc_x
        data["acc_y"] = acc_y
        data["acc_z"] = acc_z

        data["gyro_x"] = gyro_x
        data["gyro_y"] = gyro_y
        data["gyro_z"] = gyro_z

        data["sound"] = sound

        data["acc_magnitude"] = acc_magnitude
        data["gyro_magnitude"] = gyro_magnitude
        data["acc_variation"] = acc_variation

        data["sound_deviation"] = sound_deviation

        data["vibration_rolling_std"] = (
            vibration_rolling_std
        )

        data["sound_rolling_std"] = (
            sound_rolling_std
        )

        if "pc_timestamp" not in data:
            data["pc_timestamp"] = datetime.now().isoformat()

        if "turbine_id" not in data:
            data["turbine_id"] = "WT-001"

        # ----------------------------------------------------
        # Shared history
        # ----------------------------------------------------

        hardware_history.append(data)

        # ----------------------------------------------------
        # Shared latest value
        # ----------------------------------------------------

        latest_hardware_data = data

        return data

    except Exception as error:

        print("HARDWARE DATA UPDATE ERROR:")
        print(error)

        return None


# ============================================================
# ESP8266 SERIAL READER
# ============================================================

def read_serial_data():

    global serial_connection

    try:

        serial_connection = serial.Serial(
            PORT,
            BAUD_RATE,
            timeout=1
        )

        print("========================================")
        print(" AERION LIVE ESP8266 HARDWARE")
        print("========================================")
        print("ESP8266 connected:", PORT)

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

            data = {

                "turbine_id": "WT-001",

                "pc_timestamp": datetime.now().isoformat(),

                "esp_timestamp_ms": int(parts[1]),

                "acc_x": float(parts[2]),
                "acc_y": float(parts[3]),
                "acc_z": float(parts[4]),

                "gyro_x": float(parts[5]),
                "gyro_y": float(parts[6]),
                "gyro_z": float(parts[7]),

                "sound": float(parts[8]),

                "source": "esp8266"
            }

            update_hardware_data(data)

    except Exception as error:

        print()
        print("LIVE HARDWARE ERROR:")
        print(error)


# ============================================================
# START HARDWARE SERVICE
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
# GET LATEST DATA
# ============================================================

def get_latest_hardware_data():

    return latest_hardware_data


# ============================================================
# GET HISTORY
# ============================================================

def get_hardware_history():

    return list(hardware_history)