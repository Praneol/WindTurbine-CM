
import { useEffect, useState } from "react";
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Gauge,
  Thermometer,
  Wind,
  Radio,
  Wrench,
} from "lucide-react";

import { getDashboardSnapshot } from "../../services/api";

function AIHealth() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHealth = async () => {
    try {
      const snapshot = await getDashboardSnapshot();

      setData(snapshot);

      setHistory((previous) => {
        const next = [
          ...previous,
          {
            time: new Date().toLocaleTimeString(),
            score: snapshot.health.health_score,
          },
        ];

        return next.slice(-20);
      });
    } catch (error) {
      console.error("AI Health API error:", error);
    }
  };

  useEffect(() => {
    loadHealth();

    const interval = setInterval(loadHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-pulse" />
          <p className="text-slate-600">
            Loading AI health assessment...
          </p>
        </div>
      </div>
    );
  }

  const healthScore = data.health.health_score;
  const prediction = data.prediction;
  const sensor = data.sensor_data;

  const getHealthColor = () => {
    if (healthScore >= 85) return "text-emerald-600";
    if (healthScore >= 65) return "text-amber-600";
    return "text-red-600";
  };

  const getHealthBackground = () => {
    if (healthScore >= 85) return "bg-emerald-50";
    if (healthScore >= 65) return "bg-amber-50";
    return "bg-red-50";
  };

  /*
   * IMPORTANT:
   * Hardware AI uses NORMAL / ANOMALY.
   * It does not use FAULT.
   */
  const getRecommendation = () => {
    if (prediction.prediction === "ANOMALY") {
      return {
        title: "Unusual sensor behaviour detected",
        message:
          "The hardware AI has detected sensor behaviour outside the learned normal baseline. Continue monitoring subsequent observations; this alone does not confirm a mechanical fault.",
        icon: AlertTriangle,
      };
    }

    return {
      title: "Continue normal operation",
      message:
        "Current hardware sensor patterns are within the learned normal baseline. Continue normal operation and routine monitoring.",
      icon: ShieldCheck,
    };
  };

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="min-h-screen bg-sky-50 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">

          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <BrainCircuit size={28} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              AI Health Intelligence
            </h1>

            <p className="text-slate-500">
              AI-powered condition assessment and predictive monitoring
            </p>
          </div>

        </div>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Health score */}
        <div
          className={`${getHealthBackground()} rounded-2xl p-6 border border-slate-200`}
        >

          <div className="flex items-center justify-between mb-4">

            <div>
              <p className="text-sm text-slate-500">
                AI Health Score
              </p>

              <h2 className={`text-5xl font-bold ${getHealthColor()}`}>
                {healthScore}%
              </h2>
            </div>

            <Gauge
              size={48}
              className={getHealthColor()}
            />

          </div>

          <div className="w-full bg-white rounded-full h-3">

            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(0, Math.min(100, healthScore))}%`,
              }}
            />

          </div>

          <p className="mt-3 font-semibold text-slate-700">
            {data.health.condition}
          </p>

        </div>

        {/* ML prediction */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

          <div className="flex items-center gap-3 mb-5">
            <BrainCircuit className="text-purple-600" />

            <h2 className="font-semibold text-slate-800">
              ML Prediction
            </h2>
          </div>

          <p className="text-3xl font-bold text-slate-800">
            {prediction.prediction}
          </p>

          <div className="mt-4 flex justify-between">

            <span className="text-slate-500">
              Confidence
            </span>

            <span className="font-bold text-blue-600">
              {prediction.confidence !== undefined
                ? `${(prediction.confidence * 100).toFixed(1)}%`
                : "N/A"}
            </span>

          </div>

          <div className="mt-3 flex justify-between">

            <span className="text-slate-500">
              Risk level
            </span>

            <span className="font-semibold">
              {prediction.risk_level}
            </span>

          </div>

        </div>

        {/* Operating state */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

          <div className="flex items-center gap-3 mb-5">

            <Activity className="text-emerald-600" />

            <h2 className="font-semibold text-slate-800">
              Operating Intelligence
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-slate-500">
                Turbine
              </span>

              <span className="font-semibold">
                {data.turbine_id}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Condition
              </span>

              <span className="font-semibold">
                {data.health.condition}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Risk
              </span>

              <span className="font-semibold">
                {data.health.risk_level}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Sensor intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <Radio className="text-blue-600" />

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Sensor Intelligence
            </h2>

            <p className="text-sm text-slate-500">
              Current operating signals used by the AI monitoring layer
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <div className="bg-sky-50 rounded-xl p-4">

            <Wind className="text-blue-600 mb-2" size={20} />

            <p className="text-xs text-slate-500">
              Wind Speed
            </p>

            <p className="text-xl font-bold">
              {sensor.wind_speed}
            </p>

            <span className="text-xs text-slate-500">
              m/s
            </span>

          </div>

          <div className="bg-sky-50 rounded-xl p-4">

            <Activity className="text-purple-600 mb-2" size={20} />

            <p className="text-xs text-slate-500">
              Rotor Speed
            </p>

            <p className="text-xl font-bold">
              {sensor.rotor_speed}
            </p>

            <span className="text-xs text-slate-500">
              RPM
            </span>

          </div>

          <div className="bg-sky-50 rounded-xl p-4">

            <Thermometer
              className="text-orange-600 mb-2"
              size={20}
            />

            <p className="text-xs text-slate-500">
              Gearbox
            </p>

            <p className="text-xl font-bold">
              {sensor.gearbox_temperature}
            </p>

            <span className="text-xs text-slate-500">
              °C
            </span>

          </div>

          <div className="bg-sky-50 rounded-xl p-4">

            <Thermometer
              className="text-red-500 mb-2"
              size={20}
            />

            <p className="text-xs text-slate-500">
              Generator
            </p>

            <p className="text-xl font-bold">
              {sensor.generator_temperature}
            </p>

            <span className="text-xs text-slate-500">
              °C
            </span>

          </div>

          <div className="bg-sky-50 rounded-xl p-4">

            <Activity
              className="text-indigo-600 mb-2"
              size={20}
            />

            <p className="text-xs text-slate-500">
              Vibration
            </p>

            <p className="text-xl font-bold">
              {sensor.vibration}
            </p>

            <span className="text-xs text-slate-500">
              mm/s
            </span>

          </div>

          <div className="bg-sky-50 rounded-xl p-4">

            <Radio
              className="text-teal-600 mb-2"
              size={20}
            />

            <p className="text-xs text-slate-500">
              Acoustic
            </p>

            <p className="text-xl font-bold">
              {sensor.acoustic_level}
            </p>

            <span className="text-xs text-slate-500">
              dB
            </span>

          </div>

        </div>

      </div>

      {/* Trend + anomaly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Health trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">

            <TrendingUp className="text-blue-600" />

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Health Trend
              </h2>

              <p className="text-sm text-slate-500">
                Recent AI health assessments
              </p>

            </div>

          </div>

          <div className="flex items-end gap-2 h-48">

            {history.map((item, index) => (

              <div
                key={index}
                className="flex-1 flex flex-col justify-end items-center"
              >

                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(
                      Math.min(item.score, 100),
                      5
                    )}%`,
                  }}
                  title={`${item.score}%`}
                />

                <span className="text-[9px] text-slate-400 mt-1">
                  {item.time.slice(0, 5)}
                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Anomaly analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">

            <AlertTriangle
              className={
                data.alert.active
                  ? "text-amber-500"
                  : "text-emerald-500"
              }
            />

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Anomaly Analysis
              </h2>

              <p className="text-sm text-slate-500">
                AI interpretation of current turbine state
              </p>

            </div>

          </div>

          <div
            className={`rounded-xl p-5 ${
              data.alert.active
                ? "bg-amber-50"
                : "bg-emerald-50"
            }`}
          >

            <p className="font-bold text-lg text-slate-800">

              {data.alert.active
                ? "Potential abnormal behaviour"
                : "No significant anomaly detected"}

            </p>

            <p className="text-sm text-slate-600 mt-2">
              {data.alert.message}
            </p>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">

            <div className="bg-slate-50 rounded-xl p-4">

              <p className="text-xs text-slate-500">
                Model confidence
              </p>

              <p className="text-xl font-bold">

                {prediction.confidence !== undefined
                  ? `${(prediction.confidence * 100).toFixed(1)}%`
                  : "N/A"}

              </p>

            </div>

            <div className="bg-slate-50 rounded-xl p-4">

              <p className="text-xs text-slate-500">
                Current risk
              </p>

              <p className="text-xl font-bold">
                {prediction.risk_level}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Recommendation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex items-start gap-4">

          <div className="p-3 bg-blue-50 rounded-xl">

            <RecommendationIcon
              className="text-blue-600"
              size={28}
            />

          </div>

          <div>

            <p className="text-sm text-slate-500">
              AI Maintenance Recommendation
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-1">
              {recommendation.title}
            </h2>

            <p className="text-slate-600 mt-2">
              {recommendation.message}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AIHealth;

