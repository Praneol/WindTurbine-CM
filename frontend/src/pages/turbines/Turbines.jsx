import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Turbines() {
  const [hardware, setHardware] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    // --------------------------------------------------
    // HARDWARE
    // --------------------------------------------------
    try {
      const hardwareRes = await fetch(
        `${API}/api/hardware/latest`
      );

      if (!hardwareRes.ok) {
        throw new Error("Hardware unavailable");
      }

      const hardwareData = await hardwareRes.json();

      setHardware(hardwareData);
      setError("");
    } catch (err) {
      console.error("Hardware error:", err);
      setError(
        "Waiting for live turbine hardware data..."
      );
    }

    // --------------------------------------------------
    // AI PREDICTION
    // --------------------------------------------------
    try {
      const predictionRes = await fetch(
        `${API}/api/hardware/prediction`
      );

      if (predictionRes.ok) {
        const predictionData =
          await predictionRes.json();

        setPrediction(predictionData);
      }
    } catch (err) {
      console.warn(
        "Prediction temporarily unavailable"
      );
    }

    // --------------------------------------------------
    // MAINTENANCE
    // --------------------------------------------------
    try {
      const maintenanceRes = await fetch(
        `${API}/api/hardware/maintenance`
      );

      if (maintenanceRes.ok) {
        const maintenanceData =
          await maintenanceRes.json();

        setMaintenance(maintenanceData);
      }
    } catch (err) {
      console.warn(
        "Maintenance temporarily unavailable"
      );
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // REAL SENSOR DATA
  // --------------------------------------------------

  const sensor = hardware?.sensor_data || {};

  const turbineId =
    sensor.turbine_id ||
    hardware?.turbine_id ||
    "WT-001";

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

const anomalyScore =
  ai.anomaly_score !== undefined
    ? Number(ai.anomaly_score)
    : null;

  const risk =
  ai.risk_level || "WAITING";

const condition =
  ai.prediction || "WAITING";

const samplingRate =
  ai.sampling_rate_hz || 100;

const decisionScore =
  ai.decision_score !== undefined
    ? Number(ai.decision_score)
    : null;
 
  // Display-only health indicator derived from anomaly score.
  const healthScore =
    anomalyScore !== null
      ? Math.max(
          0,
          Math.min(100, 100 - anomalyScore * 100)
        )
      : null;

  const conditionColor =
    risk === "HIGH"
      ? "#dc2626"
      : risk === "MEDIUM"
      ? "#d97706"
      : risk === "LOW"
      ? "#059669"
      : "#64748b";

  const componentStatus =
    risk === "HIGH"
      ? "ATTENTION REQUIRED"
      : risk === "MEDIUM"
      ? "MONITOR CLOSELY"
      : risk === "LOW"
      ? "HEALTHY"
      : "WAITING";

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
              AERION // TURBINE FLEET
            </div>

            <h1 style={styles.title}>
              Wind Turbine Intelligence
            </h1>

            <p style={styles.subtitle}>
              Live turbine hardware, sensor and AI
              condition monitoring
            </p>
          </div>

          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span>
            LIVE
          </div>

        </div>

        {error && (
          <div style={styles.warning}>
            ⚠ {error}
          </div>
        )}

        {/* TURBINE ID */}
        <div style={styles.turbineBanner}>

          <div>
            <span style={styles.smallLabel}>
              ACTIVE TURBINE
            </span>

            <strong style={styles.turbineId}>
              {turbineId}
            </strong>
          </div>

          <div style={styles.sourceText}>
            SOURCE:{" "}
            {sensor.source || "LIVE HARDWARE"}
          </div>

        </div>

        {/* TOP METRICS */}
        <div style={styles.grid4}>

          <Metric
            label="Condition"
            value={condition}
            color={conditionColor}
          />

          <Metric
            label="Risk Level"
            value={risk}
            color={conditionColor}
          />

          <Metric
            label="Health"
            value={
              healthScore !== null
                ? `${healthScore.toFixed(1)}%`
                : "--"
            }
            color={conditionColor}
          />

          <Metric
            label="Sampling"
            value={`${samplingRate} Hz`}
            color="#2563eb"
          />

        </div>

        {/* VIRTUAL TURBINE + LIVE INTELLIGENCE */}
        <div style={styles.grid2}>

          {/* TURBINE */}
          <div style={styles.panel}>

            <div style={styles.panelHeader}>

              <div>
                <h2 style={styles.panelTitle}>
                  Virtual Turbine
                </h2>

                <p style={styles.panelSubtitle}>
                  Real-time representation of monitored
                  turbine state
                </p>
              </div>

              <span
                style={{
                  ...styles.statusBadge,
                  color: conditionColor,
                  background:
                    conditionColor + "12",
                  borderColor:
                    conditionColor + "40",
                }}
              >
                {componentStatus}
              </span>

            </div>

            <div style={styles.turbineStage}>

              <div
                style={{
                  ...styles.turbineTower,
                  borderColor:
                    conditionColor + "60",
                }}
              />

              <div
                style={{
                  ...styles.turbineHub,
                  background: conditionColor,
                }}
              />

              <div
                style={{
                  ...styles.blade,
                  transform:
                    "translate(-50%,-50%) rotate(0deg)",
                }}
              />

              <div
                style={{
                  ...styles.blade,
                  transform:
                    "translate(-50%,-50%) rotate(120deg)",
                }}
              />

              <div
                style={{
                  ...styles.blade,
                  transform:
                    "translate(-50%,-50%) rotate(240deg)",
                }}
              />

            </div>

            <div style={styles.turbineCaption}>
              <strong>{turbineId}</strong>

              <span>
                ESP8266 hardware monitoring active
              </span>
            </div>

          </div>

          {/* AI INTELLIGENCE */}
          <div style={styles.panel}>

            <h2 style={styles.panelTitle}>
              AI Turbine Intelligence
            </h2>

            <p style={styles.panelSubtitle}>
              Isolation Forest anomaly detection
            </p>

            <div
              style={{
                ...styles.conditionBox,
                borderColor:
                  conditionColor + "50",
                background:
                  conditionColor + "0D",
              }}
            >

              <span style={styles.smallLabel}>
                CURRENT CONDITION
              </span>

              <strong
                style={{
                  color: conditionColor,
                  fontSize: "30px",
                  marginTop: "7px",
                  display: "block",
                }}
              >
                {condition}
              </strong>

              <span style={styles.muted}>
                Risk: {risk}
              </span>

            </div>

            <div style={styles.aiGrid}>

              <Metric
                label="Anomaly Score"
                value={
                  anomalyScore !== null
                    ? anomalyScore.toFixed(4)
                    : "--"
                }
                color="#dc2626"
              />

              <Metric
                label="Decision Score"
                value={
                  decisionScore !== null
                    ? decisionScore.toFixed(4)
                    : "--"
                }
                color="#7c3aed"
              />

            </div>

          </div>

        </div>

        {/* SENSOR CONDITION */}
        <div style={styles.panel}>

          <div style={styles.panelHeader}>

            <div>
              <h2 style={styles.panelTitle}>
                Component Condition
              </h2>

              <p style={styles.panelSubtitle}>
                Condition indicators derived from live
                vibration, rotational and acoustic data
              </p>
            </div>

          </div>

          <div style={styles.componentGrid}>

            <Component
              name="Rotor / Blades"
              value={accelerationMagnitude}
              unit="m/s²"
              status={componentStatus}
              color={conditionColor}
            />

            <Component
              name="Rotational Assembly"
              value={gyroMagnitude}
              unit="rad/s"
              status={componentStatus}
              color={conditionColor}
            />

            <Component
              name="Acoustic Signature"
              value={sound}
              unit="ADC"
              status={componentStatus}
              color={conditionColor}
            />

            <Component
              name="Sensor Mounting"
              value={
                sensor.vibration_rolling_std !==
                undefined
                  ? Number(
                      sensor.vibration_rolling_std
                    ).toFixed(4)
                  : "--"
              }
              unit="STD"
              status={componentStatus}
              color={conditionColor}
            />

          </div>

        </div>

        {/* RAW TELEMETRY */}
        <div style={styles.panel}>

          <h2 style={styles.panelTitle}>
            Live Telemetry
          </h2>

          <p style={styles.panelSubtitle}>
            Values received from ESP8266 → FastAPI
          </p>

          <div style={styles.telemetryGrid}>

            <Telemetry
              label="Acceleration X"
              value={accX}
              unit="m/s²"
            />

            <Telemetry
              label="Acceleration Y"
              value={accY}
              unit="m/s²"
            />

            <Telemetry
              label="Acceleration Z"
              value={accZ}
              unit="m/s²"
            />

            <Telemetry
              label="Gyroscope X"
              value={gyroX}
              unit="rad/s"
            />

            <Telemetry
              label="Gyroscope Y"
              value={gyroY}
              unit="rad/s"
            />

            <Telemetry
              label="Gyroscope Z"
              value={gyroZ}
              unit="rad/s"
            />

            <Telemetry
              label="Acoustic ADC"
              value={sound}
              unit="ADC"
            />

            <Telemetry
              label="Sampling Rate"
              value={samplingRate}
              unit="Hz"
            />

          </div>

        </div>

        {/* MAINTENANCE */}
        <div style={styles.panel}>

          <h2 style={styles.panelTitle}>
            Predictive Maintenance
          </h2>

          <p style={styles.panelSubtitle}>
            AI maintenance recommendation
          </p>

          <div style={styles.maintenanceBox}>

            <div>
              <span style={styles.smallLabel}>
                STATUS
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: conditionColor,
                }}
              >
                {maintenance?.status ||
                  maintenance?.level ||
                  "MONITORING"}
              </strong>
            </div>

            <div>
              <span style={styles.smallLabel}>
                RECOMMENDATION
              </span>

              <p style={styles.maintenanceText}>
                {maintenanceAction}
              </p>
            </div>

          </div>

        </div>

        {/* SYSTEM PIPELINE */}
        <div style={styles.pipeline}>

          <PipelineStep text="ESP8266" />
          <PipelineArrow />
          <PipelineStep text="MPU6050" />
          <PipelineArrow />
          <PipelineStep text="MAX4466" />
          <PipelineArrow />
          <PipelineStep text="FastAPI" />
          <PipelineArrow />
          <PipelineStep text="Isolation Forest" />
          <PipelineArrow />
          <PipelineStep text="AERION UI" />

        </div>

        <footer style={styles.footer}>
          AERION — WIND INTELLIGENCE • ESP8266 •
          MPU6050 • MAX4466 • FastAPI • Isolation Forest
        </footer>

      </div>
    </div>
  );
}


