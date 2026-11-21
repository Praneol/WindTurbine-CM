import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Sensors() {
  const [hardware, setHardware] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [connected, setConnected] = useState(false);

  const loadData = async () => {
    try {
      const [hardwareRes, predictionRes] = await Promise.all([
        fetch(`${API}/api/hardware/latest`),
        fetch(`${API}/api/hardware/prediction`),
      ]);

      if (!hardwareRes.ok || !predictionRes.ok) {
        throw new Error("Backend unavailable");
      }

      const hardwareData = await hardwareRes.json();
      const predictionData = await predictionRes.json();

      setHardware(hardwareData);
      setPrediction(predictionData);
      setConnected(true);
    } catch (error) {
      console.error("Sensor API error:", error);
      setConnected(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

 
const data = hardware?.sensor_data || {};
  const accX = Number(data.acc_x || 0);
  const accY = Number(data.acc_y || 0);
  const accZ = Number(data.acc_z || 0);

  const gyroX = Number(data.gyro_x || 0);
  const gyroY = Number(data.gyro_y || 0);
  const gyroZ = Number(data.gyro_z || 0);

  const sound = Number(data.sound || 0);

  const accelerationMagnitude = Math.sqrt(
    accX * accX +
    accY * accY +
    accZ * accZ
  );

  const gyroscopeMagnitude = Math.sqrt(
    gyroX * gyroX +
    gyroY * gyroY +
    gyroZ * gyroZ
  );

  const ai = prediction?.hardware_ai || {};

const predictionText =
  ai.prediction || "WAITING";

const risk =
  ai.risk_level || "LOW";

const anomalyScore =
  ai.anomaly_score !== undefined
    ? Number(ai.anomaly_score).toFixed(3)
    : "--";

const decisionScore =
  ai.decision_score !== undefined
    ? Number(ai.decision_score).toFixed(3)
    : "--";

const samplingRate =
  ai.sampling_rate_hz || 100;



  const conditionClass =
    predictionText === "ANOMALY"
      ? "danger"
      : predictionText === "NORMAL"
      ? "normal"
      : "waiting";

  const riskClass =
    risk === "HIGH"
      ? "danger"
      : risk === "MEDIUM"
      ? "warning"
      : "normal";

  return (
    <div className="sensor-page">

      <style>{`

        .sensor-page {
          min-height: calc(100vh - 80px);
          padding: 28px;
          background:
            linear-gradient(
              180deg,
              #eff9ff 0%,
              #f8fcff 45%,
              #ffffff 100%
            );
          color: #0f172a;
          font-family: Inter, Arial, sans-serif;
        }

        .sensor-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sensor-header {
          background: rgba(255,255,255,.88);
          border: 1px solid #dbe5ee;
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 22px;
          box-shadow: 0 20px 50px rgba(15,23,42,.07);
          backdrop-filter: blur(18px);
        }

        .live-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #bbf7d0;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .live-pill.offline {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        .offline .live-dot {
          background: #ef4444;
        }

        .sensor-title {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -.8px;
        }

        .sensor-subtitle {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .card {
          background: rgba(255,255,255,.88);
          border: 1px solid #dbe5ee;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 18px 40px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
        }

        .label {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .value {
          margin-top: 8px;
          font-size: 26px;
          font-weight: 800;
        }

        .normal {
          color: #059669;
        }

        .warning {
          color: #d97706;
        }

        .danger {
          color: #dc2626;
        }

        .waiting {
          color: #64748b;
        }

        .section {
          margin-bottom: 22px;
        }

        .section-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }

        .section-subtitle {
          margin: 5px 0 18px;
          color: #64748b;
          font-size: 13px;
        }

        .sensor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .sensor-card {
          padding: 18px;
          border-radius: 17px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .sensor-card-title {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .sensor-card-value {
          margin-top: 9px;
          font-size: 22px;
          font-weight: 800;
        }

        .sensor-card-unit {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
        }

        .axis-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .axis-list {
          display: grid;
          gap: 12px;
        }

        .axis-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .axis-name {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }

        .axis-value {
          font-size: 16px;
          font-weight: 800;
        }

        .ai-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .ai-card {
          padding: 18px;
          border-radius: 17px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .ai-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .ai-card strong {
          display: block;
          margin-top: 8px;
          font-size: 19px;
        }

        .pipeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .pipeline-step {
          position: relative;
          padding: 16px;
          text-align: center;
          border-radius: 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .pipeline-step strong {
          display: block;
          font-size: 13px;
        }

        .pipeline-step span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
        }

        .footer {
          text-align: center;
          padding: 12px;
          color: #94a3b8;
          font-size: 11px;
        }

        @media (max-width: 1000px) {
          .overview-grid,
          .ai-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sensor-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .axis-layout {
            grid-template-columns: 1fr;
          }

          .pipeline {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .sensor-page {
            padding: 14px;
          }

          .overview-grid,
          .sensor-grid,
          .ai-grid,
          .pipeline {
            grid-template-columns: 1fr;
          }

          .sensor-title {
            font-size: 25px;
          }
        }

      `}</style>

      <div className="sensor-container">

        {/* HEADER */}

        <div className="sensor-header">

          <div className={`live-pill ${!connected ? "offline" : ""}`}>
            <span className="live-dot"></span>
            {connected
              ? "LIVE SENSOR STREAM"
              : "BACKEND OFFLINE"}
          </div>

          <h1 className="sensor-title">
            Live Sensor Intelligence
          </h1>

          <p className="sensor-subtitle">
            Real-time ESP8266 telemetry from MPU6050 vibration
            and MAX4466 acoustic sensing
          </p>

        </div>


        {/* OVERVIEW */}

        <div className="overview-grid">

          <div className="card">
            <div className="label">
              Sensor System
            </div>

            <div className={`value ${connected ? "normal" : "danger"}`}>
              {connected ? "ONLINE" : "OFFLINE"}
            </div>
          </div>

          <div className="card">
            <div className="label">
              Sampling Rate
            </div>

            <div className="value">
              {samplingRate} Hz
            </div>
          </div>

          <div className="card">
            <div className="label">
              Acceleration
            </div>

            <div className="value">
              {accelerationMagnitude.toFixed(2)}
            </div>
          </div>

          <div className="card">
            <div className="label">
              Acoustic Signal
            </div>

            <div className="value">
              {sound.toFixed(0)} ADC
            </div>
          </div>

        </div>


        {/* ACCELERATION */}

        <div className="card section">

          <h2 className="section-title">
            MPU6050 — Acceleration
          </h2>

          <p className="section-subtitle">
            Mechanical vibration and movement measurements
          </p>

          <div className="sensor-grid">

            <div className="sensor-card">
              <div className="sensor-card-title">
                ACCELERATION X
              </div>

              <div className="sensor-card-value">
                {accX.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                m/s²
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-card-title">
                ACCELERATION Y
              </div>

              <div className="sensor-card-value">
                {accY.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                m/s²
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-card-title">
                ACCELERATION Z
              </div>

              <div className="sensor-card-value">
                {accZ.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                m/s²
              </div>
            </div>

          </div>

        </div>


        {/* GYROSCOPE */}

        <div className="card section">

          <h2 className="section-title">
            MPU6050 — Gyroscope
          </h2>

          <p className="section-subtitle">
            Angular velocity measurements
          </p>

          <div className="sensor-grid">

            <div className="sensor-card">
              <div className="sensor-card-title">
                GYRO X
              </div>

              <div className="sensor-card-value">
                {gyroX.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                rad/s
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-card-title">
                GYRO Y
              </div>

              <div className="sensor-card-value">
                {gyroY.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                rad/s
              </div>
            </div>

            <div className="sensor-card">
              <div className="sensor-card-title">
                GYRO Z
              </div>

              <div className="sensor-card-value">
                {gyroZ.toFixed(3)}
              </div>

              <div className="sensor-card-unit">
                rad/s
              </div>
            </div>

          </div>

        </div>


        {/* SENSOR INTELLIGENCE */}

        <div className="axis-layout section">

          <div className="card">

            <h2 className="section-title">
              Vibration Intelligence
            </h2>

            <p className="section-subtitle">
              Derived from live acceleration telemetry
            </p>

            <div className="axis-list">

              <div className="axis-row">
                <span className="axis-name">
                  Acceleration Magnitude
                </span>

                <span className="axis-value">
                  {accelerationMagnitude.toFixed(3)} m/s²
                </span>
              </div>

              <div className="axis-row">
                <span className="axis-name">
                  Gyroscope Magnitude
                </span>

                <span className="axis-value">
                  {gyroscopeMagnitude.toFixed(3)} rad/s
                </span>
              </div>

              <div className="axis-row">
                <span className="axis-name">
                  Sampling Frequency
                </span>

                <span className="axis-value">
                  {samplingRate} Hz
                </span>
              </div>

            </div>

          </div>


          <div className="card">

            <h2 className="section-title">
              Acoustic Intelligence
            </h2>

            <p className="section-subtitle">
              MAX4466 raw acoustic signal
            </p>

            <div className="axis-list">

              <div className="axis-row">
                <span className="axis-name">
                  Current ADC
                </span>

                <span className="axis-value">
                  {sound.toFixed(0)}
                </span>
              </div>

              <div className="axis-row">
                <span className="axis-name">
                  Sensor
                </span>

                <span className="axis-value">
                  MAX4466
                </span>
              </div>

              <div className="axis-row">
                <span className="axis-name">
                  Measurement
                </span>

                <span className="axis-value">
                  Raw ADC
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* AI */}

        <div className="card section">

          <h2 className="section-title">
            AI Condition Assessment
          </h2>

          <p className="section-subtitle">
            Live anomaly detection using the 100 Hz Isolation Forest model
          </p>

          <div className="ai-grid">

            <div className="ai-card">
              <span>AI CONDITION</span>

              <strong className={conditionClass}>
                {predictionText}
              </strong>
            </div>

            <div className="ai-card">
              <span>RISK LEVEL</span>

              <strong className={riskClass}>
                {risk}
              </strong>
            </div>

            <div className="ai-card">
              <span>ANOMALY SCORE</span>

              <strong>
                {anomalyScore}
              </strong>
            </div>
            <div className="ai-card">
  <span>DECISION SCORE</span>
  <strong>{decisionScore}</strong>
</div>
            

          </div>

        </div>


        {/* PIPELINE */}

        <div className="card section">

          <h2 className="section-title">
            AERION Live Sensor Pipeline
          </h2>

          <p className="section-subtitle">
            Hardware telemetry to AI condition assessment
          </p>

          <div className="pipeline">

            <div className="pipeline-step">
              <strong>MPU6050</strong>
              <span>Vibration</span>
            </div>

            <div className="pipeline-step">
              <strong>MAX4466</strong>
              <span>Acoustic</span>
            </div>

            <div className="pipeline-step">
              <strong>ESP8266</strong>
              <span>100 Hz Stream</span>
            </div>

            <div className="pipeline-step">
              <strong>FastAPI</strong>
              <span>Processing</span>
            </div>

            <div className="pipeline-step">
              <strong>Isolation Forest</strong>
              <span>AI Detection</span>
            </div>

          </div>

        </div>


        <div className="footer">
          AERION — WIND INTELLIGENCE • ESP8266 • MPU6050 • MAX4466 • FastAPI • Isolation Forest
        </div>

      </div>

    </div>
  );
}

export default Sensors;