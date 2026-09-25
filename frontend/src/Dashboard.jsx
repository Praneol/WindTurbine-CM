
import { useEffect, useState } from "react";

import {
  Wind,
  Gauge,
  Thermometer,
  Activity,
  Volume2,
  Zap,
  Brain,
  ShieldCheck,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getLatestSensorData,
  getTurbineStatus,
  getSensorHistory,
  getLatestAlert,
} from "../../services/api";

function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [turbineStatus, setTurbineStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sensors = await getLatestSensorData();
        const status = await getTurbineStatus();
        const sensorHistory = await getSensorHistory();
        const latestAlert = await getLatestAlert();

        setSensorData(sensors);
        setTurbineStatus(status);
        setHistory(sensorHistory);
        setAlertData(latestAlert);
      } catch (error) {
        console.error("API connection error:", error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!sensorData || !turbineStatus) {
    return (
      <div className="dashboard">
        <div className="panel">
          <h3>Connecting to Wind Intelligence System...</h3>
          <p>Waiting for live turbine data.</p>
        </div>
      </div>
    );
  }

  const vibrationChartData = [...history]
    .reverse()
    .map((reading, index) => ({
      reading: index + 1,
      vibration: reading.vibration,
    }));

  const windSpeedChartData = [...history]
    .reverse()
    .map((reading, index) => ({
      reading: index + 1,
      windSpeed: reading.wind_speed,
    }));

  const gearboxTemperatureChartData = [...history]
    .reverse()
    .map((reading, index) => ({
      reading: index + 1,
      gearboxTemperature: reading.gearbox_temperature,
    }));

  const aiStatusClass =
    "ai-status " + turbineStatus.status.toLowerCase();

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h2>Wind Turbine Intelligence</h2>
          <p>
            AI-powered condition monitoring and operational intelligence
          </p>
        </div>

        <div className="turbine-selector">
          <Wind size={16} />
          Turbine {turbineStatus.turbine_id}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Real-Time Turbine Monitoring</h3>
            <p>
              Live monitoring of critical turbine operating parameters
            </p>
          </div>

          <Activity size={20} />
        </div>

        <div className="metric-grid">

          <div className="metric-card">
            <div className="metric-icon">
              <Wind size={21} />
            </div>
            <span>Wind Speed</span>
            <strong>{sensorData.wind_speed} m/s</strong>
            <small>Live measurement</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Gauge size={21} />
            </div>
            <span>Rotor Speed</span>
            <strong>{sensorData.rotor_speed} RPM</strong>
            <small>Live measurement</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Thermometer size={21} />
            </div>
            <span>Gearbox Temperature</span>
            <strong>{sensorData.gearbox_temperature} °C</strong>
            <small>Thermal monitoring</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Thermometer size={21} />
            </div>
            <span>Generator Temperature</span>
            <strong>{sensorData.generator_temperature} °C</strong>
            <small>Thermal monitoring</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Activity size={21} />
            </div>
            <span>Vibration</span>
            <strong>{sensorData.vibration} mm/s</strong>
            <small>Condition monitoring</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Volume2 size={21} />
            </div>
            <span>Acoustic Level</span>
            <strong>{sensorData.acoustic_level} dB</strong>
            <small>Acoustic monitoring</small>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Zap size={21} />
            </div>
            <span>Power Output</span>
            <strong>{sensorData.power_output} MW</strong>
            <small>Live generation</small>
          </div>

        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Vibration Trend</h3>
            <p>Recent vibration measurements from the turbine</p>
          </div>

          <Activity size={20} />
        </div>

        <div style={{ width: "100%", height: "300px" }}>
          {vibrationChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={vibrationChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="reading"
                  label={{
                    value: "Recent Readings",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  label={{
                    value: "Vibration (mm/s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="vibration"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>Waiting for vibration history...</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Wind Speed Trend</h3>
            <p>Recent wind speed measurements from the turbine</p>
          </div>

          <Wind size={20} />
        </div>

        <div style={{ width: "100%", height: "300px" }}>
          {windSpeedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={windSpeedChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="reading"
                  label={{
                    value: "Recent Readings",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  label={{
                    value: "Wind Speed (m/s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>Waiting for wind speed history...</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Gearbox Temperature Trend</h3>
            <p>Recent gearbox thermal measurements from the turbine</p>
          </div>

          <Thermometer size={20} />
        </div>

        <div style={{ width: "100%", height: "300px" }}>
          {gearboxTemperatureChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={gearboxTemperatureChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="reading"
                  label={{
                    value: "Recent Readings",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  label={{
                    value: "Temperature (°C)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="gearboxTemperature"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>Waiting for gearbox temperature history...</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>AI-Powered Turbine Condition</h3>
            <p>
              Intelligent assessment of overall turbine operating condition
            </p>
          </div>

          <Brain size={20} />
        </div>

        <div className={aiStatusClass}>
          <ShieldCheck size={24} />

          <div>
            <strong>{turbineStatus.status}</strong>

            <span>
              AI-based turbine condition assessment •{" "}
              {turbineStatus.risk_level} risk
            </span>
          </div>
        </div>

        <div className="ai-score">
          <span>Overall Turbine Health</span>
          <strong>{turbineStatus.health_score}%</strong>
        </div>

        <div className="risk-bar">
          <div
            style={{
              width: turbineStatus.health_score + "%",
            }}
          ></div>
        </div>
      </div>

      <div className="alert-panel">
        <div>
          <Activity size={20} />

          <div>
            <h3>System Status</h3>

            <p>
              {alertData && alertData.alert
                ? alertData.data.message
                : "Live sensor acquisition and turbine monitoring are active"}
            </p>
          </div>
        </div>

        <div className="alert-count">
          {alertData && alertData.alert
            ? alertData.data.severity + " ALERT"
            : "System Online"}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;