/* =====================================================
   COMPONENTS
===================================================== */

function Metric({ label, value, color }) {
  return (
    <div style={styles.metric}>

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


function Component({
  name,
  value,
  unit,
  status,
  color,
}) {
  return (
    <div style={styles.component}>

      <div style={styles.componentTop}>

        <strong>{name}</strong>

        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
          }}
        />

      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: "800",
          color,
          marginTop: "16px",
        }}
      >
        {typeof value === "number"
          ? value.toFixed(3)
          : value}
        <span
          style={{
            fontSize: "11px",
            color: "#64748b",
            marginLeft: "5px",
          }}
        >
          {unit}
        </span>
      </div>

      <p style={styles.componentStatus}>
        {status}
      </p>

    </div>
  );
}


function Telemetry({
  label,
  value,
  unit,
}) {
  return (
    <div style={styles.telemetry}>

      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong>
        {typeof value === "number"
          ? value.toFixed(4)
          : value}
      </strong>

      <span>{unit}</span>

    </div>
  );
}


function PipelineStep({ text }) {
  return (
    <div style={styles.pipelineStep}>
      {text}
    </div>
  );
}


function PipelineArrow() {
  return (
    <span style={styles.pipelineArrow}>
      →
    </span>
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
    marginBottom: "25px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.2em",
    marginBottom: "7px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "7px",
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

  warning: {
    marginBottom: "18px",
    padding: "12px 15px",
    borderRadius: "12px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: "13px",
  },

  turbineBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    padding: "18px 20px",
    marginBottom: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,.9)",
    border: "1px solid #e2e8f0",
  },

  turbineId: {
    display: "block",
    marginTop: "5px",
    fontSize: "24px",
  },

  sourceText: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: "#64748b",
    fontWeight: "700",
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(330px,1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  panel: {
    background: "rgba(255,255,255,.9)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "22px",
    boxShadow:
      "0 18px 45px rgba(15,23,42,.06)",
    marginBottom: "18px",
  },

  metric: {
    background: "rgba(255,255,255,.9)",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
    padding: "19px",
    boxShadow:
      "0 14px 35px rgba(15,23,42,.05)",
  },

  metricValue: {
    display: "block",
    marginTop: "10px",
    fontSize: "23px",
    fontWeight: "800",
  },

  smallLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.13em",
    textTransform: "uppercase",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "18px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  panelSubtitle: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "5px",
  },

  statusBadge: {
    border: "1px solid",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  turbineStage: {
    position: "relative",
    height: "330px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg,#e0f2fe,#f8fafc)",
    border: "1px solid #dbeafe",
    overflow: "hidden",
  },

  turbineTower: {
    position: "absolute",
    left: "50%",
    bottom: "35px",
    transform: "translateX(-50%)",
    width: "24px",
    height: "190px",
    background:
      "linear-gradient(90deg,#cbd5e1,#f8fafc,#cbd5e1)",
    borderLeft: "2px solid",
    borderRight: "2px solid",
    clipPath:
      "polygon(30% 0,70% 0,100% 100%,0 100%)",
  },

  turbineHub: {
    position: "absolute",
    left: "50%",
    top: "105px",
    transform: "translate(-50%,-50%)",
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    zIndex: 5,
  },

  blade: {
    position: "absolute",
    left: "50%",
    top: "105px",
    width: "115px",
    height: "10px",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg,#94a3b8,#e2e8f0)",
    transformOrigin: "0% 50%",
    zIndex: 3,
  },

  turbineCaption: {
    position: "absolute",
    bottom: "13px",
    left: 0,
    right: 0,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  conditionBox: {
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid",
    marginTop: "18px",
  },

  muted: {
    display: "block",
    marginTop: "5px",
    color: "#64748b",
    fontSize: "12px",
  },

  aiGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "14px",
  },

  componentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "13px",
  },

  component: {
    padding: "17px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  componentTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },

  componentStatus: {
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    marginTop: "8px",
    letterSpacing: "0.06em",
  },

  telemetryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(160px,1fr))",
    gap: "10px",
    marginTop: "18px",
  },

  telemetry: {
    padding: "14px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  telemetryStrong: {},

  maintenanceBox: {
    display: "grid",
    gridTemplateColumns:
      "minmax(170px,.5fr) minmax(250px,1fr)",
    gap: "20px",
    marginTop: "18px",
    padding: "18px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  maintenanceText: {
    marginTop: "7px",
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  pipeline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
    padding: "18px",
    marginBottom: "20px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  pipelineStep: {
    padding: "8px 11px",
    borderRadius: "9px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: "10px",
    fontWeight: "800",
  },

  pipelineArrow: {
    color: "#94a3b8",
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "10px",
    letterSpacing: "0.08em",
  },
};

export default Turbines;