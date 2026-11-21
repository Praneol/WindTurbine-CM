import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function DigitalTwin() {
  const [hardware, setHardware] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // -----------------------------
      // HARDWARE DATA
      // -----------------------------
      try {
        const res = await fetch(`${API}/api/hardware/latest`);

        if (!res.ok) {
          throw new Error("Hardware data unavailable");
        }

        const data = await res.json();

        if (mounted) {
          setHardware(data);
          setConnected(true);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Digital Twin hardware error:", error);

        if (mounted) {
          setConnected(false);
        }
      }

      // -----------------------------
      // AI PREDICTION
      // -----------------------------
      try {
        const res = await fetch(`${API}/api/hardware/prediction`);

        if (res.ok) {
          const data = await res.json();

          if (mounted) {
            setPrediction(data);
          }
        }
      } catch (error) {
        console.warn("Prediction temporarily unavailable:", error);
      }

      // -----------------------------
      // MAINTENANCE
      // -----------------------------
      try {
        const res = await fetch(`${API}/api/hardware/maintenance`);

        if (res.ok) {
          const data = await res.json();

          if (mounted) {
            setMaintenance(data);
          }
        }
      } catch (error) {
        console.warn("Maintenance temporarily unavailable:", error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // IMPORTANT:
  // Backend response is:
  // {
  //   turbine_id: "WT-001",
  //   sensor_data: {...}
  // }
  //
  // Therefore sensor values come from hardware.sensor_data
  const sensor = hardware?.sensor_data || {};

  const turbineId = hardware?.turbine_id || sensor?.turbine_id || "WT-001";

  const accX = Number(sensor?.acc_x ?? 0);
  const accY = Number(sensor?.acc_y ?? 0);
  const accZ = Number(sensor?.acc_z ?? 0);

  const gyroX = Number(sensor?.gyro_x ?? 0);
  const gyroY = Number(sensor?.gyro_y ?? 0);
  const gyroZ = Number(sensor?.gyro_z ?? 0);

  const sound = Number(sensor?.sound ?? 0);

  const accMagnitude = Number(
    sensor?.acc_magnitude ??
      Math.sqrt(accX * accX + accY * accY + accZ * accZ)
  );

  const gyroMagnitude = Number(
    sensor?.gyro_magnitude ??
      Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ)
  );

  const ai = prediction?.hardware_ai || {};

const anomalyScore =
  ai.anomaly_score !== undefined
    ? Number(ai.anomaly_score)
    : null;

const decisionScore =
  ai.decision_score !== undefined
    ? Number(ai.decision_score)
    : null;

  const predictionText =
    prediction?.prediction || "WAITING";

  const riskLevel =
    prediction?.risk_level || "LOW";

  const maintenanceStatus =
    maintenance?.status ||
    maintenance?.maintenance_status ||
    "MONITOR";

  const maintenanceAction =
    maintenance?.recommended_action ||
    maintenance?.action ||
    maintenance?.message ||
    "Continue monitoring";

  const healthScore =
    anomalyScore !== null
      ? Math.max(0, Math.min(100, Math.round((1 - anomalyScore) * 100)))
      : null;

  const format = (value, digits = 3) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "--";
    }

    return Number(value).toFixed(digits);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>
            AERION // DIGITAL TWIN
          </div>

          <h1 style={styles.title}>
            Wind Turbine Intelligence
          </h1>

          <p style={styles.subtitle}>
            Live digital representation of turbine condition,
            sensor telemetry and AI analysis.
          </p>
        </div>

        <div style={styles.headerRight}>
          <div
            style={{
              ...styles.connection,
              color: connected ? "#16a34a" : "#dc2626",
            }}
          >
            <span
              style={{
                ...styles.statusDot,
                background: connected ? "#16a34a" : "#dc2626",
              }}
            />

            {connected ? "LIVE DATA" : "OFFLINE"}
          </div>

          <div style={styles.turbineBadge}>
            {turbineId}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={styles.grid}>
        {/* TURBINE VISUAL */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Digital Twin
              </h2>

              <p style={styles.cardSubtitle}>
                Virtual turbine representation
              </p>
            </div>

            <span style={styles.liveBadge}>
              ● LIVE
            </span>
          </div>

          <div style={styles.turbineArea}>
            <div style={styles.towerTop} />

            <div style={styles.rotor}>
              <div style={styles.hub} />

              <div
                style={{
                  ...styles.blade,
                  transform: "rotate(0deg)",
                }}
              />

              <div
                style={{
                  ...styles.blade,
                  transform: "rotate(120deg)",
                }}
              />

              <div
                style={{
                  ...styles.blade,
                  transform: "rotate(240deg)",
                }}
              />
            </div>

            <div style={styles.tower} />
            <div style={styles.base} />
          </div>

          <div style={styles.turbineStatus}>
            <div>
              <span style={styles.smallLabel}>
                TURBINE
              </span>

              <strong style={styles.value}>
                {turbineId}
              </strong>
            </div>

            <div>
              <span style={styles.smallLabel}>
                SYSTEM
              </span>

              <strong
                style={{
                  ...styles.value,
                  color: connected ? "#16a34a" : "#dc2626",
                }}
              >
                {connected ? "ONLINE" : "OFFLINE"}
              </strong>
            </div>
          </div>
        </section>

        {/* AI CONDITION */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                AI Condition
              </h2>

              <p style={styles.cardSubtitle}>
                Isolation Forest analysis
              </p>
            </div>

            <div
              style={{
                ...styles.riskBadge,
                background:
                  riskLevel === "HIGH"
                    ? "#fee2e2"
                    : riskLevel === "MEDIUM"
                    ? "#fef3c7"
                    : "#dcfce7",
                color:
                  riskLevel === "HIGH"
                    ? "#b91c1c"
                    : riskLevel === "MEDIUM"
                    ? "#b45309"
                    : "#15803d",
              }}
            >
              {riskLevel}
            </div>
          </div>

          <div style={styles.healthCircle}>
            <div style={styles.healthNumber}>
              {healthScore !== null
                ? `${healthScore}%`
                : "--"}
            </div>

            <div style={styles.healthLabel}>
              HEALTH
            </div>
          </div>

          <div style={styles.predictionBox}>
            <span style={styles.smallLabel}>
              ML PREDICTION
            </span>

            <strong
              style={{
                ...styles.prediction,
                color:
                  predictionText === "ANOMALY"
                    ? "#dc2626"
                    : "#16a34a",
              }}
            >
              {predictionText}
            </strong>
          </div>

          <div style={styles.metricsGrid}>
            <Metric
              label="Anomaly Score"
              value={
                anomalyScore !== null
                  ? anomalyScore.toFixed(4)
                  : "--"
              }
            />

            <Metric
              label="Decision Score"
              value={
                decisionScore !== null
                  ? decisionScore.toFixed(4)
                  : "--"
              }
            />

            <Metric
              label="Sampling Rate"
              value="100 Hz"
            />

            <Metric
              label="Model"
              value="Isolation Forest"
            />
          </div>
        </section>
      </div>

      {/* SENSOR TELEMETRY */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Live Sensor Telemetry
            </h2>

            <p style={styles.cardSubtitle}>
              ESP8266 + MPU6050 + MAX4466
            </p>
          </div>

          <span style={styles.sourceBadge}>
            {sensor?.source || "hardware"}
          </span>
        </div>

        <div style={styles.sensorGrid}>
          <Sensor
            name="ACCELERATION X"
            value={format(sensor?.acc_x)}
            unit="m/s²"
          />

          <Sensor
            name="ACCELERATION Y"
            value={format(sensor?.acc_y)}
            unit="m/s²"
          />

          <Sensor
            name="ACCELERATION Z"
            value={format(sensor?.acc_z)}
            unit="m/s²"
          />

          <Sensor
            name="ACC MAGNITUDE"
            value={format(accMagnitude)}
            unit="m/s²"
          />

          <Sensor
            name="GYRO X"
            value={format(gyroX)}
            unit="rad/s"
          />

          <Sensor
            name="GYRO Y"
            value={format(gyroY)}
            unit="rad/s"
          />

          <Sensor
            name="GYRO Z"
            value={format(gyroZ)}
            unit="rad/s"
          />

          <Sensor
            name="GYRO MAGNITUDE"
            value={format(gyroMagnitude)}
            unit="rad/s"
          />

          <Sensor
            name="ACOUSTIC SIGNAL"
            value={format(sound, 0)}
            unit="ADC"
          />
        </div>
      </section>

      {/* INTELLIGENCE */}
      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            AI Digital Twin Intelligence
          </h2>

          <p style={styles.description}>
            The digital twin continuously receives real sensor
            telemetry from the ESP8266 backend and evaluates
            turbine behaviour using the trained 100 Hz
            Isolation Forest model.
          </p>

          <div style={styles.pipeline}>
            <PipelineStep
              number="01"
              title="Sensor Layer"
              text="ESP8266 + MPU6050 + MAX4466"
            />

            <PipelineStep
              number="02"
              title="Feature Layer"
              text="Vibration + acoustic features"
            />

            <PipelineStep
              number="03"
              title="AI Layer"
              text="100 Hz Isolation Forest"
            />

            <PipelineStep
              number="04"
              title="Decision Layer"
              text="Condition + risk + maintenance"
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Predictive Maintenance
          </h2>

          <div style={styles.maintenanceStatus}>
            <span style={styles.smallLabel}>
              CURRENT STATUS
            </span>

            <strong style={styles.maintenanceValue}>
              {maintenanceStatus}
            </strong>
          </div>

          <div style={styles.maintenanceBox}>
            <span style={styles.smallLabel}>
              RECOMMENDATION
            </span>

            <p style={styles.description}>
              {maintenanceAction}
            </p>
          </div>

          <div style={styles.componentGrid}>
            <ComponentStatus
              name="Rotor"
              risk={riskLevel}
            />

            <ComponentStatus
              name="Motor"
              risk={riskLevel}
            />

            <ComponentStatus
              name="Bearings"
              risk={riskLevel}
            />

            <ComponentStatus
              name="Sensors"
              risk={riskLevel}
            />
          </div>
        </section>
      </div>

      {/* RAW DATA */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Latest Data Point
            </h2>

            <p style={styles.cardSubtitle}>
              Actual backend telemetry
            </p>
          </div>
        </div>

        <div style={styles.rawGrid}>
          <Raw
            label="Session"
            value={sensor?.session_id || "--"}
          />

          <Raw
            label="Replay Row"
            value={sensor?.replay_row ?? "--"}
          />

          <Raw
            label="ESP Timestamp"
            value={
              sensor?.esp_timestamp_ms !== undefined
                ? `${sensor.esp_timestamp_ms} ms`
                : "--"
            }
          />

          <Raw
            label="PC Timestamp"
            value={sensor?.pc_timestamp || "--"}
          />

          <Raw
            label="Vibration Std"
            value={format(sensor?.vibration_rolling_std)}
          />

          <Raw
            label="Sound Std"
            value={format(sensor?.sound_rolling_std)}
          />

          <Raw
            label="Sound Deviation"
            value={format(sensor?.sound_deviation)}
          />

          <Raw
            label="Acceleration Variation"
            value={format(sensor?.acc_variation)}
          />
        </div>
      </section>

      {/* FOOTER */}
      <div style={styles.footer}>
        AERION — WIND INTELLIGENCE • ESP8266 • MPU6050 • MAX4466 •
        FastAPI • Isolation Forest
      </div>

      <div style={styles.updated}>
        Last update:{" "}
        {lastUpdate
          ? lastUpdate.toLocaleTimeString()
          : "--"}
      </div>
    </div>
  );
}

/* -------------------------------- */
/* COMPONENTS */
/* -------------------------------- */

function Sensor({ name, value, unit }) {
  return (
    <div style={styles.sensorCard}>
      <span style={styles.smallLabel}>
        {name}
      </span>

      <div style={styles.sensorValue}>
        {value}
      </div>

      <span style={styles.unit}>
        {unit}
      </span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={styles.metric}>
      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong style={styles.metricValue}>
        {value}
      </strong>
    </div>
  );
}

function PipelineStep({ number, title, text }) {
  return (
    <div style={styles.pipelineStep}>
      <div style={styles.pipelineNumber}>
        {number}
      </div>

      <div>
        <strong style={styles.pipelineTitle}>
          {title}
        </strong>

        <div style={styles.pipelineText}>
          {text}
        </div>
      </div>
    </div>
  );
}

function ComponentStatus({ name, risk }) {
  const danger = risk === "HIGH";
  const warning = risk === "MEDIUM";

  const color = danger
    ? "#dc2626"
    : warning
    ? "#d97706"
    : "#16a34a";

  const text = danger
    ? "CHECK"
    : warning
    ? "MONITOR"
    : "NORMAL";

  return (
    <div style={styles.component}>
      <span>{name}</span>

      <strong style={{ color }}>
        ● {text}
      </strong>
    </div>
  );
}

function Raw({ label, value }) {
  return (
    <div style={styles.rawItem}>
      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong style={styles.rawValue}>
        {value}
      </strong>
    </div>
  );
}

/* -------------------------------- */
/* STYLES */
/* -------------------------------- */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "32px",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #e0f2fe 100%)",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  header: {
    maxWidth: "1400px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#2563eb",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  connection: {
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  statusDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    display: "inline-block",
  },

  turbineBadge: {
    padding: "9px 14px",
    borderRadius: "10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "13px",
  },

  grid: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  liveBadge: {
    color: "#16a34a",
    background: "#dcfce7",
    padding: "6px 9px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
  },

  sourceBadge: {
    padding: "6px 9px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  riskBadge: {
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
  },

  turbineArea: {
    height: "280px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    overflow: "hidden",
  },

  towerTop: {
    position: "absolute",
    bottom: "72px",
    width: "38px",
    height: "110px",
    background:
      "linear-gradient(90deg,#64748b,#e2e8f0,#64748b)",
    clipPath:
      "polygon(22% 0,78% 0,100% 100%,0 100%)",
  },

  tower: {
    position: "absolute",
    bottom: "45px",
    width: "65px",
    height: "150px",
    background:
      "linear-gradient(90deg,#475569,#e2e8f0,#64748b)",
    clipPath:
      "polygon(30% 0,70% 0,100% 100%,0 100%)",
  },

  base: {
    position: "absolute",
    bottom: "32px",
    width: "130px",
    height: "22px",
    borderRadius: "8px",
    background: "#334155",
  },

  rotor: {
    position: "absolute",
    top: "35px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    zIndex: 3,
  },

  hub: {
    position: "absolute",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#1e293b",
    left: "50px",
    top: "50px",
    zIndex: 5,
    border: "5px solid #94a3b8",
    boxSizing: "border-box",
  },

  blade: {
    position: "absolute",
    width: "14px",
    height: "65px",
    background:
      "linear-gradient(#2563eb,#60a5fa)",
    left: "58px",
    top: "3px",
    transformOrigin: "7px 62px",
    borderRadius: "10px",
  },

  turbineStatus: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "16px",
  },

  smallLabel: {
    display: "block",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#94a3b8",
    marginBottom: "5px",
  },

  value: {
    fontSize: "14px",
  },

  healthCircle: {
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    margin: "10px auto 20px",
    border: "10px solid #dbeafe",
    outline: "5px solid #eff6ff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#ffffff",
  },

  healthNumber: {
    fontSize: "30px",
    fontWeight: "900",
    color: "#2563eb",
  },

  healthLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1px",
  },

  predictionBox: {
    textAlign: "center",
    marginBottom: "18px",
  },

  prediction: {
    fontSize: "20px",
    fontWeight: "900",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0,1fr))",
    gap: "10px",
  },

  metric: {
    padding: "12px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  metricValue: {
    fontSize: "13px",
    color: "#0f172a",
  },

  sensorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },

  sensorCard: {
    padding: "15px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  sensorValue: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#2563eb",
    marginTop: "8px",
  },

  unit: {
    fontSize: "10px",
    color: "#64748b",
  },

  description: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#475569",
  },

  pipeline: {
    display: "grid",
    gap: "10px",
    marginTop: "18px",
  },

  pipelineStep: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "12px",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  pipelineNumber: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "11px",
    flexShrink: 0,
  },

  pipelineTitle: {
    fontSize: "12px",
    display: "block",
  },

  pipelineText: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "3px",
  },

  maintenanceStatus: {
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "10px",
    marginBottom: "12px",
  },

  maintenanceValue: {
    fontSize: "20px",
    color: "#16a34a",
  },

  maintenanceBox: {
    padding: "14px",
    borderRadius: "10px",
    background: "#eff6ff",
    marginBottom: "15px",
  },

  componentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0,1fr))",
    gap: "10px",
  },

  component: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "11px",
    background: "#f8fafc",
    borderRadius: "9px",
    fontSize: "12px",
  },

  rawGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  rawItem: {
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
  },

  rawValue: {
    fontSize: "11px",
    color: "#334155",
    wordBreak: "break-word",
  },

  footer: {
    maxWidth: "1400px",
    margin: "28px auto 5px",
    textAlign: "center",
    fontSize: "10px",
    letterSpacing: "0.7px",
    color: "#94a3b8",
  },

  updated: {
    textAlign: "center",
    fontSize: "10px",
    color: "#94a3b8",
  },
};