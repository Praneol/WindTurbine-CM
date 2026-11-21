import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function AIHealth() {
  const [hardware, setHardware] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      // --------------------------------------------------
      // 1. HARDWARE DATA
      // --------------------------------------------------
      const hardwareRes = await fetch(`${API}/api/hardware/latest`);

      if (!hardwareRes.ok) {
        throw new Error("Hardware data unavailable");
      }

      const hardwareData = await hardwareRes.json();

      setHardware(hardwareData);
      setError("");

      // --------------------------------------------------
      // 2. AI PREDICTION
      // --------------------------------------------------
      try {
        const predictionRes = await fetch(
          `${API}/api/hardware/prediction`
        );

        if (predictionRes.ok) {
          const predictionData = await predictionRes.json();
          setPrediction(predictionData);
        }
      } catch (err) {
        console.warn("Prediction temporarily unavailable");
      }

      // --------------------------------------------------
      // 3. MAINTENANCE
      // --------------------------------------------------
      try {
        const maintenanceRes = await fetch(
          `${API}/api/hardware/maintenance`
        );

        if (maintenanceRes.ok) {
          const maintenanceData = await maintenanceRes.json();
          setMaintenance(maintenanceData);
        }
      } catch (err) {
        console.warn("Maintenance temporarily unavailable");
      }
    } catch (err) {
      console.error("AI Health API error:", err);
      setError("Hardware data unavailable.");
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // REAL BACKEND SENSOR DATA
  // --------------------------------------------------

  const sensor = hardware?.sensor_data || {};

  const accX = Number(sensor.acc_x ?? 0);
  const accY = Number(sensor.acc_y ?? 0);
  const accZ = Number(sensor.acc_z ?? 0);

  const gyroX = Number(sensor.gyro_x ?? 0);
  const gyroY = Number(sensor.gyro_y ?? 0);
  const gyroZ = Number(sensor.gyro_z ?? 0);

  const sound = Number(sensor.sound ?? 0);

  const accelerationMagnitude =
    sensor.acc_magnitude !== undefined
      ? Number(sensor.acc_magnitude)
      : Math.sqrt(accX ** 2 + accY ** 2 + accZ ** 2);

  const gyroMagnitude =
    sensor.gyro_magnitude !== undefined
      ? Number(sensor.gyro_magnitude)
      : Math.sqrt(gyroX ** 2 + gyroY ** 2 + gyroZ ** 2);



const ai = prediction?.hardware_ai || {};

const anomalyScore = Number(ai.anomaly_score ?? 0);

const decisionScore = Number(ai.decision_score ?? 0);

const risk = ai.risk_level || "WAITING";

const predictionText = ai.prediction || "WAITING";

const samplingRate = ai.sampling_rate_hz || 100;
  // Display health derived directly from anomaly score.
  // This is NOT a separate ML model.

const healthScore = Math.max(
  0,
  Math.min(100, 100 - anomalyScore * 100)
).toFixed(1);

  const healthColor =
    risk === "HIGH"
      ? "#dc2626"
      : risk === "MEDIUM"
      ? "#d97706"
      : risk === "LOW"
      ? "#059669"
      : "#64748b";

  const riskWidth =
    risk === "HIGH"
      ? "100%"
      : risk === "MEDIUM"
      ? "60%"
      : risk === "LOW"
      ? "25%"
      : "5%";

  const maintenanceStatus =
    maintenance?.status ||
    maintenance?.maintenance_status ||
    maintenance?.level ||
    "MONITORING";

  const maintenanceAction =
    maintenance?.recommended_action ||
    maintenance?.action ||
    maintenance?.message ||
    "Continue monitoring turbine condition.";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              AERION // AI HEALTH
            </div>

            <h1 style={styles.title}>
              Turbine Intelligence
            </h1>

            <p style={styles.subtitle}>
              AI-powered condition monitoring and predictive
              maintenance intelligence
            </p>
          </div>

          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span>
            LIVE
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠ {error}
          </div>
        )}

        {/* TOP CARDS */}
        <div style={styles.grid4}>

          <MetricCard
            label="AI Health Score"
            value={`${healthScore}${healthScore !== "--" ? "%" : ""}`}
            color={healthColor}
          />

          <MetricCard
            label="ML Prediction"
            value={predictionText}
            color={healthColor}
          />

          <MetricCard
            label="Risk Level"
            value={risk}
            color={healthColor}
          />

          <MetricCard
            label="Sampling Rate"
            value={`${samplingRate} Hz`}
            color="#2563eb"
          />

        </div>

        {/* AI HEALTH OVERVIEW */}
        <div style={styles.panel}>

          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                AI Health Assessment
              </h2>

              <p style={styles.panelSubtitle}>
                Isolation Forest anomaly detection from live
                turbine sensor features
              </p>
            </div>

            <div
              style={{
                ...styles.statusBadge,
                color: healthColor,
                borderColor: healthColor + "40",
                background: healthColor + "10",
              }}
            >
              {predictionText}
            </div>
          </div>

          <div style={styles.healthRow}>

            <div style={styles.healthScoreBox}>
              <span style={styles.smallLabel}>
                OVERALL TURBINE HEALTH
              </span>

              <strong
                style={{
                  ...styles.bigScore,
                  color: healthColor,
                }}
              >
                {healthScore}
                {healthScore !== "--" && "%"}
              </strong>

              <div style={styles.progress}>
                <div
                  style={{
                    ...styles.progressFill,
                    width:
                      healthScore === "--"
                        ? "0%"
                        : `${healthScore}%`,
                    background: healthColor,
                  }}
                />
              </div>
            </div>

            <div style={styles.assessmentText}>
              <p>
                <strong>Current condition:</strong>{" "}
                {predictionText}
              </p>

              <p>
                <strong>Risk level:</strong>{" "}
                {risk}
              </p>

              <p>
                <strong>Model:</strong>{" "}
                {prediction?.model ||
                  "100 Hz Isolation Forest"}
              </p>

              <p>
                <strong>Sampling:</strong>{" "}
                {samplingRate} Hz
              </p>
            </div>

          </div>
        </div>

        {/* SENSOR INTELLIGENCE */}
        <div style={styles.grid3}>

          <SensorCard
            title="Acceleration"
            subtitle="MPU6050 vibration signal"
            value={accelerationMagnitude}
            unit="m/s²"
            details={[
              ["X", accX],
              ["Y", accY],
              ["Z", accZ],
            ]}
            color="#2563eb"
          />

          <SensorCard
            title="Gyroscope"
            subtitle="MPU6050 rotational signal"
            value={gyroMagnitude}
            unit="rad/s"
            details={[
              ["X", gyroX],
              ["Y", gyroY],
              ["Z", gyroZ],
            ]}
            color="#7c3aed"
          />

          <SensorCard
            title="Acoustic Signal"
            subtitle="MAX4466 raw microphone ADC"
            value={sound}
            unit="ADC"
            details={[
              [
                "Deviation",
                sensor.sound_deviation !== undefined
                  ? Number(sensor.sound_deviation).toFixed(3)
                  : "--",
              ],
              [
                "Rolling STD",
                sensor.sound_rolling_std !== undefined
                  ? Number(sensor.sound_rolling_std).toFixed(3)
                  : "--",
              ],
            ]}
            color="#059669"
          />

        </div>

        {/* ANOMALY ANALYSIS */}
        <div style={styles.grid2}>

          <div style={styles.panel}>

            <h2 style={styles.panelTitle}>
              Anomaly Analysis
            </h2>

            <p style={styles.panelSubtitle}>
              Current Isolation Forest output
            </p>

            <div style={styles.analysisGrid}>

              <MetricCard
                label="Anomaly Score"
               value={anomalyScore.toFixed(4)}
                color="#dc2626"
              />

             <MetricCard
  label="Decision Score"
  value={decisionScore.toFixed(4)}
  color="#7c3aed"
