import serial
import csv
import os
from datetime import datetime

PORT = "COM3"
BAUD_RATE = 115200

OUTPUT_FILE = "hardware_sensor_data_100hz.csv"

print("========================================")
print("  ESP8266 100 Hz DATA COLLECTOR")
print("========================================")
print()
print("Port:", PORT)
print("Baud rate:", BAUD_RATE)
print("Output:", OUTPUT_FILE)
print()
print("Connecting to ESP8266...")

try:

    ser = serial.Serial(
        PORT,
        BAUD_RATE,
        timeout=1
    )

    print("ESP8266: CONNECTED")
    print()

except Exception as error:

    print()
    print("ERROR: Could not connect to ESP8266")
    print(error)
    print()
    print("Make sure Arduino Serial Monitor is CLOSED.")
    input("Press Enter to exit...")
    raise SystemExit


file_exists = os.path.exists(OUTPUT_FILE)
file_empty = (
    not file_exists
    or os.path.getsize(OUTPUT_FILE) == 0
)

session_id = datetime.now().strftime(
    "%Y%m%d_%H%M%S"
)

print("Session:", session_id)
print()
print("Collecting 100 Hz sensor data...")
print()
print("Keep the turbine running normally.")
print("Recommended collection time: 2-3 minutes.")
print()
print("Press Ctrl+C to stop.")
print()

sample_count = 0

with open(
    OUTPUT_FILE,
    "a",
    newline=""
) as file:

    writer = csv.writer(file)

    if file_empty:

        writer.writerow([
            "session_id",
            "pc_timestamp",
            "esp_timestamp_ms",
            "acc_x",
            "acc_y",
            "acc_z",
            "gyro_x",
            "gyro_y",
            "gyro_z",
            "sound"
        ])

    try:

        while True:

            line = ser.readline().decode(
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

            try:

                esp_timestamp = int(parts[1])

                acc_x = float(parts[2])
                acc_y = float(parts[3])
                acc_z = float(parts[4])

                gyro_x = float(parts[5])
                gyro_y = float(parts[6])
                gyro_z = float(parts[7])

                sound = int(parts[8])

            except ValueError:

                continue

            pc_timestamp = datetime.now().isoformat()

            writer.writerow([
                session_id,
                pc_timestamp,
                esp_timestamp,
                acc_x,
                acc_y,
                acc_z,
                gyro_x,
                gyro_y,
                gyro_z,
                sound
            ])

            file.flush()

            sample_count += 1

            if sample_count % 100 == 0:

                print(
                    "Samples collected:",
                    sample_count
                )

    except KeyboardInterrupt:

        print()
        print()
        print("========================================")
        print("       COLLECTION STOPPED")
        print("========================================")
        print()
        print("Session:", session_id)
        print("Samples collected:", sample_count)
        print("Output file:", OUTPUT_FILE)
        print()

    finally:

        ser.close()

        print("ESP8266: DISCONNECTED")
        print()
        print("Collector finished.")