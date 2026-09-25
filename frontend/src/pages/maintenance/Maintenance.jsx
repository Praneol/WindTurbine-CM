
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function Maintenance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/hardware/maintenance`
      );
      setData(response.data);
      setError("");
    } catch (err) {
      setError("Unable to connect to the maintenance service.");
    }
  };

  useEffect(() => {
    fetchMaintenance();

    const interval = setInterval(fetchMaintenance, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Maintenance Intelligence</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Maintenance Intelligence</h2>
        <p>Loading live maintenance information...</p>
      </div>
    );
  }

  const maintenance = data.maintenance || {};
  const hardwareAI = data.hardware_ai || {};
  const sensor = data.sensor_data || {};
  const history = data.recent_history || [];

  return (
    <div style={{ padding: "30px" }}>
      <h1>Wind Turbine Condition Monitoring</h1>
      <p>AI-powered remote monitoring platform</p>

      <h2 style={{ marginTop: "30px" }}>Maintenance Intelligence</h2>
      <p>AI-driven predictive maintenance for turbine {data.turbine_id}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "25px",
        }}
      >
        <div>
          <h3>Maintenance Status</h3>
          <p>{maintenance.maintenance_status}</p>
        </div>

        <div>
          <h3>Maintenance Level</h3>
          <p>{maintenance.maintenance_level}</p>
        </div>

        <div>
          <h3>AI Prediction</h3>
          <p>{hardwareAI.prediction?.prediction || "N/A"}</p>
        </div>

        <div>
          <h3>Risk Level</h3>
          <p>{hardwareAI.risk_level}</p>
        </div>

        <div>
          <h3>Persistent Anomaly</h3>
          <p>
            {maintenance.persistent_anomaly
              ? "YES — persistent anomaly detected"
              : "NO — no persistent anomaly detected"}
          </p>
        </div>

        <div>
          <h3>Anomaly Count</h3>
          <p>{maintenance.anomaly_count}</p>
        </div>

        <div>
          <h3>Observations</h3>
          <p>{maintenance.observations}</p>
        </div>

        <div>
          <h3>Priority</h3>
          <p>{maintenance.priority}</p>
        </div>
      </div>

      <hr style={{ margin: "35px 0" }} />

      <h2>Maintenance Decision</h2>

      <p>
        <strong>{maintenance.message}</strong>
      </p>

      <p>
        <strong>Recommended Action:</strong>{" "}
        {maintenance.recommended_action}
      </p>

      <p>
        <strong>Inspection Type:</strong>{" "}
        {maintenance.inspection_type}
      </p>

      <p>
        <strong>Estimated Inspection Time:</strong>{" "}
        {maintenance.estimated_inspection_time}
      </p>

      <p>
        <strong>Reason:</strong> {maintenance.reason}
      </p>

      {maintenance.components_to_inspect &&
        maintenance.components_to_inspect.length > 0 && (
          <>
            <h3>Components to Inspect</h3>
            <ul>
              {maintenance.components_to_inspect.map((component, index) => (
                <li key={index}>{component}</li>
              ))}
            </ul>
          </>
        )}

      <hr style={{ margin: "35px 0" }} />

      <h2>AI Condition Analysis</h2>

      <p>
        <strong>AI Anomaly Score:</strong>{" "}
        {hardwareAI.anomaly_score}
      </p>

      <p>
        <strong>Decision Score:</strong>{" "}
        {hardwareAI.decision_score}
      </p>

      <p>
        <strong>Sampling Rate:</strong>{" "}
        {hardwareAI.sampling_rate_hz} Hz
      </p>

      <p>
        <strong>AI Model:</strong> {hardwareAI.model}
      </p>

      <p>
        {hardwareAI.interpretation}
      </p>

      <hr style={{ margin: "35px 0" }} />

      <h2>Live Sensor Condition</h2>

      <p>
        <strong>Acceleration Magnitude:</strong>{" "}
        {Number(sensor.acc_magnitude || 0).toFixed(3)}
      </p>

      <p>
        <strong>Gyroscope Magnitude:</strong>{" "}
        {Number(sensor.gyro_magnitude || 0).toFixed(4)}
      </p>

      <p>
        <strong>Vibration Rolling Std:</strong>{" "}
        {Number(sensor.vibration_rolling_std || 0).toFixed(4)}
      </p>

      <p>
        <strong>Sound Rolling Std:</strong>{" "}
        {Number(sensor.sound_rolling_std || 0).toFixed(2)}
      </p>

      <p>
        <strong>Sound ADC:</strong>{" "}
        {sensor.sound} (Raw MAX4466 signal)
      </p>

      <p>
        <strong>Acceleration Variation:</strong>{" "}
        {Number(sensor.acc_variation || 0).toFixed(4)}
      </p>

      <hr style={{ margin: "35px 0" }} />

      <h2>Maintenance Monitoring History</h2>

      {history.length === 0 ? (
        <p>No maintenance history available.</p>
      ) : (
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              {item.timestamp} — {item.prediction} —{" "}
              {item.risk_level} risk — anomaly score{" "}
              {item.anomaly_score}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "35px 0" }} />

      <h2>AI Maintenance Interpretation</h2>

      <p>
        Anomaly indicates unusual sensor behavior relative to
        the normal baseline; it is not by itself a confirmed
        mechanical fault.
      </p>

      <p>
        The maintenance decision is based on repeated AI
        observations relative to the learned normal hardware
        baseline.
      </p>
    </div>
  );
}

export default Maintenance;

