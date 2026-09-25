import { useEffect, useState } from "react";
import { getHardwarePrediction } from "../services/api";

function HardwareAI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadHardwareData = async () => {
      try {
        const result = await getHardwarePrediction();

        setData(result);
        setError(false);
      } catch (err) {
        console.error("Hardware AI error:", err);
        setError(true);
      }
    };

    loadHardwareData();

    const interval = setInterval(
      loadHardwareData,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  if (error || !data) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Live Hardware AI</h3>
            <p>
              Real-time ESP8266 condition monitoring
            </p>
          </div>
        </div>

        <p>
          Hardware data unavailable. Waiting for ESP8266...
        </p>
      </div>
    );
  }

  const ai = data.hardware_ai;
  const sensor = data.sensor_data;
  const maintenance = data.maintenance;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Live Hardware AI</h3>
          <p>
            Real-time AI analysis of ESP8266 sensor data
          </p>
        </div>
      </div>

      <div className="ai-status">
        <div>
          <strong>{ai.prediction}</strong>
          <span>
            100 Hz hardware AI • {ai.risk_level} risk
          </span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Acceleration X</span>
          <strong>{sensor.acc_x.toFixed(3)}</strong>
        </div>

        <div className="metric-card">
          <span>Acceleration Y</span>
          <strong>{sensor.acc_y.toFixed(3)}</strong>
        </div>

        <div className="metric-card">
          <span>Acceleration Z</span>
          <strong>{sensor.acc_z.toFixed(3)}</strong>
        </div>

        <div className="metric-card">
          <span>Gyroscope X</span>
          <strong>{sensor.gyro_x.toFixed(4)}</strong>
        </div>

        <div className="metric-card">
          <span>Gyroscope Y</span>
          <strong>{sensor.gyro_y.toFixed(4)}</strong>
        </div>

        <div className="metric-card">
          <span>Gyroscope Z</span>
          <strong>{sensor.gyro_z.toFixed(4)}</strong>
        </div>

        <div className="metric-card">
          <span>Sound ADC</span>
          <strong>{sensor.sound}</strong>
          <small>Raw MAX4466 signal</small>
        </div>

        <div className="metric-card">
          <span>Acceleration Magnitude</span>
          <strong>
            {sensor.acc_magnitude.toFixed(3)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Gyroscope Magnitude</span>
          <strong>
            {sensor.gyro_magnitude.toFixed(4)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Acceleration Variation</span>
          <strong>
            {sensor.acc_variation.toFixed(4)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Sound Deviation</span>
          <strong>
            {sensor.sound_deviation.toFixed(2)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Vibration Rolling Std</span>
          <strong>
            {sensor.vibration_rolling_std.toFixed(4)}
          </strong>
        </div>

        <div className="metric-card">
          <span>Sound Rolling Std</span>
          <strong>
            {sensor.sound_rolling_std.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="ai-score">
        <span>AI Anomaly Score</span>
        <strong>
          {ai.anomaly_score !== null
            ? ai.anomaly_score.toFixed(3)
            : "N/A"}
        </strong>
      </div>

      <div className="ai-score">
        <span>Decision Score</span>
        <strong>
          {ai.decision_score !== null
            ? ai.decision_score.toFixed(3)
            : "N/A"}
        </strong>
      </div>

      <div className="ai-score">
        <span>Sampling Rate</span>
        <strong>
          {ai.sampling_rate_hz} Hz
        </strong>
      </div>

      <div className="ai-score">
        <span>AI Model</span>
        <strong>{ai.model}</strong>
      </div>

      <div
        style={{
          marginTop: "15px",
          fontSize: "13px",
          opacity: 0.75,
          lineHeight: 1.5,
        }}
      >
        {ai.interpretation}
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>
          Maintenance Intelligence
        </h3>

        <div className="ai-score">
          <span>Maintenance Status</span>
          <strong>
            {maintenance.maintenance_status}
          </strong>
        </div>

        <div className="ai-score">
          <span>Maintenance Level</span>
          <strong>
            {maintenance.maintenance_level}
          </strong>
        </div>

        <div className="ai-score">
          <span>Persistent Anomaly</span>
          <strong>
            {maintenance.persistent_anomaly
              ? "YES"
              : "NO"}
          </strong>
        </div>

        <div className="ai-score">
          <span>Anomaly Count</span>
          <strong>
            {maintenance.anomaly_count}
          </strong>
        </div>

        <div className="ai-score">
          <span>Observations</span>
          <strong>
            {maintenance.observations}
          </strong>
        </div>

        <div
          style={{
            marginTop: "12px",
            fontSize: "13px",
            opacity: 0.8,
            lineHeight: 1.5,
          }}
        >
          {maintenance.message}
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          opacity: 0.65,
        }}
      >
        ESP timestamp: {sensor.esp_timestamp_ms} ms
      </div>
    </div>
  );
}

export default HardwareAI;