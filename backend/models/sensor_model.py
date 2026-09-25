from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime

from core.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    wind_speed = Column(Float, nullable=False)
    rotor_speed = Column(Float, nullable=False)
    gearbox_temperature = Column(Float, nullable=False)
    generator_temperature = Column(Float, nullable=False)
    vibration = Column(Float, nullable=False)
    acoustic_level = Column(Float, nullable=False)
    power_output = Column(Float, nullable=False)