import React, { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function Metric({ label, value, unit, accent = "text-cyan-400" }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-end gap-2">
        <span className={`text-2xl font-bold ${accent}`}>
          {value ?? "--"}
        </span>

        {unit && <span className="pb-1 text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

function MiniBars({ values }) {
  if (!values.length) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-slate-500">
        Waiting for hardware data...
      </div>
    );
  }

  const max = Math.max(...values, 1);

  return (
    <div className="flex h-40 items-end gap-[3px] overflow-hidden rounded-lg bg-slate-950/60 p-4">
      {values.map((value, index) => {
        const height = Math.max(4, (value / max) * 100);

        return (
          <div
            key={index}
            className="flex-1 rounded-t-sm bg-cyan-400/70 transition-all duration-300"
            style={{ height: `${height}%` }}
            title={value.toFixed(3)}
          />
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [latest, setLatest] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  async function fetchAnalytics() {
    try {
      const [hardwareRes, predictionRes] = await Promise.all([
        fetch(`${API}/api/hardware/latest`),
        fetch(`${API}/api/hardware/prediction`),
      ]);

      if (!hardwareRes.ok || !predictionRes.ok) {
        throw new Error("Backend response unavailable");
      }

      const hardware = await hardwareRes.json();
      const ai = await predictionRes.json();

      setLatest(hardware);
      setPrediction(ai);

      setHistory((old) => {
        const point = {
          time: new Date().toLocaleTimeString(),
          acc: Number(hardware.acc_magnitude ?? 0),
          gyro: Number(hardware.gyro_magnitude ?? 0),
          sound: Number(hardware.sound ?? 0),
        };

        const updated = [...old, point];

        return updated.slice(-40);
      });

      setLastUpdated(new Date());
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Waiting for backend / hardware data...");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();

    const timer = setInterval(fetchAnalytics, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    if (!history.length) {
      return {
        avgAcc: 0,
        peakAcc: 0,
        avgGyro: 0,
        peakSound: 0,
      };
    }

    const acc = history.map((x) => x.acc);
    const gyro = history.map((x) => x.gyro);
    const sound = history.map((x) => x.sound);

    return {
      avgAcc: acc.reduce((a, b) => a + b, 0) / acc.length,
      peakAcc: Math.max(...acc),
      avgGyro: gyro.reduce((a, b) => a + b, 0) / gyro.length,
      peakSound: Math.max(...sound),
    };
  }, [history]);

  const risk = prediction?.risk_level || "LOW";

  const riskClass =
    risk === "HIGH"
      ? "text-red-400 border-red-500/40 bg-red-500/10"
      : risk === "MEDIUM"
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";

  const latestPrediction =
    prediction?.prediction ||
    prediction?.prediction?.prediction ||
    "WAITING";

  return (
    <div className="min-h-screen bg-[#050912] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-400">
                AERION // ANALYTICS CORE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Turbine Intelligence
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Real-time sensor analytics and AI-driven condition monitoring
              for wind turbine health assessment.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Data Stream
            </p>

            <p className="mt-1 text-sm font-semibold text-cyan-300">
              {loading ? "CONNECTING..." : "LIVE"}
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "No data received"}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
            {error}
          </div>
        )}

        {/* TOP METRICS */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Metric
            label="Acceleration"
            value={
              latest?.acc_magnitude !== undefined
                ? Number(latest.acc_magnitude).toFixed(3)
                : "--"
            }
            unit="m/s²"
          />

          <Metric
            label="Gyroscope"
            value={
              latest?.gyro_magnitude !== undefined
                ? Number(latest.gyro_magnitude).toFixed(3)
                : "--"
            }
            unit="rad/s"
            accent="text-violet-400"
          />

          <Metric
            label="Acoustic Signal"
            value={
              latest?.sound !== undefined
                ? Number(latest.sound).toFixed(0)
                : "--"
            }
            unit="ADC"
            accent="text-emerald-400"
          />

          <Metric
            label="Sampling Rate"
            value={prediction?.sampling_rate_hz || 100}
            unit="Hz"
            accent="text-amber-400"
          />

        </div>

        {/* AI + LIVE SIGNAL */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">

          {/* AI STATUS */}
          <Card className="p-5">
            <SectionTitle
              title="AI Condition Assessment"
              subtitle="Isolation Forest anomaly detection"
            />

            <div className={`rounded-xl border p-5 ${riskClass}`}>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                Current state
              </p>

              <p className="mt-2 text-3xl font-black">
                {latestPrediction}
              </p>

              <p className="mt-1 text-xs opacity-70">
                Risk level: {risk}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric
                label="Anomaly Score"
                value={
                  prediction?.anomaly_score !== undefined
                    ? Number(prediction.anomaly_score).toFixed(3)
                    : "--"
                }
              />

              <Metric
                label="Decision Score"
                value={
                  prediction?.decision_score !== undefined
                    ? Number(prediction.decision_score).toFixed(3)
                    : "--"
                }
                accent="text-violet-400"
              />
            </div>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Model
              </p>

              <p className="mt-1 text-xs text-slate-300">
                {prediction?.model || "100 Hz Isolation Forest"}
              </p>
            </div>
          </Card>

          {/* VIBRATION */}
          <Card className="p-5 lg:col-span-2">
            <SectionTitle
              title="Vibration Intelligence"
              subtitle="Recent acceleration magnitude observations"
            />

            <MiniBars values={history.map((x) => x.acc)} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric
                label="Average"
                value={stats.avgAcc.toFixed(3)}
                unit="m/s²"
              />

              <Metric
                label="Peak"
                value={stats.peakAcc.toFixed(3)}
                unit="m/s²"
                accent="text-red-400"
              />
            </div>
          </Card>
        </div>

        {/* ACOUSTIC + GYRO */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">

          <Card className="p-5">
            <SectionTitle
              title="Acoustic Signature"
              subtitle="MAX4466 raw ADC amplitude"
            />

            <MiniBars values={history.map((x) => x.sound)} />

            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Peak signal
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-400">
                  {stats.peakSound.toFixed(0)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Sensor
                </p>

                <p className="mt-1 text-xs text-slate-300">
                  MAX4466
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Rotational Dynamics"
              subtitle="Gyroscope magnitude monitoring"
            />

            <MiniBars values={history.map((x) => x.gyro)} />

            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Average angular rate
                </p>

                <p className="mt-1 text-xl font-bold text-violet-400">
                  {stats.avgGyro.toFixed(3)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Sensor
                </p>

                <p className="mt-1 text-xs text-slate-300">
                  MPU6050
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* DATA PIPELINE */}
        <Card className="mb-6 p-5">
          <SectionTitle
            title="AERION Intelligence Pipeline"
            subtitle="Physical turbine → AI decision flow"
          />

          <div className="grid gap-3 md:grid-cols-6">
            {[
              ["01", "MPU6050", "Vibration"],
              ["02", "MAX4466", "Acoustic"],
              ["03", "ESP8266", "Acquisition"],
              ["04", "100 Hz", "Data stream"],
              ["05", "Features", "Extraction"],
              ["06", "Isolation Forest", "Anomaly"],
            ].map(([num, title, sub]) => (
              <div
                key={num}
                className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <span className="text-[9px] font-bold tracking-widest text-cyan-500">
                  {num}
                </span>

                <p className="mt-2 text-sm font-semibold text-white">
                  {title}
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* RECENT OBSERVATIONS */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle
              title="Recent Observations"
              subtitle="Latest hardware readings received by AERION"
            />

            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-300">
              {history.length} SAMPLES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Acceleration</th>
                  <th className="px-3 py-3">Gyroscope</th>
                  <th className="px-3 py-3">Acoustic</th>
                </tr>
              </thead>

              <tbody>
                {history
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-900 text-xs text-slate-300"
                    >
                      <td className="px-3 py-3 text-slate-500">
                        {row.time}
                      </td>

                      <td className="px-3 py-3 text-cyan-300">
                        {row.acc.toFixed(3)} m/s²
                      </td>

                      <td className="px-3 py-3 text-violet-300">
                        {row.gyro.toFixed(3)} rad/s
                      </td>

                      <td className="px-3 py-3 text-emerald-300">
                        {row.sound.toFixed(0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!history.length && (
              <div className="py-10 text-center text-xs text-slate-500">
                No hardware observations received yet.
              </div>
            )}
          </div>
        </Card>

        {/* FOOTER */}
        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-800 pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>AERION — WIND INTELLIGENCE</span>

          <span>
            ESP8266 • MPU6050 • MAX4466 • FastAPI • Isolation Forest
          </span>
        </div>
      </div>
    </div>
  );
}