/>
            </div>

            <div style={styles.infoBox}>
              <strong>Interpretation</strong>

              <p>
                Anomaly detection identifies sensor behavior
                that is unusual relative to the normal baseline.
                An anomaly is not by itself a confirmed mechanical
                fault.
              </p>
            </div>

          </div>

          <div style={styles.panel}>

            <h2 style={styles.panelTitle}>
              Risk Assessment
            </h2>

            <p style={styles.panelSubtitle}>
              AI-derived operating risk
            </p>

            <div style={styles.riskValue}>
              <span
                style={{
                  color: healthColor,
                  fontSize: "32px",
                  fontWeight: "800",
                }}
              >
                {risk}
              </span>
            </div>

            <div style={styles.progress}>
              <div
                style={{
                  ...styles.progressFill,
                  width: riskWidth,
                  background: healthColor,
                }}
              />
            </div>

            <p style={styles.mutedText}>
              {risk === "HIGH"
                ? "High-risk sensor behavior detected."
                : risk === "MEDIUM"
                ? "Moderate unusual behavior detected."
                : risk === "LOW"
                ? "Sensor behavior is within the monitored baseline."
                : "Waiting for AI prediction."}
            </p>

          </div>

        </div>

        {/* MAINTENANCE */}
        <div style={styles.panel}>

          <div style={styles.panelHeader}>

            <div>
              <h2 style={styles.panelTitle}>
                AI Maintenance Recommendation
              </h2>

              <p style={styles.panelSubtitle}>
                Predictive maintenance intelligence
              </p>
            </div>

            <div style={styles.maintenanceIcon}>
              ⚙
            </div>

          </div>

          <div style={styles.maintenanceBox}>

            <div>
              <span style={styles.smallLabel}>
                STATUS
              </span>

              <strong style={styles.maintenanceStatus}>
                {maintenanceStatus}
              </strong>
            </div>

            <div>
              <span style={styles.smallLabel}>
                RECOMMENDED ACTION
              </span>

              <p style={styles.maintenanceText}>
                {maintenanceAction}
              </p>
            </div>

          </div>

        </div>

        {/* SYSTEM STATUS */}
        <div style={styles.systemStatus}>

          <div>
            <span style={styles.liveDot}></span>
            <strong>
              AERION AI SYSTEM ONLINE
            </strong>
          </div>

          <span style={styles.systemText}>
            ESP8266 • MPU6050 • MAX4466 • FastAPI •
            Isolation Forest
          </span>

        </div>

        <footer style={styles.footer}>
          AERION — WIND INTELLIGENCE • REAL-TIME AI
          CONDITION MONITORING
        </footer>

      </div>
    </div>
  );
}


