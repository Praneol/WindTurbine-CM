import { useEffect, useState } from "react";
import AlertPanel from "../../components/AlertPanel";
import HardwareAI from "../../components/HardwareAI";

function Dashboard() {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/alerts/latest"
        );

        if (!response.ok) {
          throw new Error("Alert API failed");
        }

        const data = await response.json();
        setAlertData(data);
      } catch (error) {
        console.error("Dashboard alert error:", error);
      }
    };

    fetchAlert();

    const interval = setInterval(fetchAlert, 5000);

    return () => clearInterval(interval);
  }, []);

  const isAnomaly = alertData?.alert === true;
  const alertInfo = alertData?.data;

  return (
    <div className="dashboard-page">
      <h1>Real-Time Turbine Monitoring</h1>

      <div className="dashboard-grid">
        <div className="monitor-card">
          <h3>Wind Speed</h3>
          <p>12.4 m/s</p>
        </div>

        <div className="monitor-card">
          <h3>Rotor Speed</h3>
          <p>1450 RPM</p>
        </div>

        <div className="monitor-card">
          <h3>Gearbox Temp</h3>
          <p>54.2 °C</p>
        </div>

        <div className="monitor-card">
          <h3>Generator Temp</h3>
          <p>48.6 °C</p>
        </div>

        <div className="monitor-card">
          <h3>Vibration</h3>
          <p>0.0212</p>
        </div>

        <div className="monitor-card">
          <h3>Acoustic Level</h3>
          <p>532 ADC</p>
        </div>

        <div className="monitor-card">
          <h3>Power Output</h3>
          <p>82.5 kW</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Vibration Trend</h2>
      </div>

      <div className="chart-section">
        <h2>Wind Speed Trend</h2>
      </div>

      <div className="chart-section">
        <h2>Gearbox Temperature Trend</h2>
      </div>

      <div className="ai-section">
        <h2>AI-Powered Turbine Condition</h2>

        <HardwareAI />

        <AlertPanel />

        <div className="alert-panel">
          <h2>System Status</h2>

          {isAnomaly ? (
            <>
              <h3>⚠️ ANOMALY DETECTED</h3>

              <p>
                WT-001 has detected unusual hardware sensor behavior.
              </p>

              <p>
                <strong>Risk Level:</strong>{" "}
                {alertInfo?.risk_level || "MEDIUM"}
              </p>

              <p>
                <strong>Anomaly Score:</strong>{" "}
                {Number(alertInfo?.anomaly_score || 0).toFixed(4)}
              </p>

              <p>
                <strong>Recommended Action:</strong>{" "}
                {alertInfo?.recommended_action ||
                  "Continue monitoring subsequent sensor observations."}
              </p>
            </>
          ) : (
            <>
              <h3>✅ SYSTEM ONLINE</h3>

              <p>
                WT-001 is operating normally. No immediate inspection
                required.
              </p>

              <p>
                <strong>Risk Level:</strong> LOW
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;