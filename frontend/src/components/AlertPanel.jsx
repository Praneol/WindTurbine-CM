import { useEffect, useState } from "react";
import {
  requestNotificationPermission
} from "../firebase";

const API_URL = "http://127.0.0.1:8000";

function AlertPanel() {
  const [alertData, setAlertData] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState("Not enabled");
  const [error, setError] = useState("");

  useEffect(() => {
    const enableNotifications = async () => {
      try {
        if (!("Notification" in window)) {
          setNotificationStatus("Notifications not supported");
          return;
        }

        const token = await requestNotificationPermission();

        if (token) {
          setNotificationStatus("Mobile notifications enabled");
          console.log("FCM TOKEN:", token);
        } else {
          setNotificationStatus("Notification permission not granted");
        }
      } catch (err) {
        console.error(err);
        setNotificationStatus("Notification setup failed");
      }
    };

    enableNotifications();

    const fetchAlert = async () => {
      try {
        const response = await fetch(`${API_URL}/api/alerts/latest`);

        if (!response.ok) {
          throw new Error("Alert API failed");
        }

        const data = await response.json();
        setAlertData(data);
        setError("");
      } catch (err) {
        console.error("Alert fetch error:", err);
        setError("Unable to connect to alert service.");
      }
    };

    fetchAlert();

    const interval = setInterval(fetchAlert, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="alert-panel">
        <h2>AI Alerts & Notifications</h2>
        <p>{error}</p>
      </div>
    );
  }

  const activeAlert = alertData?.alert === true;
  const data = alertData?.data;

  return (
    <div className="alert-panel">
      <h2>AI Alerts & Notifications</h2>

      {activeAlert ? (
        <div>
          <h3>⚠️ HARDWARE ALERT</h3>

          <p>
            <strong>Severity:</strong>{" "}
            {data?.severity || "WARNING"}
          </p>

          <p>
            <strong>Risk Level:</strong>{" "}
            {data?.risk_level || "MEDIUM"}
          </p>

          <p>
            <strong>Prediction:</strong>{" "}
            {data?.prediction || "ANOMALY"}
          </p>

          <p>
            <strong>Anomaly Score:</strong>{" "}
            {Number(data?.anomaly_score || 0).toFixed(4)}
          </p>

          <p>
            {data?.message ||
              "Unusual hardware sensor behavior detected."}
          </p>

          {data?.recommended_action && (
            <p>
              <strong>Recommended Action:</strong>{" "}
              {data.recommended_action}
            </p>
          )}

          {data?.inspection_type && (
            <p>
              <strong>Inspection:</strong>{" "}
              {data.inspection_type}
            </p>
          )}

          <p>
            <strong>Mobile Notification:</strong>{" "}
            {notificationStatus}
          </p>
        </div>
      ) : (
        <div>
          <h3>✅ SYSTEM NORMAL</h3>

          <p>
            {data?.message ||
              "No active hardware alert. Sensor behavior is within the learned normal baseline."}
          </p>

          <p>
            <strong>Risk Level:</strong>{" "}
            {data?.risk_level || "LOW"}
          </p>

          <p>
            <strong>Anomaly Score:</strong>{" "}
            {Number(data?.anomaly_score || 0).toFixed(4)}
          </p>

          <p>
            <strong>Notifications:</strong>{" "}
            {notificationStatus}
          </p>
        </div>
      )}
    </div>
  );
}

export default AlertPanel;