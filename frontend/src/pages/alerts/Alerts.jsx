import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Brain,
  Activity,
  Thermometer,
  Gauge,
  Wind,
  Volume2,
  Zap,
  Clock,
  Wrench,
  CheckCircle,
} from "lucide-react";

import {
  getLatestAlert,
  getAlertHistory,
} from "../../services/api";

function Alerts() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const latestResponse = await getLatestAlert();
      const historyResponse = await getAlertHistory();

      setLatest(latestResponse.data);
      setHistory(historyResponse.alerts || []);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !latest) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto" />

          <p className="mt-3 text-blue-700 font-semibold">
            Loading AI Risk Intelligence...
          </p>
        </div>
      </div>
    );
  }

  const sensor = latest.sensor_data || {};

  const isCritical =
    latest.severity === "CRITICAL" ||
    latest.prediction === "FAULT";

  const isWarning =
    latest.severity === "WARNING";

  let alertGradient =
    "from-emerald-500 via-green-500 to-teal-500";

  let alertIcon =
    <ShieldCheck className="w-10 h-10 text-white" />;

  let alertTitle =
    "System Operating Normally";

  if (isWarning) {
    alertGradient =
      "from-yellow-400 via-orange-400 to-amber-500";

    alertIcon =
      <AlertTriangle className="w-10 h-10 text-white" />;

    alertTitle =
      "Attention Required";
  }

  if (isCritical) {
    alertGradient =
      "from-red-600 via-red-500 to-orange-500";

    alertIcon =
      <AlertTriangle className="w-10 h-10 text-white" />;

    alertTitle =
      "Critical Turbine Alert";
  }

  const healthScore = Number(latest.health_score || 0);

  const healthColor =
    healthScore >= 85
      ? "bg-green-500"
      : healthScore >= 65
        ? "bg-yellow-400"
        : "bg-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 p-4 md:p-7">

      {/* HEADER */}

      <div className="mb-7">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">

              <AlertTriangle className="w-8 h-8 text-white" />

            </div>

            <div>

              <h1 className="text-3xl font-extrabold text-slate-800">
                Alerts & Risk
              </h1>

              <p className="text-slate-500 mt-1">
                AI-powered turbine risk intelligence
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-md border border-blue-200">

            <span className="relative flex h-3 w-3">

              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>

            </span>

            <span className="font-bold text-slate-700">
              Live Monitoring
            </span>

          </div>

        </div>

      </div>


      {/* MAIN ALERT */}

      <div
        className={`bg-gradient-to-r ${alertGradient} rounded-3xl p-6 md:p-8 shadow-xl mb-7 text-white`}
      >

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">

          <div className="flex items-start gap-5">

            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">

              {alertIcon}

            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-2xl md:text-3xl font-extrabold">
                  {alertTitle}
                </h2>

                <span className="px-4 py-1.5 bg-white text-slate-700 rounded-full text-xs font-extrabold shadow">
                  {latest.severity}
                </span>

              </div>

              <p className="mt-3 text-white/90 text-base max-w-2xl">
                {latest.message}
              </p>

              <div className="flex items-center gap-2 mt-5 text-sm text-white/90">

                <Clock className="w-4 h-4" />

                <span>
                  Live detection · {latest.turbine_id}
                </span>

              </div>

            </div>

          </div>


          {/* HEALTH SCORE */}

          <div className="bg-white rounded-3xl p-6 shadow-xl min-w-[260px]">

            <div className="flex items-center justify-between mb-3">

              <span className="font-bold text-slate-500">
                Health Score
              </span>

              <span className="text-3xl font-extrabold text-slate-800">
                {healthScore}%
              </span>

            </div>

            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">

              <div
                className={`h-full ${healthColor} rounded-full transition-all duration-700`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(healthScore, 100)
                  )}%`,
                }}
              ></div>

            </div>

            <div className="flex justify-between mt-3 text-xs">

              <span className="text-slate-400">
                Risk level
              </span>

              <span className="font-bold text-slate-700">
                {latest.risk_level}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">


        {/* RISK */}

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div className="relative">

            <div className="flex justify-between items-start">

              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">

                <ShieldCheck className="w-7 h-7" />

              </div>

              <span className="text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
                RISK
              </span>

            </div>

            <p className="mt-6 text-blue-100 font-medium">
              Risk Level
            </p>

            <h3 className="text-3xl font-extrabold mt-1">
              {latest.risk_level}
            </h3>

          </div>

        </div>


        {/* PREDICTION */}

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">

          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div className="relative">

            <div className="flex justify-between items-start">

              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">

                <Brain className="w-7 h-7" />

              </div>

              <span className="text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
                AI
              </span>

            </div>

            <p className="mt-6 text-purple-100 font-medium">
              ML Prediction
            </p>

            <h3 className="text-3xl font-extrabold mt-1">
              {latest.prediction}
            </h3>

          </div>

        </div>


        {/* CONFIDENCE */}

        <div className="relative overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">

          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div className="relative">

            <div className="flex justify-between items-start">

              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">

                <Activity className="w-7 h-7" />

              </div>

              <span className="text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
                CONFIDENCE
              </span>

            </div>

            <p className="mt-6 text-green-100 font-medium">
              AI Confidence
            </p>

            <h3 className="text-3xl font-extrabold mt-1">
              {(Number(latest.confidence || 0) * 100).toFixed(0)}%
            </h3>

          </div>

        </div>


        {/* ANOMALY SCORE */}

        <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white shadow-xl">

          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>

          <div className="relative">

            <div className="flex justify-between items-start">

              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">

                <Zap className="w-7 h-7" />

              </div>

              <span className="text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-full">
                AI SCORE
              </span>

            </div>

            <p className="mt-6 text-orange-100 font-medium">
              Anomaly Score
            </p>

            <h3 className="text-3xl font-extrabold mt-1">
              {latest.anomaly_score}
            </h3>

          </div>

        </div>

      </div>


      {/* AI RISK ANALYSIS */}

      <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border border-purple-200 p-6 md:p-7 mb-7">

        <div className="flex items-center gap-4 mb-7">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">

            <Brain className="w-7 h-7 text-white" />

          </div>

          <div>

            <h2 className="text-xl font-extrabold text-slate-800">
              AI Risk Analysis
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Real-time interpretation of turbine telemetry
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


          {/* WIND */}

          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-200 rounded-3xl p-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow">

                <Wind className="w-6 h-6 text-white" />

              </div>

              <div>

                <p className="font-bold text-slate-700">
                  Wind Speed
                </p>

                <p className="text-xs text-slate-500">
                  Environmental parameter
                </p>

              </div>

            </div>

            <p className="text-3xl font-extrabold text-blue-700 mt-5">
              {sensor.wind_speed} m/s
            </p>

          </div>


          {/* GEARBOX */}

          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-3xl p-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow">

                <Thermometer className="w-6 h-6 text-white" />

              </div>

              <div>

                <p className="font-bold text-slate-700">
                  Gearbox Temperature
                </p>

                <p className="text-xs text-slate-500">
                  Thermal parameter
                </p>

              </div>

            </div>

            <p className="text-3xl font-extrabold text-orange-600 mt-5">
              {sensor.gearbox_temperature}°C
            </p>

          </div>


          {/* VIBRATION */}

          <div className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-200 rounded-3xl p-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow">

                <Activity className="w-6 h-6 text-white" />

              </div>

              <div>

                <p className="font-bold text-slate-700">
                  Vibration
                </p>

                <p className="text-xs text-slate-500">
                  Mechanical parameter
                </p>

              </div>

            </div>

            <p className="text-3xl font-extrabold text-red-600 mt-5">
              {sensor.vibration} mm/s
            </p>

          </div>


          {/* ACOUSTIC */}

          <div className="bg-gradient-to-br from-purple-100 to-violet-100 border-2 border-purple-200 rounded-3xl p-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow">

                <Volume2 className="w-6 h-6 text-white" />

              </div>

              <div>

                <p className="font-bold text-slate-700">
                  Acoustic Level
                </p>

                <p className="text-xs text-slate-500">
                  Acoustic parameter
                </p>

              </div>

            </div>

            <p className="text-3xl font-extrabold text-purple-600 mt-5">
              {sensor.acoustic_level} dB
            </p>

          </div>

        </div>

      </div>


      {/* TURBINE SNAPSHOT */}

      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-xl p-6 md:p-7 mb-7 text-white">

        <div className="flex items-center gap-4 mb-7">

          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">

            <Gauge className="w-7 h-7" />

          </div>

          <div>

            <h2 className="text-xl font-extrabold">
              Turbine Risk Snapshot
            </h2>

            <p className="text-blue-100 text-sm mt-1">
              Current operating parameters
            </p>

          </div>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


          {/* ROTOR */}

          <div className="bg-white/15 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">

            <Gauge className="w-7 h-7 text-cyan-200" />

            <p className="text-blue-100 text-sm mt-4">
              Rotor Speed
            </p>

            <p className="text-xl font-extrabold mt-1">
              {sensor.rotor_speed} RPM
            </p>

          </div>


          {/* GENERATOR TEMP */}

          <div className="bg-white/15 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">

            <Thermometer className="w-7 h-7 text-orange-200" />

            <p className="text-blue-100 text-sm mt-4">
              Generator Temp
            </p>

            <p className="text-xl font-extrabold mt-1">
              {sensor.generator_temperature}°C
            </p>

          </div>


          {/* ACOUSTIC */}

          <div className="bg-white/15 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">

            <Volume2 className="w-7 h-7 text-purple-200" />

            <p className="text-blue-100 text-sm mt-4">
              Acoustic
            </p>

            <p className="text-xl font-extrabold mt-1">
              {sensor.acoustic_level} dB
            </p>

          </div>


          {/* POWER */}

          <div className="bg-white/15 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">

            <Zap className="w-7 h-7 text-yellow-200" />

            <p className="text-blue-100 text-sm mt-4">
              Power Output
            </p>

            <p className="text-xl font-extrabold mt-1">
              {sensor.power_output} MW
            </p>

          </div>

        </div>

      </div>


      {/* ALERT HISTORY */}

      <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 md:p-7 mb-7">

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">

              <AlertTriangle className="w-7 h-7 text-red-600" />

            </div>

            <div>

              <h2 className="text-xl font-extrabold text-slate-800">
                Alert History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Automatically detected abnormal events
              </p>

            </div>

          </div>

          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-extrabold">
            {history.length} alerts
          </span>

        </div>


        {history.length === 0 ? (

          <div className="text-center py-10">

            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />

            <p className="mt-3 font-bold text-slate-700">
              No alerts recorded
            </p>

            <p className="text-sm text-slate-500 mt-1">
              The turbine has no stored abnormal events.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {history.map((item, index) => (

              <div
                key={`${item.timestamp}-${index}`}
                className="border border-red-200 bg-red-50 rounded-2xl p-5"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shrink-0">

                      <AlertTriangle className="w-6 h-6 text-white" />

                    </div>

                    <div>

                      <p className="font-extrabold text-red-700">
                        {item.severity} · {item.prediction}
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {item.message}
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        {item.timestamp}
                      </p>

                    </div>

                  </div>


                  <div className="grid grid-cols-3 gap-3 text-center">

                    <div>

                      <p className="text-xs text-slate-500">
                        Health
                      </p>

                      <p className="font-extrabold text-slate-800">
                        {item.health_score}%
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Risk
                      </p>

                      <p className="font-extrabold text-red-600">
                        {item.risk_level}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="font-extrabold text-slate-800">
                        {item.anomaly_score}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* MAINTENANCE RECOMMENDATION */}

      <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl shadow-xl p-6 md:p-7 text-white">

        <div className="flex flex-col md:flex-row md:items-center gap-5">

          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">

            <Wrench className="w-9 h-9" />

          </div>

          <div className="flex-1">

            <h2 className="text-xl font-extrabold">
              AI Maintenance Recommendation
            </h2>

            <p className="mt-2 text-purple-100 leading-relaxed">

              {isCritical
                ? "Immediate inspection is recommended. Investigate abnormal turbine behaviour before continued operation."
                : isWarning
                  ? "Preventive inspection is recommended. Monitor turbine parameters closely and schedule maintenance if abnormal behaviour persists."
                  : "No immediate maintenance action is required. Continue normal monitoring."}

            </p>

          </div>

          <div className="flex items-center gap-2 bg-white/15 border border-white/20 px-5 py-3 rounded-xl">

            <CheckCircle className="w-5 h-5" />

            <span className="text-sm font-bold">
              AI Recommendation
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Alerts;