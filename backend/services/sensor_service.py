import random
from datetime import datetime


def generate_sensor_data():

    # 15% chance of generating a simulated fault
    fault_mode = random.random() < 0.15

    # =========================================================
    # CARE anomaly detector features
    # =========================================================

    if fault_mode:

        sensor_18_avg = round(random.uniform(1000, 1250), 2)
        sensor_18_min = round(random.uniform(900, sensor_18_avg), 2)
        sensor_18_max = round(random.uniform(sensor_18_avg, 1350), 2)

        sensor_24_avg = round(random.uniform(15, 25), 2)
        sensor_25_avg = round(random.uniform(18, 30), 2)
        sensor_23_avg = round(random.uniform(15, 25), 2)

        sensor_5_avg = round(random.uniform(5, 12), 2)
        sensor_5_min = round(random.uniform(2, sensor_5_avg), 2)
        sensor_5_max = round(random.uniform(sensor_5_avg, 18), 2)

        sensor_52_max = round(random.uniform(8, 13), 2)

    else:

        sensor_18_avg = round(random.uniform(16, 21), 2)
        sensor_18_min = 0.0
        sensor_18_max = round(random.uniform(55, 66), 2)

        sensor_24_avg = round(random.uniform(1.2, 2.3), 2)
        sensor_25_avg = round(random.uniform(1.8, 3.0), 2)
        sensor_23_avg = round(random.uniform(1.0, 2.1), 2)

        sensor_5_avg = round(random.uniform(85.5, 91), 2)
        sensor_5_min = round(random.uniform(84, sensor_5_avg), 2)
        sensor_5_max = round(random.uniform(sensor_5_avg, 91), 2)

        sensor_52_max = round(random.uniform(0, 0.25), 2)

    # =========================================================
    # Existing dashboard sensor values
    # =========================================================

    if fault_mode:

        wind_speed = round(random.uniform(6, 9), 2)
        rotor_speed = round(random.uniform(10, 14), 2)
        gearbox_temperature = round(random.uniform(70, 80), 2)
        generator_temperature = round(random.uniform(75, 85), 2)
        vibration = round(random.uniform(3.5, 5.0), 2)
        acoustic_level = round(random.uniform(65, 75), 2)
        power_output = round(random.uniform(0.5, 1.2), 2)

    else:

        wind_speed = round(random.uniform(6, 12), 2)
        rotor_speed = round(random.uniform(10, 18), 2)
        gearbox_temperature = round(random.uniform(55, 68), 2)
        generator_temperature = round(random.uniform(60, 72), 2)
        vibration = round(random.uniform(1, 2.8), 2)
        acoustic_level = round(random.uniform(45, 58), 2)
        power_output = round(random.uniform(1.5, 2.5), 2)

    # =========================================================
    # Final sensor data
    # =========================================================

    sensor_data = {
        "timestamp": datetime.now(),

        "wind_speed": wind_speed,
        "rotor_speed": rotor_speed,
        "gearbox_temperature": gearbox_temperature,
        "generator_temperature": generator_temperature,
        "vibration": vibration,
        "acoustic_level": acoustic_level,
        "power_output": power_output,

        "sensor_18_avg": sensor_18_avg,
        "sensor_18_max": sensor_18_max,
        "sensor_18_min": sensor_18_min,

        "sensor_24_avg": sensor_24_avg,
        "sensor_25_avg": sensor_25_avg,
        "sensor_23_avg": sensor_23_avg,

        "sensor_5_avg": sensor_5_avg,
        "sensor_5_max": sensor_5_max,
        "sensor_5_min": sensor_5_min,

        "sensor_52_max": sensor_52_max,

        "fault_mode": fault_mode
    }

    return sensor_data