/* =====================================================
   COMPONENTS
===================================================== */

function MetricCard({ label, value, color }) {
  return (
    <div style={styles.metricCard}>

      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong
        style={{
          ...styles.metricValue,
          color,
        }}
      >
        {value}
      </strong>

    </div>
  );
}


function SensorCard({
  title,
  subtitle,
  value,
  unit,
  details,
  color,
}) {
  return (
    <div style={styles.panel}>

      <div style={styles.sensorHeader}>
        <div>
          <h2 style={styles.panelTitle}>
            {title}
          </h2>

          <p style={styles.panelSubtitle}>
            {subtitle}
          </p>
        </div>

        <span
          style={{
            ...styles.sensorDot,
            background: color,
          }}
        />
      </div>

      <div style={styles.sensorMainValue}>

        <strong style={{ color }}>
          {Number(value).toFixed(3)}
        </strong>

        <span>{unit}</span>

      </div>

      <div style={styles.sensorDetails}>

        {details.map(([label, value], index) => (
          <div key={index} style={styles.sensorDetail}>

            <span>{label}</span>

            <strong>
              {typeof value === "number"
                ? value.toFixed(3)
                : value}
            </strong>

          </div>
        ))}

      </div>

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#f0f9ff 0%,#ffffff 55%,#f8fafc 100%)",
    color: "#0f172a",
    padding: "28px",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "26px",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.2em",
    color: "#2563eb",
    marginBottom: "7px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "14px",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 14px",
    borderRadius: "999px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "800",
  },

  liveDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
  },

  error: {
    padding: "12px 15px",
    marginBottom: "18px",
    borderRadius: "12px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: "13px",
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  metricCard: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.06)",
  },

  smallLabel: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.13em",
    color: "#64748b",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  metricValue: {
    display: "block",
    marginTop: "10px",
    fontSize: "25px",
    fontWeight: "800",
  },

  panel: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "22px",
    boxShadow:
      "0 18px 45px rgba(15,23,42,0.06)",
    marginBottom: "18px",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  statusBadge: {
    padding: "8px 12px",
    border: "1px solid",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
  },

  healthRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(250px,1fr) minmax(250px,1fr)",
    gap: "22px",
  },

  healthScoreBox: {
    padding: "20px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  bigScore: {
    display: "block",
    margin: "8px 0 14px",
    fontSize: "42px",
    fontWeight: "900",
  },

  progress: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },

  assessmentText: {
    padding: "18px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.8",
  },

  sensorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  sensorDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },

  sensorMainValue: {
    display: "flex",
    alignItems: "baseline",
    gap: "7px",
    marginTop: "24px",
  },

  sensorMainValueStrong: {},

  sensorDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(80px,1fr))",
    gap: "8px",
    marginTop: "20px",
  },

  sensorDetail: {
    padding: "10px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "18px",
  },

  infoBox: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#475569",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  riskValue: {
    margin: "20px 0 12px",
  },

  mutedText: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "12px",
  },

  maintenanceIcon: {
    fontSize: "22px",
  },

  maintenanceBox: {
    display: "grid",
    gridTemplateColumns:
      "minmax(180px,0.5fr) minmax(250px,1fr)",
    gap: "20px",
    padding: "18px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  maintenanceStatus: {
    display: "block",
    marginTop: "8px",
    fontSize: "18px",
    color: "#2563eb",
  },

  maintenanceText: {
    marginTop: "8px",
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  systemStatus: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    padding: "15px 18px",
    borderRadius: "15px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "12px",
  },

  systemText: {
    color: "#64748b",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "10px",
    letterSpacing: "0.08em",
    marginTop: "25px",
  },
};

export default AIHealth;