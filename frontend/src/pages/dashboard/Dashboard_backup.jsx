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
  getDashboardSnapshot,
  getSensorHistory,
} from "../../services/api";


function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [turbineStatus, setTurbineStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertData, setAlertData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);

  
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboard = await getDashboardSnapshot();
        const sensorHistory = await getSensorHistory();

        setSensorData(dashboard.sensor_data);

        setTurbineStatus({
          turbine_id: dashboard.turbine_id,
          status: dashboard.health.condition,
          health_score: dashboard.health.health_score,
          risk_level: dashboard.health.risk_level,
        });

        setHistory(sensorHistory);

        setPredictionData({
          prediction: dashboard.prediction.prediction,
          risk_level: dashboard.prediction.risk_level,
          confidence: dashboard.prediction.confidence,
        });

        setAlertData({
          alert: dashboard.alert.active,
          data: {
            turbine_id: dashboard.turbine_id,
            severity: dashboard.alert.severity,
            risk_level: dashboard.alert.risk_level,
            health_score: dashboard.health.health_score,
            message: dashboard.alert.message,
            acknowledged: dashboard.alert.acknowledged,
            prediction: dashboard.prediction.prediction,
            confidence: dashboard.prediction.confidence,
            sensor_data: dashboard.sensor_data,
          },
        });
      } catch (error) {
        console.error("API connection error:", error);
      }
    };

    loadDashboard();

    const interval = setInterval(loadDashboard, 5000);

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

      {/* HEADER */}
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


      {/* REAL-TIME MONITORING */}
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


      {/* VIBRATION CHART */}
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


      {/* WIND SPEED CHART */}
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


      {/* GEARBOX TEMPERATURE CHART */}
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


      {/* TURBINE CONDITION */}
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
              width: `${turbineStatus.health_score}%`,
            }}
          />

        </div>

      </div>


      {/* REAL ML PREDICTION */}
      <div className="panel">

        <div className="panel-header">

          <div>

            <h3>AI Prediction & Risk Intelligence</h3>

            <p>
              Real-time Random Forest assessment of potential turbine condition
            </p>

          </div>

          <Brain size={20} />

        </div>


        {predictionData ? (

          <div>

            <div className="ai-status">

              <Brain size={24} />

              <div>

                <strong>{predictionData.prediction}</strong>

                <span>
                  ML prediction •{" "}
                  {(predictionData.confidence * 100).toFixed(0)}% confidence
                </span>

              </div>

            </div>


            <div className="ai-score">

              <span>Predicted Risk Level</span>

              <strong>{predictionData.risk_level}</strong>

            </div>


            <div className="risk-bar">

              <div
                style={{
                  width:
                    predictionData.risk_level === "HIGH"
                      ? "100%"
                      : predictionData.risk_level === "MEDIUM"
                      ? "60%"
                      : "25%",
                }}
              />

            </div>

          </div>

        ) : (

          <p>Waiting for AI prediction...</p>

        )}

      </div>


      {/* SYSTEM STATUS */}
      <div className="alert-panel">

        <div>

          <Activity size={20} />

          <div>

            <h3>System Status</h3>

            <p>
              {alertData?.data?.message ||
                "Live sensor acquisition and turbine monitoring are active"}
            </p>

          </div>

        </div>


        <div className="alert-count">

          {alertData?.data?.severity === "NORMAL"
            ? "System Online"
            : `${alertData?.data?.severity || "UNKNOWN"} ALERT`}

        </div>

      </div>

    </div>
  );
}


export default Dashboard;
