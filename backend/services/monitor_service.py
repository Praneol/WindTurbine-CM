import asyncio

from services.sensor_service import generate_sensor_data
from services.health_service import calculate_health
from services.database_service import save_reading


async def monitor_sensors():
    while True:
        sensor_data = generate_sensor_data()
        health = calculate_health(sensor_data)

        save_reading(sensor_data, health)

        print("\n--- SENSOR READING ---")
        print(sensor_data)

        print("--- AI CONDITION ---")
        print(health)

        await asyncio.sleep(5)