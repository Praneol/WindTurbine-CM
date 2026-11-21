import { useEffect, useState } from "react";

import {
  Activity,
  Volume2,
  Brain,
  ShieldCheck,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

function Dashboard() {
  const [sensor, setSensor] = useState({});
  const [prediction, setPrediction] = useState({});
  const [maintenance, setMaintenance] = useState({});
  const [alert, setAlert] = useState({});

  useEffect(() => {
    const loadData = async () => {

      // HARDWARE
      try {
        const res = await fetch(`${API}/api/hardware/latest`);

        if (res.ok) {
          const data = await res.json();
          setSensor(data?.sensor_data || {});
        }
      } catch (error) {
        console.log("Hardware error:", error);
      }

      // AI PREDICTION
      try {
        const res = await fetch(`${API}/api/hardware/prediction`);

        if (res.ok) {
          const data = await res.json();
          setPrediction(data);
        }
      } catch (error) {
        console.log("Prediction error:", error);
      }

      // MAINTENANCE
      try {
        const res = await fetch(`${API}/api/hardware/maintenance`);

        if (res.ok) {
          const data = await res.json();
          setMaintenance(data);
        }
      } catch (error) {
        console.log("Maintenance error:", error);
      }

      // ALERT
      try {
        const res = await fetch(`${API}/api/alerts/latest`);

        if (res.ok) {
          const data = await res.json();
          setAlert(data);
        }
      } catch (error) {
        console.log("Alert error:", error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

  const number = (value, digits = 3) => {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return "--";
    }

    return n.toFixed(digits);
  };

  const ai = prediction?.hardware_ai || {};

const anomalyScore = Number(
  ai.anomaly_score ?? 0
);

const decisionScore = Number(
  ai.decision_score ?? 0
);

  const riskLevel =
    prediction?.risk_level || "LOW";

  const predictionText =
    prediction?.prediction || "NORMAL";

  const maintenanceStatus =
    maintenance?.maintenance_status ||
    maintenance?.status ||
    "NORMAL";

  const maintenanceLevel =
    maintenance?.maintenance_level ||
    maintenance?.level ||
    "NONE";

  const anomalyCount =
    maintenance?.anomaly_count ?? 0;

  const observations =
    maintenance?.observations ?? 0;

  const persistentAnomaly =
    maintenance?.persistent_anomaly ??
    maintenance?.persistent ??
    false;

  const alertMessage =
    alert?.data?.message ||
    alert?.message ||
    "Sensor behavior is within the learned normal baseline.";

  return (
    <div className="dashboard">

      {/* TOP STATUS */}

      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "5px" }}>
          {predictionText}
        </h2>

        <p>
          100 Hz hardware AI • {riskLevel} risk
        </p>
      </div>


      {/* SENSOR CARDS */}

      <div className="metric-grid">

        <Metric
          title="Acceleration X"
          value={number(sensor.acc_x, 3)}
        />

        <Metric
          title="Acceleration Y"
          value={number(sensor.acc_y, 3)}
        />

        <Metric
          title="Acceleration Z"
          value={number(sensor.acc_z, 3)}
        />

        <Metric
          title="Gyroscope X"
          value={number(sensor.gyro_x, 4)}
        />

        <Metric
          title="Gyroscope Y"
          value={number(sensor.gyro_y, 4)}
        />

        <Metric
          title="Gyroscope Z"
          value={number(sensor.gyro_z, 4)}
        />

        <Metric
          title="Sound ADC"
          value={number(sensor.sound, 0)}
          subtitle="Raw MAX4466 signal"
        />

        <Metric
          title="Acceleration Magnitude"
          value={number(sensor.acc_magnitude, 3)}
        />

        <Metric
          title="Gyroscope Magnitude"
          value={number(sensor.gyro_magnitude, 4)}
        />

        <Metric
          title="Acceleration Variation"
          value={number(sensor.acc_variation, 4)}
        />

        <Metric
          title="Sound Deviation"
          value={number(sensor.sound_deviation, 2)}
        />

        <Metric
          title="Vibration Rolling STD"
          value={number(sensor.vibration_rolling_std, 4)}
        />

        <Metric
          title="Sound Rolling STD"
          value={number(sensor.sound_rolling_std, 2)}
        />

        {/* ANOMALY SCORE */}

        <Metric
          title="Anomaly Score"
          value={number(anomalyScore, 4)}
          subtitle="Isolation Forest"
        />

      </div>


      {/* MAINTENANCE */}

      <div className="panel" style={{ marginTop: "25px" }}>

        <h2>Maintenance Intelligence</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "15px",
            marginTop: "20px",
          }}
        >

          <span>Maintenance Status</span>
          <strong style={{ color: "#159447" }}>
            {maintenanceStatus}
          </strong>

          <span>Maintenance Level</span>
          <strong style={{ color: "#159447" }}>
            {maintenanceLevel}
          </strong>

          <span>Persistent Anomaly</span>
          <strong style={{ color: "#159447" }}>
            {persistentAnomaly ? "YES" : "NO"}
          </strong>

          <span>Anomaly Count</span>
          <strong style={{ color: "#159447" }}>
            {anomalyCount}
          </strong>

          <span>Observations</span>
          <strong style={{ color: "#159447" }}>
            {observations}
          </strong>

        </div>

        <p style={{ marginTop: "20px" }}>
          {maintenance?.interpretation ||
            "Hardware sensor behavior is within the learned normal baseline."}
        </p>

        <p style={{ marginTop: "35px" }}>
          ESP timestamp: {sensor?.esp_timestamp_ms ?? "--"} ms
        </p>

      </div>


      {/* AI ALERTS */}

      <div className="alert-panel">

        <div>
          <Activity size={20} />

          <div>

            <h3>
              AI Alerts & Notifications
            </h3>

            <p>
              {alertMessage}
            </p>

          </div>
        </div>

        <div>

          <strong>
            SYSTEM {predictionText === "NORMAL"
              ? "NORMAL"
              : "ALERT"}
          </strong>

          <br />

          Risk Level: {riskLevel}

          <br />

          Anomaly Score: {number(anomalyScore, 4)}

          <br />

          Decision Score: {number(decisionScore, 4)}

        </div>

      </div>


      {/* SYSTEM STATUS */}

      <div className="alert-panel">

        <div>
          <ShieldCheck size={20} />

          <div>

            <h3>
              System Status
            </h3>

            <p>
              WT-001 is operating normally.
              No immediate inspection required.
            </p>

          </div>
        </div>

        <div>
          <strong>
            SYSTEM ONLINE
          </strong>

          <br />

          Risk Level: {riskLevel}
        </div>

      </div>

    </div>
  );
}


function Metric({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="metric-card">

      <span>{title}</span>

      <strong>{value}</strong>

      {subtitle && (
        <small>{subtitle}</small>
      )}

    </div>
  );
}


export default Dashboard;