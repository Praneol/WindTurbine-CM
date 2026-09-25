
import { useEffect, useState } from "react";

import {
  Activity,
  Wind,
  Gauge,
  Thermometer,
  Radio,
  Zap,
  RefreshCw,
  Wifi,
} from "lucide-react";

import {
  getLatestSensorData,
  getSensorHistory,
} from "../../services/api";

function Sensors() {
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSensors = async () => {
    try {
      const latest = await getLatestSensorData();
      const historical = await getSensorHistory();

      setSensorData(latest);
      setHistory(historical || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Sensor API error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();

    const interval = setInterval(loadSensors, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !sensorData) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={40}
            className="mx-auto text-blue-600 animate-spin mb-3"
          />

          <p className="text-slate-600">
            Connecting to live sensor network...
          </p>
        </div>
      </div>
    );
  }

  const sensorCards = [
    {
      name: "Wind Speed",
      value: sensorData.wind_speed,
      unit: "m/s",
      icon: Wind,
    },
    {
      name: "Rotor Speed",
      value: sensorData.rotor_speed,
      unit: "RPM",
      icon: Gauge,
    },
    {
      name: "Gearbox Temperature",
      value: sensorData.gearbox_temperature,
      unit: "°C",
      icon: Thermometer,
    },
    {
      name: "Generator Temperature",
      value: sensorData.generator_temperature,
      unit: "°C",
      icon: Thermometer,
    },
    {
      name: "Vibration",
      value: sensorData.vibration,
      unit: "mm/s",
      icon: Activity,
    },
    {
      name: "Acoustic Level",
      value: sensorData.acoustic_level,
      unit: "dB",
      icon: Radio,
    },
    {
      name: "Power Output",
      value: sensorData.power_output,
      unit: "MW",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-sky-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">

          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <Activity size={28} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Live Sensor Monitoring
            </h1>

            <p className="text-slate-500">
              Real-time turbine telemetry and sensor intelligence
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-sm">

          <Wifi
            size={18}
            className="text-emerald-500"
          />

          <span className="text-sm font-semibold text-slate-700">
            LIVE
          </span>

          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

        </div>

      </div>


      {/* Sensor Network Status */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 mb-6 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-sm text-slate-500">
              Sensor Network
            </p>

            <h2 className="text-xl font-bold text-slate-800">
              WT-001
            </h2>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 font-semibold">

            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />

            All telemetry streams active

          </div>

        </div>

      </div>


      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {sensorCards.map((sensor) => {

          const Icon = sensor.icon;

          return (
            <div
              key={sensor.name}
              className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 hover:shadow-md transition"
            >

              <div className="flex items-center justify-between mb-5">

                <div className="p-3 bg-sky-50 rounded-xl">
                  <Icon
                    size={23}
                    className="text-blue-600"
                  />
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  ONLINE
                </span>

              </div>

              <p className="text-sm text-slate-500">
                {sensor.name}
              </p>

              <div className="flex items-baseline gap-2 mt-1">

                <span className="text-3xl font-bold text-slate-800">
                  {Number(sensor.value).toFixed(2)}
                </span>

                <span className="text-sm text-slate-500">
                  {sensor.unit}
                </span>

              </div>

            </div>
          );
        })}

      </div>


      {/* Telemetry History */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 md:p-6">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Telemetry History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Recent stored sensor readings from WT-001
            </p>

          </div>

          <span className="self-start sm:self-auto px-3 py-1.5 text-sm font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            {history.length} readings
          </span>

        </div>


        {/* Table */}
        {history.length === 0 ? (

          <div className="text-center py-10 text-slate-500">
            No historical sensor readings available.
          </div>

        ) : (

          <div className="overflow-x-auto rounded-xl border border-slate-300">

            <table className="w-full min-w-[1100px] border-collapse">

              {/* Header */}
              <thead>

                <tr className="bg-slate-100">

                  <th className="border border-slate-300 px-5 py-4 text-left text-xs font-bold text-slate-700">
                    Time
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Wind
                    <span className="block font-normal text-slate-500 mt-0.5">
                      m/s
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Rotor
                    <span className="block font-normal text-slate-500 mt-0.5">
                      RPM
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Gearbox
                    <span className="block font-normal text-slate-500 mt-0.5">
                      °C
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Generator
                    <span className="block font-normal text-slate-500 mt-0.5">
                      °C
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Vibration
                    <span className="block font-normal text-slate-500 mt-0.5">
                      mm/s
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Acoustic
                    <span className="block font-normal text-slate-500 mt-0.5">
                      dB
                    </span>
                  </th>

                  <th className="border border-slate-300 px-5 py-4 text-right text-xs font-bold text-slate-700">
                    Power
                    <span className="block font-normal text-slate-500 mt-0.5">
                      MW
                    </span>
                  </th>

                </tr>

              </thead>


              {/* Data */}
              <tbody>

                {history.map((reading, index) => (

                  <tr
                    key={reading.id || index}
                    className="hover:bg-blue-50 transition-colors"
                  >

                    <td className="border border-slate-300 px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {reading.timestamp
                        ? new Date(reading.timestamp).toLocaleTimeString()
                        : "--"}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.wind_speed || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.rotor_speed || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.gearbox_temperature || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.generator_temperature || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.vibration || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-medium text-slate-700">
                      {Number(reading.acoustic_level || 0).toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-5 py-4 text-right text-sm font-semibold text-blue-600">
                      {Number(reading.power_output || 0).toFixed(2)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Sensors;

