import { useEffect, useState } from "react";
import {
  Wind,
  Activity,
  Thermometer,
  Gauge,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getTurbineStatus } from "../../services/api";

function Turbines() {
  const [turbine, setTurbine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTurbine = async () => {
    try {
      setError("");

      const response = await getTurbineStatus();
      setTurbine(response);
    } catch (err) {
      console.error("Turbine loading failed:", err);
      setError("Unable to connect to turbine monitoring service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurbine();

    const interval = setInterval(loadTurbine, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="panel">
          <h3>Loading Turbine Fleet...</h3>
          <p>Connecting to the wind intelligence system.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="panel">
          <h3>Unable to Load Turbine</h3>
          <p>{error}</p>

          <button onClick={loadTurbine}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusClass =
    turbine.status?.toLowerCase() || "unknown";

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Turbine Fleet</h2>
          <p>
            Real-time fleet monitoring and turbine operational intelligence
          </p>
        </div>

        <div className="turbine-selector">
          <Wind size={16} />
          Fleet Monitoring
        </div>
      </div>

      {/* FLEET SUMMARY */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Wind Turbine Fleet</h3>
            <p>
              Live operational status of connected wind turbines
            </p>
          </div>

          <Activity size={20} />
        </div>

        <div className="metric-grid">

          {/* TURBINE ID */}
          <div className="metric-card">
            <div className="metric-icon">
              <Wind size={21} />
            </div>

            <span>Turbine</span>
            <strong>{turbine.turbine_id}</strong>
            <small>Connected asset</small>
          </div>

          {/* STATUS */}
          <div className="metric-card">
            <div className="metric-icon">
              <ShieldCheck size={21} />
            </div>

            <span>Condition</span>
            <strong>{turbine.status}</strong>
            <small>{turbine.risk_level} risk</small>
          </div>

          {/* HEALTH */}
          <div className="metric-card">
            <div className="metric-icon">
              <Activity size={21} />
            </div>

            <span>Health Score</span>
            <strong>{turbine.health_score}%</strong>
            <small>AI health assessment</small>
          </div>

          {/* POWER */}
          <div className="metric-card">
            <div className="metric-icon">
              <Zap size={21} />
            </div>

            <span>Power Output</span>
            <strong>{turbine.sensor_data.power_output} MW</strong>
            <small>Current generation</small>
          </div>

        </div>
      </div>

      {/* TURBINE STATUS */}
      <div className="panel">

        <div className="panel-header">
          <div>
            <h3>{turbine.turbine_id} — Operational Status</h3>
            <p>
              Current condition and critical operating parameters
            </p>
          </div>

          {turbine.status === "NORMAL" ? (
            <ShieldCheck size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>

        <div className={`ai-status ${statusClass}`}>

          {turbine.status === "NORMAL" ? (
            <ShieldCheck size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}

          <div>
            <strong>{turbine.status}</strong>

            <span>
              {turbine.operating_mode} •{" "}
              {turbine.risk_level} risk •{" "}
              {turbine.confidence
                ? `${(turbine.confidence * 100).toFixed(0)}% AI confidence`
                : "AI assessment active"}
            </span>
          </div>

        </div>

      </div>

      {/* OPERATING PARAMETERS */}
      <div className="panel">

        <div className="panel-header">
          <div>
            <h3>Operating Parameters</h3>
            <p>
              Current measurements from {turbine.turbine_id}
            </p>
          </div>

          <Gauge size={20} />
        </div>

        <div className="metric-grid">

          <div className="metric-card">
            <div className="metric-icon">
              <Wind size={21} />
            </div>

            <span>Wind Speed</span>
            <strong>{turbine.sensor_data.wind_speed} m/s</strong>
            <small>Live measurement</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Gauge size={21} />
            </div>

            <span>Rotor Speed</span>
            <strong>{turbine.sensor_data.rotor_speed} RPM</strong>
            <small>Rotor operating speed</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Thermometer size={21} />
            </div>

            <span>Gearbox Temperature</span>
            <strong>
              {turbine.sensor_data.gearbox_temperature} °C
            </strong>
            <small>Gearbox thermal condition</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Thermometer size={21} />
            </div>

            <span>Generator Temperature</span>
            <strong>
              {turbine.sensor_data.generator_temperature} °C
            </strong>
            <small>Generator thermal condition</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Activity size={21} />
            </div>

            <span>Vibration</span>
            <strong>{turbine.sensor_data.vibration} mm/s</strong>
            <small>Mechanical condition</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Activity size={21} />
            </div>

            <span>Acoustic Level</span>
            <strong>{turbine.sensor_data.acoustic_level} dB</strong>
            <small>Acoustic condition</small>
          </div>

        </div>

      </div>

      {/* AI SUMMARY */}
      <div className="alert-panel">

        <div>
          <Activity size={20} />

          <div>
            <h3>AI Monitoring Status</h3>

            <p>
              {turbine.prediction === "NORMAL"
                ? "No immediate abnormal turbine behavior detected."
                : "AI has detected a potential abnormal operating condition."}
            </p>
          </div>
        </div>

        <div className="alert-count">
          {turbine.prediction}
        </div>

      </div>

    </div>
  );
}

export default Turbines;