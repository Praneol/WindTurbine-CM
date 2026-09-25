import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function DigitalTwin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadTwin = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/snapshot`
      );

      setData(response.data);
      setError("");
    } catch (err) {
      setError("Unable to connect to the turbine backend.");
    }
  };

  useEffect(() => {
    loadTwin();

    const interval = setInterval(loadTwin, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="dashboard">
        <div className="panel">
          <h1>Digital Twin</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard">
        <div className="panel">
          <h1>Digital Twin</h1>
          <p>Loading virtual turbine...</p>
        </div>
      </div>
    );
  }

  const sensor = data.sensor_data;
  const prediction = data.prediction;
  const health = data.health;
  const maintenance = data.maintenance;

  const isFault = prediction.prediction === "FAULT";
  const isHighRisk = prediction.risk_level === "HIGH";

  const componentStatus = isFault ? "ATTENTION REQUIRED" : "HEALTHY";

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="panel">
        <h1>Digital Twin</h1>

        <p>
          Live virtual representation of wind turbine{" "}
          <strong>{data.turbine_id}</strong>
        </p>

        <p>
          ● Live synchronization active
        </p>
      </div>


      {/* =====================================================
          EXECUTIVE STATUS
      ====================================================== */}

      <div className="metric-grid">

        <div className="panel">
          <h3>Turbine</h3>
          <h2>{data.turbine_id}</h2>
        </div>

        <div className="panel">
          <h3>AI Condition</h3>
          <h2>{prediction.prediction}</h2>
        </div>

        <div className="panel">
          <h3>Health Score</h3>
          <h2>{health.health_score}%</h2>
        </div>

        <div className="panel">
          <h3>Risk Level</h3>
          <h2>{prediction.risk_level}</h2>
        </div>

      </div>


      {/* =====================================================
          VIRTUAL TURBINE
      ====================================================== */}

      <div className="panel">

        <h2>Virtual Turbine Model</h2>

        <div
          style={{
            minHeight: "430px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            borderRadius: "16px",
            marginTop: "20px",
            background:
              "linear-gradient(180deg, #07111f 0%, #0d1b2a 55%, #152a3a 100%)"
          }}
        >

          {/* WIND */}

          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "35px",
              fontSize: "28px",
              opacity: 0.7
            }}
          >
            ≋ ≋ ≋
          </div>

          <div
            style={{
              position: "absolute",
              top: "95px",
              right: "45px",
              fontSize: "24px",
              opacity: 0.6
            }}
          >
            ≋ ≋ ≋
          </div>


          {/* TURBINE */}

          <div
            style={{
              position: "relative",
              width: "300px",
              height: "360px"
            }}
          >

            {/* ROTOR */}

            <div
              style={{
                position: "absolute",
                top: "35px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "190px",
                height: "190px",
                animation: "spin 5s linear infinite"
              }}
            >

              <div
                style={{
                  position: "absolute",
                  left: "91px",
                  top: "20px",
                  width: "8px",
                  height: "75px",
                  background: "#e7edf3",
                  borderRadius: "8px",
                  transformOrigin: "bottom center",
                  transform: "rotate(0deg)"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "91px",
                  top: "20px",
                  width: "8px",
                  height: "75px",
                  background: "#e7edf3",
                  borderRadius: "8px",
                  transformOrigin: "bottom center",
                  transform: "rotate(120deg)"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "91px",
                  top: "20px",
                  width: "8px",
                  height: "75px",
                  background: "#e7edf3",
                  borderRadius: "8px",
                  transformOrigin: "bottom center",
                  transform: "rotate(240deg)"
                }}
              />

              {/* HUB */}

              <div
                style={{
                  position: "absolute",
                  left: "78px",
                  top: "78px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#d7e2ec",
                  border: "5px solid #71879a",
                  zIndex: 5
                }}
              />

            </div>


            {/* NACELLE */}

            <div
              style={{
                position: "absolute",
                top: "112px",
                left: "133px",
                width: "110px",
                height: "50px",
                borderRadius: "35px 18px 18px 35px",
                background: "#c7d2dc",
                boxShadow: isFault
                  ? "0 0 25px rgba(255,80,80,0.8)"
                  : "0 0 18px rgba(100,180,255,0.3)"
              }}
            />

            {/* TOWER */}

            <div
              style={{
                position: "absolute",
                top: "155px",
                left: "163px",
                width: "50px",
                height: "190px",
                background:
                  "linear-gradient(90deg, #aab8c4, #edf2f5, #aab8c4)",
                clipPath:
                  "polygon(22% 0, 78% 0, 100% 100%, 0 100%)"
              }}
            />

            {/* BASE */}

            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "125px",
                width: "125px",
                height: "18px",
                borderRadius: "50%",
                background: "#71808d"
              }}
            />

          </div>


          {/* STATUS LABEL */}

          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "10px 16px",
              borderRadius: "20px",
              background: isFault
                ? "rgba(180,30,30,0.25)"
                : "rgba(30,150,90,0.25)",
              border: isFault
                ? "1px solid rgba(255,80,80,0.5)"
                : "1px solid rgba(80,220,140,0.5)"
            }}
          >
            {isFault ? "⚠ FAULT DETECTED" : "● TURBINE HEALTHY"}
          </div>

          {/* WIND SPEED */}

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px"
            }}
          >
            <strong>Wind</strong>
            <br />
            {sensor.wind_speed} m/s
          </div>

          {/* ROTOR SPEED */}

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px"
            }}
          >
            <strong>Rotor</strong>
            <br />
            {sensor.rotor_speed} RPM
          </div>

        </div>

      </div>


      {/* =====================================================
          COMPONENT HEALTH
      ====================================================== */}

      <div className="panel">

        <h2>Component Condition</h2>

        <div className="metric-grid">

          <div>
            <strong>Rotor</strong>
            <p>{componentStatus}</p>
          </div>

          <div>
            <strong>Gearbox</strong>
            <p>{sensor.gearbox_temperature} °C</p>
          </div>

          <div>
            <strong>Generator</strong>
            <p>{sensor.generator_temperature} °C</p>
          </div>

          <div>
            <strong>Vibration System</strong>
            <p>{sensor.vibration}</p>
          </div>

          <div>
            <strong>Acoustic System</strong>
            <p>{sensor.acoustic_level} dB</p>
          </div>

          <div>
            <strong>Power System</strong>
            <p>{sensor.power_output} MW</p>
          </div>

        </div>

      </div>


      {/* =====================================================
          LIVE TELEMETRY
      ====================================================== */}

      <div className="panel">

        <h2>Live Digital Twin Telemetry</h2>

        <div className="metric-grid">

          <div>
            <strong>Wind Speed</strong>
            <p>{sensor.wind_speed} m/s</p>
          </div>

          <div>
            <strong>Rotor Speed</strong>
            <p>{sensor.rotor_speed} RPM</p>
          </div>

          <div>
            <strong>Gearbox Temperature</strong>
            <p>{sensor.gearbox_temperature} °C</p>
          </div>

          <div>
            <strong>Generator Temperature</strong>
            <p>{sensor.generator_temperature} °C</p>
          </div>

          <div>
            <strong>Vibration</strong>
            <p>{sensor.vibration}</p>
          </div>

          <div>
            <strong>Acoustic Level</strong>
            <p>{sensor.acoustic_level} dB</p>
          </div>

          <div>
            <strong>Power Output</strong>
            <p>{sensor.power_output} MW</p>
          </div>

        </div>

      </div>


      {/* =====================================================
          AI INTELLIGENCE
      ====================================================== */}

      <div className="panel">

        <h2>AI Digital Twin Intelligence</h2>

        <div className="metric-grid">

          <div>
            <strong>Prediction</strong>
            <p>{prediction.prediction}</p>
          </div>

          <div>
            <strong>Risk Level</strong>
            <p>{prediction.risk_level}</p>
          </div>

          <div>
            <strong>Anomaly Score</strong>
            <p>{prediction.anomaly_score}</p>
          </div>

          <div>
            <strong>AI Confidence</strong>
            <p>
              {(prediction.confidence * 100).toFixed(1)}%
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          MAINTENANCE
      ====================================================== */}

      <div className="panel">

        <h2>Predictive Maintenance</h2>

        <p>
          <strong>Status:</strong>{" "}
          {maintenance.maintenance_status}
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          {maintenance.priority}
        </p>

        <p>
          <strong>Recommended Action:</strong>{" "}
          {maintenance.recommended_action}
        </p>

        <p>
          <strong>Inspection:</strong>{" "}
          {maintenance.estimated_days === 0
            ? "Immediately"
            : `Within ${maintenance.estimated_days} days`
          }
        </p>

      </div>


      {/* =====================================================
          DIGITAL TWIN SYSTEM STATUS
      ====================================================== */}

      <div className="panel">

        <h2>Digital Twin System Status</h2>

        <p>● Sensor synchronization: ACTIVE</p>

        <p>● AI prediction engine: ACTIVE</p>

        <p>● Health monitoring: ACTIVE</p>

        <p>● Alert intelligence: ACTIVE</p>

        <p>● Predictive maintenance: ACTIVE</p>

        <p>● Refresh interval: 5 seconds</p>

        {isHighRisk && (
          <p>
            ⚠ High-risk condition detected by AI.
          </p>
        )}

      </div>


      {/* =====================================================
          ROTOR ANIMATION
      ====================================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: translateX(-50%) rotate(0deg);
            }

            to {
              transform: translateX(-50%) rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}

export default DigitalTwin;