import React, { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

function format(value, digits = 3) {
  return Number.isFinite(Number(value))
    ? Number(value).toFixed(digits)
    : "--";
}

function MiniChart({ data, color = "#0284c7", label }) {
  if (!data || data.length < 2) {
    return (
      <div className="analytics-chart-empty">
        Waiting for hardware data...
      </div>
    );
  }

  const width = 700;
  const height = 190;
  const padding = 20;

  const values = data.map((d) => number(d.value));

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    min -= 1;
    max += 1;
  }

  const range = max - min;

  const points = values
    .map((value, index) => {
      const x =
        padding +
        (index / Math.max(values.length - 1, 1)) *
          (width - padding * 2);

      const y =
        height -
        padding -
        ((value - min) / range) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = values[values.length - 1];

  const lastX =
    padding +
    ((values.length - 1) /
      Math.max(values.length - 1, 1)) *
      (width - padding * 2);

  const lastY =
    height -
    padding -
    ((lastValue - min) / range) *
      (height - padding * 2);

  return (
    <div className="analytics-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="analytics-chart"
        role="img"
        aria-label={label}
      >
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="170"
          stroke="#e2e8f0"
        />

        <line
          x1="20"
          y1="170"
          x2="680"
          y2="170"
          stroke="#e2e8f0"
        />

        <line
          x1="20"
          y1="95"
          x2="680"
          y2="95"
          stroke="#f1f5f9"
          strokeDasharray="4 5"
        />

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={lastX}
          cy={lastY}
          r="5"
          fill={color}
        />
      </svg>

      <div className="analytics-chart-scale">
        <span>{format(max)}</span>
        <span>{format(min)}</span>
      </div>
    </div>
  );
}

/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  icon,
  title,
  value,
  unit,
  status,
  wide = false,
}) {
  return (
    <div
      className={`analytics-metric-card ${
        wide ? "analytics-metric-wide" : ""
      }`}
    >
      <div className="analytics-metric-icon">
        {icon}
      </div>

      <div className="analytics-metric-content">
        <p>{title}</p>

        <div className="analytics-value-row">
          <strong>{value}</strong>

          {unit && (
            <span className="analytics-unit">
              {unit}
            </span>
          )}
        </div>

        {status && <small>{status}</small>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [hardware, setHardware] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [observations, setObservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const hardwareResponse = await fetch(
          `${API}/api/hardware/latest`
        );

        if (!hardwareResponse.ok) {
          throw new Error(
            "Hardware endpoint unavailable"
          );
        }

        const hardwareData =
          await hardwareResponse.json();

        const row =
          hardwareData?.sensor_data ||
          hardwareData?.data ||
          hardwareData?.latest ||
          {};

        const accX = number(
          row.acc_x ?? row.accX
        );

        const accY = number(
          row.acc_y ?? row.accY
        );

        const accZ = number(
          row.acc_z ?? row.accZ
        );

        const gyroX = number(
          row.gyro_x ?? row.gyroX
        );

        const gyroY = number(
          row.gyro_y ?? row.gyroY
        );

        const gyroZ = number(
          row.gyro_z ?? row.gyroZ
        );

        const sound = number(
          row.sound ??
            row.sound_adc ??
            row.acoustic
        );

        const accMagnitude = number(
          row.acc_magnitude,
          magnitude(accX, accY, accZ)
        );

        const gyroMagnitude = number(
          row.gyro_magnitude,
          magnitude(
            gyroX,
            gyroY,
            gyroZ
          )
        );

        const normalized = {
          timestamp:
            row.pc_timestamp ||
            row.timestamp ||
            new Date().toISOString(),

          accX,
          accY,
          accZ,

          gyroX,
          gyroY,
          gyroZ,

          sound,

          accMagnitude,
          gyroMagnitude,

          accVariation: number(
            row.acc_variation
          ),

          soundDeviation: number(
            row.sound_deviation
          ),

          vibrationStd: number(
            row.vibration_rolling_std
          ),

          soundStd: number(
            row.sound_rolling_std
          ),
        };

        if (!active) return;

        setHardware(normalized);
        setOnline(true);
        setLoading(false);
        setLastUpdated(new Date());

        setObservations((previous) => {
          const next = [
            ...previous,
            normalized,
          ];

          return next.slice(-40);
        });

        try {
          const predictionResponse =
            await fetch(
              `${API}/api/hardware/prediction`
            );

          if (predictionResponse.ok) {
            const predictionData =
              await predictionResponse.json();

            if (active) {
              setPrediction(
                predictionData
              );
            }
          }
        } catch (predictionError) {
          console.warn(
            "Prediction temporarily unavailable:",
            predictionError
          );
        }
      } catch (error) {
        console.error(
          "Analytics hardware error:",
          error
        );

        if (!active) return;

        setOnline(false);
        setLoading(false);
      }
    }

    loadData();

    const interval = setInterval(
      loadData,
      1000
    );

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     GRAPH DATA
     ========================================================= */

  const accelerationHistory = useMemo(
    () =>
      observations.map((item) => ({
        value: item.accMagnitude,
      })),
    [observations]
  );

  const gyroHistory = useMemo(
    () =>
      observations.map((item) => ({
        value: item.gyroMagnitude,
      })),
    [observations]
  );

  const acousticHistory = useMemo(
    () =>
      observations.map((item) => ({
        value: item.sound,
      })),
    [observations]
  );

  /* =========================================================
     CALCULATIONS
     ========================================================= */

  const averageAcceleration = useMemo(() => {
    if (!accelerationHistory.length) {
      return 0;
    }

    return (
      accelerationHistory.reduce(
        (sum, item) =>
          sum + number(item.value),
        0
      ) / accelerationHistory.length
    );
  }, [accelerationHistory]);

  const peakAcceleration = useMemo(() => {
    if (!accelerationHistory.length) {
      return 0;
    }

    return Math.max(
      ...accelerationHistory.map(
        (item) => number(item.value)
      )
    );
  }, [accelerationHistory]);

  const averageGyro = useMemo(() => {
    if (!gyroHistory.length) {
      return 0;
    }

    return (
      gyroHistory.reduce(
        (sum, item) =>
          sum + number(item.value),
        0
      ) / gyroHistory.length
    );
  }, [gyroHistory]);

  const peakSound = useMemo(() => {
    if (!acousticHistory.length) {
      return 0;
    }

    return Math.max(
      ...acousticHistory.map(
        (item) => number(item.value)
      )
    );
  }, [acousticHistory]);

  const predictionState =
    prediction?.prediction ||
    prediction?.state ||
    "WAITING";
const ai = prediction?.hardware_ai || {};

const riskLevel =
  ai.risk_level || "LOW";

const anomalyScore =
  ai.anomaly_score ?? null;

const decisionScore =
  ai.decision_score ?? null;

const modelName =
  ai.model || "100 Hz Isolation Forest";
 
  return (
    <div className="analytics-page">

      <style>{`

        .analytics-page {
          width: 100%;
          min-height: calc(100vh - 82px);
          padding: 28px 34px 50px;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f5fbff 55%,
              #eef8ff 100%
            );
          color: #0f172a;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
          box-sizing: border-box;
        }

        .analytics-page * {
          box-sizing: border-box;
        }

        .analytics-shell {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
        }

        .analytics-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .analytics-eyebrow {
          margin: 0 0 7px;
          color: #0284c7;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .28em;
          text-transform: uppercase;
        }

        .analytics-title {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -.025em;
        }

        .analytics-description {
          max-width: 720px;
          margin: 9px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .analytics-live {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
          padding: 10px 16px;
          border: 1px solid #bae6fd;
          border-radius: 999px;
          background: #f0f9ff;
          color: #0369a1;
          font-size: 12px;
          font-weight: 750;
        }

        .analytics-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 4px #d1fae5;
        }

        .analytics-live-dot.offline {
          background: #94a3b8;
          box-shadow: 0 0 0 4px #e2e8f0;
        }

        .analytics-section {
          margin-top: 26px;
        }

        .analytics-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 13px;
        }

        .analytics-section-label {
          margin: 0;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .25em;
          text-transform: uppercase;
        }

        .analytics-section-title {
          margin: 5px 0 0;
          font-size: 20px;
          font-weight: 800;
        }

        .analytics-card {
          border: 1px solid #dbeaf3;
          border-radius: 22px;
          background: rgba(255,255,255,.9);
          box-shadow:
            0 8px 30px rgba(28,107,143,.06);
        }

        .analytics-stream {
          display: grid;
          grid-template-columns:
            minmax(190px, 1.2fr)
            repeat(4, minmax(120px, 1fr));
          gap: 12px;
          padding: 18px;
        }

        .analytics-stream-status {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
          padding: 15px;
          border-radius: 15px;
          background: #f8fafc;
        }

        .analytics-stream-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #e0f2fe;
          color: #0284c7;
          font-size: 20px;
        }

        .analytics-stream-status strong {
          display: block;
          margin-top: 3px;
          font-size: 15px;
        }

        .analytics-stream-status small {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        .analytics-data-box {
          min-width: 0;
          padding: 15px;
          border-radius: 15px;
          background: #f8fafc;
        }

        .analytics-data-box p {
          margin: 0;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .analytics-data-box strong {
          display: block;
          margin-top: 7px;
          font-size: 17px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .analytics-data-box span {
          color: #94a3b8;
          font-size: 9px;
          margin-left: 3px;
        }

        /* =================================================
           FIXED METRIC GRID
           ================================================= */

        .analytics-metrics {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
        }

        .analytics-chart-card
        .analytics-metrics {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          margin-top: 16px;
        }

        .analytics-chart-card.full
        .analytics-metrics {
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
        }

        .analytics-metric-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          width: 100%;
          padding: 18px;
          border: 1px solid #dbeaf3;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 5px 20px rgba(36,108,141,.045);
        }

        .analytics-metric-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #eff6ff;
          font-size: 20px;
        }

        .analytics-metric-content {
          min-width: 0;
          flex: 1;
          overflow: visible;
        }

        .analytics-metric-content p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        /*
         * THIS IS THE IMPORTANT FIX.
         *
         * Previously the number and unit were inside one
         * strong element and the grid squeezed the card.
         *
         * Now the number gets its own full-width row.
         */

        .analytics-value-row {
          display: flex;
          align-items: baseline;
          gap: 5px;
          width: max-content;
          max-width: 100%;
          margin-top: 6px;
        }

        .analytics-value-row strong {
          display: block;
          flex-shrink: 0;
          margin: 0;
          color: #0f172a;
          font-size: 23px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -.02em;
          white-space: nowrap;
        }

        .analytics-unit {
          flex-shrink: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1;
          font-weight: 600;
          white-space: nowrap;
        }

        .analytics-metric-content small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
          white-space: nowrap;
        }

        /* Special wider cards for Average / Peak */

        .analytics-chart-card
        .analytics-metric-card {
          padding: 18px 20px;
        }

        .analytics-chart-card
        .analytics-metric-content {
          min-width: 135px;
        }

        .analytics-chart-card
        .analytics-value-row strong {
          font-size: 25px;
        }

        .analytics-chart-card
        .analytics-unit {
          font-size: 11px;
        }

        .analytics-ai-card {
          padding: 22px;
        }

        .analytics-ai-grid {
          display: grid;
          grid-template-columns:
            minmax(220px, 1.2fr)
            repeat(3, minmax(130px, 1fr));
          gap: 14px;
        }

        .analytics-ai-main {
          padding: 20px;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              #f5f3ff,
              #eef2ff
            );
          border: 1px solid #ddd6fe;
        }

        .analytics-ai-main-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .analytics-ai-main h3 {
          margin: 9px 0 0;
          font-size: 24px;
          font-weight: 850;
        }

        .analytics-risk {
          padding: 6px 11px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          font-size: 9px;
          font-weight: 800;
        }

        .analytics-ai-main p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .analytics-ai-value {
          min-width: 0;
          padding: 18px;
          border-radius: 17px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .analytics-ai-value p {
          margin: 0;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 750;
          text-transform: uppercase;
        }

        .analytics-ai-value strong {
          display: block;
          margin-top: 12px;
          font-size: 22px;
        }

        .analytics-model {
          font-size: 12px !important;
          line-height: 1.4;
          color: #334155 !important;
        }

        .analytics-chart-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .analytics-chart-card {
          min-width: 0;
          padding: 20px;
        }

        .analytics-chart-card.full {
          grid-column: 1 / -1;
        }

        .analytics-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .analytics-chart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .analytics-chart-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .analytics-chart-badge {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f0f9ff;
          color: #0369a1;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .analytics-chart-wrap {
          position: relative;
          width: 100%;
          height: 190px;
        }

        .analytics-chart {
          width: 100%;
          height: 190px;
          overflow: visible;
        }

        .analytics-chart-scale {
          position: absolute;
          top: 10px;
          right: 2px;
          bottom: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #cbd5e1;
          font-size: 8px;
        }

        .analytics-chart-empty {
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
        }

        .analytics-pipeline {
          padding: 22px;
        }

        .analytics-pipeline-grid {
          display: grid;
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .analytics-pipeline-step {
          position: relative;
          min-width: 0;
        }

        .analytics-pipeline-box {
          min-height: 112px;
          padding: 15px;
          border: 1px solid #dbeaf3;
          border-radius: 15px;
          background: #f8fafc;
        }

        .analytics-pipeline-num {
          margin: 0;
          color: #0284c7;
          font-size: 9px;
          font-weight: 850;
        }

        .analytics-pipeline-box strong {
          display: block;
          margin-top: 13px;
          font-size: 12px;
        }

        .analytics-pipeline-box span {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 10px;
        }

        .analytics-pipeline-arrow {
          position: absolute;
          top: 50%;
          right: -10px;
          color: #7dd3fc;
          font-size: 16px;
          transform: translateY(-50%);
          z-index: 2;
        }

        .analytics-table-card {
          overflow: hidden;
          padding: 0;
        }

        .analytics-table-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .analytics-sample-count {
          color: #0284c7;
          font-size: 10px;
          font-weight: 850;
        }

        .analytics-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .analytics-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .analytics-table th {
          padding: 13px 20px;
          text-align: left;
          background: #f8fafc;
          color: #94a3b8;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .analytics-table td {
          padding: 14px 20px;
          border-top: 1px solid #f1f5f9;
          color: #475569;
          font-size: 11px;
        }

        .analytics-empty-row {
          padding: 30px !important;
          text-align: center !important;
          color: #94a3b8 !important;
        }

        .analytics-footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 30px;
          padding-top: 18px;
          border-top: 1px solid #dbeaf3;
          color: #94a3b8;
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        @media (max-width: 1100px) {
          .analytics-stream {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .analytics-ai-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .analytics-ai-main {
            grid-column: 1 / -1;
          }

          .analytics-pipeline-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .analytics-pipeline-arrow {
            display: none;
          }
        }

        @media (max-width: 850px) {
          .analytics-page {
            padding: 22px 18px 40px;
          }

          .analytics-header {
            flex-direction: column;
          }

          .analytics-metrics {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .analytics-chart-grid {
            grid-template-columns: 1fr;
          }

          .analytics-chart-card.full {
            grid-column: auto;
          }

          .analytics-chart-card
          .analytics-metrics {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .analytics-title {
            font-size: 28px;
          }

          .analytics-stream {
            grid-template-columns: 1fr;
          }

          .analytics-metrics {
            grid-template-columns: 1fr;
          }

          .analytics-chart-card
          .analytics-metrics {
            grid-template-columns: 1fr;
          }

          .analytics-chart-card.full
          .analytics-metrics {
            grid-template-columns: 1fr;
          }

          .analytics-ai-grid {
            grid-template-columns: 1fr;
          }

          .analytics-ai-main {
            grid-column: auto;
          }

          .analytics-pipeline-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

      `}</style>

      <div className="analytics-shell">

        {/* HEADER */}

        <header className="analytics-header">
          <div>
            <p className="analytics-eyebrow">
              AERION // ANALYTICS CORE
            </p>

            <h1 className="analytics-title">
              Turbine Intelligence
            </h1>

            <p className="analytics-description">
              Real-time sensor analytics and AI-driven
              condition monitoring for wind turbine
              health assessment.
            </p>
          </div>

          <div className="analytics-live">
            <span
              className={`analytics-live-dot ${
                !online ? "offline" : ""
              }`}
            />

            {online ? "Live" : "Offline"}
          </div>
        </header>

        {/* DATA STREAM */}

        <section className="analytics-section">

          <div className="analytics-section-head">
            <div>
              <p className="analytics-section-label">
                DATA STREAM
              </p>

              <h2 className="analytics-section-title">
                Live sensor telemetry
              </h2>
            </div>
          </div>

          <div className="analytics-card analytics-stream">

            <div className="analytics-stream-status">
              <div className="analytics-stream-icon">
                ⚡
              </div>

              <div>
                <p className="analytics-section-label">
                  STATUS
                </p>

                <strong>
                  {online
                    ? "LIVE"
                    : "NO DATA RECEIVED"}
                </strong>

                <small>
                  {online
                    ? "Hardware stream connected"
                    : "Waiting for backend / hardware data..."}
                </small>
              </div>
            </div>

            <div className="analytics-data-box">
              <p>Acceleration</p>

              <strong>
                {hardware
                  ? format(hardware.accMagnitude)
                  : "--"}

                <span>m/s²</span>
              </strong>
            </div>

            <div className="analytics-data-box">
              <p>Gyroscope</p>

              <strong>
                {hardware
                  ? format(hardware.gyroMagnitude)
                  : "--"}

                <span>rad/s</span>
              </strong>
            </div>

            <div className="analytics-data-box">
              <p>Acoustic Signal</p>

              <strong>
                {hardware
                  ? Math.round(hardware.sound)
                  : "--"}

                <span>ADC</span>
              </strong>
            </div>

            <div className="analytics-data-box">
              <p>Sampling Rate</p>

              <strong>
                100
                <span>Hz</span>
              </strong>
            </div>

          </div>
        </section>

        {/* QUICK METRICS */}

        <section className="analytics-section">
          <div className="analytics-metrics">

            <MetricCard
              icon="📡"
              title="Sensor"
              value={
                online
                  ? "ONLINE"
                  : "WAITING"
              }
              status="ESP8266"
            />

            <MetricCard
              icon="〽️"
              title="Vibration"
              value={
                hardware
                  ? format(
                      hardware.accMagnitude
                    )
                  : "--"
              }
              unit="m/s²"
              status="MPU6050"
            />

            <MetricCard
              icon="🎙️"
              title="Acoustic"
              value={
                hardware
                  ? Math.round(
                      hardware.sound
                    )
                  : "--"
              }
              unit="ADC"
              status="MAX4466"
            />

            <MetricCard
              icon="🤖"
              title="AI Engine"
              value={predictionState}
              status="Isolation Forest"
            />

          </div>
        </section>

        {/* AI */}

        <section className="analytics-section">

          <div className="analytics-section-head">
            <div>
              <p className="analytics-section-label">
                AI CONDITION ASSESSMENT
              </p>

              <h2 className="analytics-section-title">
                Machine-learning health interpretation
              </h2>
            </div>
          </div>

          <div className="analytics-card analytics-ai-card">

            <div className="analytics-ai-grid">

              <div className="analytics-ai-main">

                <div className="analytics-ai-main-top">

                  <p className="analytics-section-label">
                    CURRENT STATE
                  </p>

                  <span className="analytics-risk">
                    RISK: {riskLevel}
                  </span>

                </div>

                <h3>
                  {predictionState}
                </h3>

                <p>
                  Isolation Forest anomaly detection
                </p>

              </div>

              <div className="analytics-ai-value">
                <p>Anomaly Score</p>

                <strong>
                  {anomalyScore !== undefined &&
                  anomalyScore !== null
                    ? format(
                        Number(
                          anomalyScore
                        ),
                        4
                      )
                    : "--"}
                </strong>
              </div>

              <div className="analytics-ai-value">
                <p>Decision Score</p>

                <strong>
                  {decisionScore !== undefined &&
                  decisionScore !== null
                    ? format(
                        Number(
                          decisionScore
                        ),
                        4
                      )
                    : "--"}
                </strong>
              </div>

              <div className="analytics-ai-value">
                <p>Model</p>

                <strong className="analytics-model">
                  {modelName}
                </strong>
              </div>

            </div>
          </div>
        </section>

        {/* GRAPHS */}

        <section className="analytics-section">

          <div className="analytics-section-head">

            <div>
              <p className="analytics-section-label">
                SENSOR INTELLIGENCE
              </p>

              <h2 className="analytics-section-title">
                Multi-sensor condition signals
              </h2>
            </div>

            <span className="analytics-sample-count">
              {observations.length} LIVE SAMPLES
            </span>

          </div>

          <div className="analytics-chart-grid">

            {/* VIBRATION */}

            <div className="analytics-card analytics-chart-card">

              <div className="analytics-chart-header">

                <div>
                  <h3>
                    Vibration Intelligence
                  </h3>

                  <p>
                    Recent acceleration magnitude observations
                  </p>
                </div>

                <span className="analytics-chart-badge">
                  MPU6050
                </span>

              </div>

              <MiniChart
                data={accelerationHistory}
                color="#0284c7"
                label="Acceleration magnitude"
              />

              {/* FIXED TWO-COLUMN METRIC AREA */}

              <div className="analytics-metrics">

                <MetricCard
                  icon="↔"
                  title="Average"
                  value={format(
                    averageAcceleration
                  )}
                  unit="m/s²"
                  wide
                />

                <MetricCard
                  icon="▲"
                  title="Peak"
                  value={format(
                    peakAcceleration
                  )}
                  unit="m/s²"
                  wide
                />

              </div>

            </div>

            {/* ACOUSTIC */}

            <div className="analytics-card analytics-chart-card">

              <div className="analytics-chart-header">

                <div>
                  <h3>
                    Acoustic Signature
                  </h3>

                  <p>
                    MAX4466 raw ADC amplitude
                  </p>
                </div>

                <span className="analytics-chart-badge">
                  MAX4466
                </span>

              </div>

              <MiniChart
                data={acousticHistory}
                color="#7c3aed"
                label="Acoustic signal"
              />

              <div className="analytics-metrics">

                <MetricCard
                  icon="▲"
                  title="Peak Signal"
                  value={Math.round(
                    peakSound
                  )}
                  unit="ADC"
                />

                <MetricCard
                  icon="🎙️"
                  title="Sensor"
                  value="MAX4466"
                />

              </div>

            </div>

            {/* GYROSCOPE */}

            <div className="analytics-card analytics-chart-card full">

              <div className="analytics-chart-header">

                <div>
                  <h3>
                    Rotational Dynamics
                  </h3>

                  <p>
                    Gyroscope magnitude monitoring
                  </p>
                </div>

                <span className="analytics-chart-badge">
                  MPU6050
                </span>

              </div>

              <MiniChart
                data={gyroHistory}
                color="#d97706"
                label="Gyroscope magnitude"
              />

              <div className="analytics-metrics">

                <MetricCard
                  icon="◉"
                  title="Average Angular Rate"
                  value={format(
                    averageGyro
                  )}
                  unit="rad/s"
                />

                <MetricCard
                  icon="〽️"
                  title="Sensor"
                  value="MPU6050"
                />

                <MetricCard
                  icon="⏱"
                  title="Sampling"
                  value="100"
                  unit="Hz"
                />

                <MetricCard
                  icon="●"
                  title="Observations"
                  value={observations.length}
                />

              </div>

            </div>

          </div>
        </section>

        {/* PIPELINE */}

        <section className="analytics-section">

          <div className="analytics-section-head">

            <div>
              <p className="analytics-section-label">
                AERION INTELLIGENCE PIPELINE
              </p>

              <h2 className="analytics-section-title">
                Physical turbine → AI decision flow
              </h2>
            </div>

          </div>

          <div className="analytics-card analytics-pipeline">

            <div className="analytics-pipeline-grid">

              {[
                ["01", "MPU6050", "Vibration"],
                ["02", "MAX4466", "Acoustic"],
                ["03", "ESP8266", "Acquisition"],
                ["04", "100 Hz", "Data stream"],
                ["05", "Features", "Extraction"],
                ["06", "Isolation Forest", "Anomaly"],
              ].map(
                ([num, title, subtitle], index) => (
                  <div
                    className="analytics-pipeline-step"
                    key={num}
                  >

                    <div className="analytics-pipeline-box">

                      <p className="analytics-pipeline-num">
                        {num}
                      </p>

                      <strong>
                        {title}
                      </strong>

                      <span>
                        {subtitle}
                      </span>

                    </div>

                    {index < 5 && (
                      <div className="analytics-pipeline-arrow">
                        →
                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          </div>
        </section>

        {/* RECENT OBSERVATIONS */}

        <section className="analytics-section">

          <div className="analytics-section-head">

            <div>
              <p className="analytics-section-label">
                RECENT OBSERVATIONS
              </p>

              <h2 className="analytics-section-title">
                Latest hardware readings received by AERION
              </h2>
            </div>

            <span className="analytics-sample-count">
              {observations.length} SAMPLES
            </span>

          </div>

          <div className="analytics-card analytics-table-card">

            <div className="analytics-table-head">

              <div>
                <p className="analytics-section-label">
                  SENSOR LOG
                </p>

                <strong>
                  Live hardware observations
                </strong>
              </div>

              <span className="analytics-sample-count">
                {online
                  ? "CONNECTED"
                  : "WAITING"}
              </span>

            </div>

            <div className="analytics-table-wrap">

              <table className="analytics-table">

                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Acceleration</th>
                    <th>Gyroscope</th>
                    <th>Acoustic</th>
                  </tr>
                </thead>

                <tbody>

                  {observations.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="analytics-empty-row"
                      >
                        {loading
                          ? "Connecting to AERION backend..."
                          : "No hardware observations received yet."}
                      </td>
                    </tr>
                  ) : (
                    [...observations]
                      .reverse()
                      .slice(0, 10)
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <tr
                            key={`${item.timestamp}-${index}`}
                          >

                            <td>
                              {new Date(
                                item.timestamp
                              ).toLocaleTimeString()}
                            </td>

                            <td>
                              {format(
                                item.accMagnitude
                              )}{" "}
                              m/s²
                            </td>

                            <td>
                              {format(
                                item.gyroMagnitude
                              )}{" "}
                              rad/s
                            </td>

                            <td>
                              {Math.round(
                                item.sound
                              )}{" "}
                              ADC
                            </td>

                          </tr>
                        )
                      )
                  )}

                </tbody>

              </table>

            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="analytics-footer">

          <span>
            AERION — WIND INTELLIGENCE
          </span>

          <span>
            ESP8266 • MPU6050 • MAX4466 • FastAPI • Isolation Forest
          </span>

          <span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for telemetry"}
          </span>

        </footer>

      </div>
    </div>
  );
}