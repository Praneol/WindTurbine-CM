import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Alerts() {
  const [hasAlert, setHasAlert] = useState(false);

  useEffect(() => {
    const loadAlert = async () => {
      try {
        const response = await fetch(`${API}/api/alerts/latest`);

        if (response.ok) {
          const data = await response.json();
          setHasAlert(data?.alert === true);
        }
      } catch (error) {
        console.error("Alert error:", error);
      }
    };

    loadAlert();

    const interval = setInterval(loadAlert, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h2>Alerts</h2>
          <p>Wind turbine alert monitoring</p>
        </div>
      </div>

      <div className="panel">
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <h1
            style={{
              color: hasAlert ? "#dc2626" : "#16a34a",
              fontSize: "32px",
            }}
          >
            {hasAlert ? "🔴 ALERT DETECTED" : "🟢 NO ALERT"}
          </h1>

          <p>
            {hasAlert
              ? "The system has detected an alert."
              : "The turbine is operating normally."}
          </p>
        </div>
      </div>

    </div>
  );
}

export default Alerts;