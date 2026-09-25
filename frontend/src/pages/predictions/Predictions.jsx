import { useEffect, useState } from "react";
import axios from "axios";
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Gauge,
  Wind,
  Thermometer,
  Waves,
  Volume2,
  Zap,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

function Predictions() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const fetchPrediction = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/predictions/latest"
      );

      setPrediction(response.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the AI prediction service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();

    const interval = setInterval(fetchPrediction, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-slate-600">
            Loading AI prediction intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-red-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />

          <h2 className="text-2xl font-bold text-slate-800 mt-4">
            AI Prediction Unavailable
          </h2>

          <p className="text-slate-500 mt-2">{error}</p>

          <button
            onClick={fetchPrediction}
            className="mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sensor = prediction?.sensor_data || {};

  const isFault = prediction?.prediction === "FAULT";
  const riskHigh = prediction?.risk_level === "HIGH";

  const anomalyScore = Number(prediction?.anomaly_score || 0);
  const threshold = 10;

  const scorePercentage = Math.min(
    (anomalyScore / threshold) * 100,
    100
  );

  const predictionColor = isFault
    ? "from-red-500 to-rose-600"
    : "from-emerald-500 to-green-600";

  const riskColor = riskHigh
    ? "from-red-500 to-orange-500"
    : "from-blue-500 to-indigo-600";

  const scoreColor = isFault
    ? "from-red-500 to-orange-500"
    : "from-emerald-500 to-teal-600";

  const confidence = Math.round(
    (prediction?.confidence || 0) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 md:p-7">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  AI Prediction Intelligence
                </h1>

                <p className="text-slate-500 mt-1">
                  Real-time machine-learning based turbine condition prediction
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>

                <span className="text-sm font-semibold text-slate-700">
                  AI Engine Online
                </span>
              </div>

              <button
                onClick={fetchPrediction}
                className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"
                title="Refresh prediction"
              >
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </button>

            </div>
          </div>
        </div>


        {/* TOP PREDICTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-7">

          {/* Prediction */}
          <div
            className={`bg-gradient-to-br ${predictionColor} rounded-3xl p-6 text-white shadow-xl`}
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-white/80 text-sm font-medium">
                  ML Prediction
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {prediction?.prediction}
                </h2>
              </div>

              {isFault ? (
                <AlertTriangle className="w-12 h-12 text-white/90" />
              ) : (
                <ShieldCheck className="w-12 h-12 text-white/90" />
              )}

            </div>

            <p className="mt-5 text-sm text-white/80">
              Current AI classification of turbine operating condition
            </p>
          </div>


          {/* Confidence */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  AI Confidence
                </p>

                <h2 className="text-4xl font-bold text-blue-700 mt-3">
                  {confidence}%
                </h2>
              </div>

              <Target className="w-12 h-12 text-blue-500" />

            </div>

            <div className="mt-5">
              <div className="w-full bg-slate-200 rounded-full h-3">

                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                ></div>

              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Current detector output confidence indicator
            </p>
          </div>


          {/* Risk */}
          <div
            className={`bg-gradient-to-br ${riskColor} rounded-3xl p-6 text-white shadow-xl`}
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="text-white/80 text-sm">
                  Risk Assessment
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {prediction?.risk_level}
                </h2>
              </div>

              <Gauge className="w-12 h-12 text-white/90" />

            </div>

            <p className="mt-5 text-sm text-white/80">
              AI-estimated operational risk level
            </p>

          </div>


          {/* Anomaly Score */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-red-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Anomaly Score
                </p>

                <h2
                  className={`text-4xl font-bold mt-3 ${
                    isFault
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {anomalyScore.toFixed(2)}
                </h2>
              </div>

              <TrendingUp
                className={`w-12 h-12 ${
                  isFault
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              />

            </div>

            <div className="mt-5">

              <div className="w-full bg-slate-200 rounded-full h-3">

                <div
                  className={`bg-gradient-to-r ${scoreColor} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>

              </div>

            </div>

            <p className="text-xs text-slate-500 mt-3">
              Detection threshold: {threshold}
            </p>

          </div>

        </div>


        {/* DETECTOR STATUS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-7">

          <div className="flex items-center gap-3 mb-6">

            <Activity className="w-7 h-7 text-indigo-600" />

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Anomaly Detection Status
              </h2>

              <p className="text-sm text-slate-500">
                Current output from the CARE sensor anomaly detector
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">

              <p className="text-sm text-slate-500">
                Anomaly Score
              </p>

              <p className="text-3xl font-bold text-indigo-700 mt-2">
                {anomalyScore.toFixed(2)}
              </p>

            </div>


            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">

              <p className="text-sm text-slate-500">
                Detection Threshold
              </p>

              <p className="text-3xl font-bold text-blue-700 mt-2">
                {threshold.toFixed(2)}
              </p>

            </div>


            <div
              className={`rounded-2xl p-5 border ${
                isFault
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >

              <p className="text-sm text-slate-500">
                Detector Decision
              </p>

              <p
                className={`text-3xl font-bold mt-2 ${
                  isFault
                    ? "text-red-700"
                    : "text-emerald-700"
                }`}
              >
                {isFault ? "ANOMALY" : "NORMAL"}
              </p>

            </div>

          </div>

        </div>


        {/* TURBINE INFORMATION */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-7">

          <div className="flex items-center gap-3 mb-6">

            <Activity className="w-7 h-7 text-blue-600" />

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Prediction Context
              </h2>

              <p className="text-sm text-slate-500">
                Turbine information used by the AI monitoring pipeline
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">

              <p className="text-sm text-slate-500">
                Turbine ID
              </p>

              <p className="text-2xl font-bold text-blue-700 mt-2">
                {prediction?.turbine_id}
              </p>

            </div>


            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">

              <p className="text-sm text-slate-500">
                Prediction State
              </p>

              <p className="text-2xl font-bold text-indigo-700 mt-2">
                {prediction?.prediction}
              </p>

            </div>


            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">

              <p className="text-sm text-slate-500">
                Risk Level
              </p>

              <p className="text-2xl font-bold text-emerald-700 mt-2">
                {prediction?.risk_level}
              </p>

            </div>

          </div>

        </div>


        {/* SENSOR INPUTS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-7">

          <div className="flex items-center gap-3 mb-6">

            <Activity className="w-7 h-7 text-purple-600" />

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                AI Sensor Inputs
              </h2>

              <p className="text-sm text-slate-500">
                Latest telemetry used for condition prediction
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Wind */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-5 border border-blue-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Wind Speed
                </p>

                <Wind className="w-6 h-6 text-blue-600" />

              </div>

              <p className="text-2xl font-bold text-blue-700 mt-3">
                {sensor.wind_speed} m/s
              </p>

            </div>


            {/* Rotor */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-5 border border-indigo-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Rotor Speed
                </p>

                <Activity className="w-6 h-6 text-indigo-600" />

              </div>

              <p className="text-2xl font-bold text-indigo-700 mt-3">
                {sensor.rotor_speed} RPM
              </p>

            </div>


            {/* Gearbox */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-2xl p-5 border border-orange-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Gearbox Temperature
                </p>

                <Thermometer className="w-6 h-6 text-orange-600" />

              </div>

              <p className="text-2xl font-bold text-orange-700 mt-3">
                {sensor.gearbox_temperature}°C
              </p>

            </div>


            {/* Generator */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-5 border border-red-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Generator Temperature
                </p>

                <Thermometer className="w-6 h-6 text-red-600" />

              </div>

              <p className="text-2xl font-bold text-red-700 mt-3">
                {sensor.generator_temperature}°C
              </p>

            </div>


            {/* Vibration */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-5 border border-purple-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Vibration
                </p>

                <Waves className="w-6 h-6 text-purple-600" />

              </div>

              <p className="text-2xl font-bold text-purple-700 mt-3">
                {sensor.vibration} mm/s
              </p>

            </div>


            {/* Acoustic */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-100 rounded-2xl p-5 border border-cyan-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Acoustic Level
                </p>

                <Volume2 className="w-6 h-6 text-cyan-600" />

              </div>

              <p className="text-2xl font-bold text-cyan-700 mt-3">
                {sensor.acoustic_level} dB
              </p>

            </div>


            {/* Power */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-5 border border-green-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Power Output
                </p>

                <Zap className="w-6 h-6 text-green-600" />

              </div>

              <p className="text-2xl font-bold text-green-700 mt-3">
                {sensor.power_output} MW
              </p>

            </div>


            {/* Timestamp */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border border-slate-200">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-600">
                  Telemetry Time
                </p>

                <Clock className="w-6 h-6 text-slate-600" />

              </div>

              <p className="text-sm font-bold text-slate-700 mt-3 break-all">
                {sensor.timestamp
                  ? new Date(sensor.timestamp).toLocaleTimeString()
                  : "N/A"}
              </p>

            </div>

          </div>

        </div>


        {/* AI INTERPRETATION */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-xl p-6 md:p-7 text-white mb-7">

          <div className="flex items-center gap-3 mb-5">

            <Brain className="w-8 h-8" />

            <div>

              <h2 className="text-xl font-bold">
                AI Prediction Interpretation
              </h2>

              <p className="text-sm text-white/80">
                Automated interpretation of the current model output
              </p>

            </div>

          </div>


          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">

            {isFault ? (
              <>
                <h3 className="text-lg font-bold">
                  Potential turbine fault detected
                </h3>

                <p className="mt-2 text-white/85 leading-relaxed">
                  The CARE-based anomaly detector has classified the
                  latest turbine telemetry as an anomalous condition.
                  The anomaly score is above the configured detection
                  threshold. Immediate investigation of the relevant
                  operating parameters is recommended.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">
                  Turbine operating condition appears normal
                </h3>

                <p className="mt-2 text-white/85 leading-relaxed">
                  The CARE-based anomaly detector currently classifies
                  the turbine telemetry as NORMAL. The anomaly score is
                  below the configured detection threshold. Continue
                  real-time monitoring and observe changes in sensor
                  behaviour over time.
                </p>
              </>
            )}

          </div>

        </div>


        {/* LAST UPDATED */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pb-5">

          <Clock className="w-4 h-4" />

          Last updated:
          {lastUpdated
            ? lastUpdated.toLocaleTimeString()
            : "Loading..."}

        </div>

      </div>
    </div>
  );
}

export default Predictions;