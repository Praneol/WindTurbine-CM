import sqlite3

DATABASE = "wind_turbine.db"


def initialize_database():
    connection = sqlite3.connect(DATABASE)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            wind_speed REAL,
            rotor_speed REAL,
            gearbox_temperature REAL,
            generator_temperature REAL,
            vibration REAL,
            acoustic_level REAL,
            power_output REAL,
            health_score REAL,
            condition TEXT,
            risk_level TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_reading(sensor_data, health):
    connection = sqlite3.connect(DATABASE)

    connection.execute("""
        INSERT INTO sensor_readings (
            timestamp,
            wind_speed,
            rotor_speed,
            gearbox_temperature,
            generator_temperature,
            vibration,
            acoustic_level,
            power_output,
            health_score,
            condition,
            risk_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sensor_data["timestamp"],
        sensor_data["wind_speed"],
        sensor_data["rotor_speed"],
        sensor_data["gearbox_temperature"],
        sensor_data["generator_temperature"],
        sensor_data["vibration"],
        sensor_data["acoustic_level"],
        sensor_data["power_output"],
        health["health_score"],
        health["condition"],
        health["risk_level"]
    ))

    connection.commit()
    connection.close()