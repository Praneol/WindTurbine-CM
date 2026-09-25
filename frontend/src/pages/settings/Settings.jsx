import React, { useEffect, useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

/** Counts up to a target number once, on mount. Respects reduced-motion. */
function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduced.current) {
      setValue(target);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export default function Settings() {
  const [online, setOnline] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hz = useCountUp(100);

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API}/api/hardware/latest`);
        setOnline(r.ok);
      } catch {
        setOnline(false);
      }
    };

    check();
    const timer = setInterval(check, 5000);
    // triggers the entrance sequence one frame after first paint
    const raf = requestAnimationFrame(() => setMounted(true));

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const apply = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Staggered entrance: each element fades/rises in turn, once, on load.
  const reveal = (order) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(14px)",
    transition: `opacity 600ms cubic-bezier(.22,1,.36,1) ${order * 90}ms, transform 600ms cubic-bezier(.22,1,.36,1) ${order * 90}ms`,
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-sky-50 to-sky-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <style>{`
        @keyframes aerion-ring-pulse {
          0% { box-shadow: 0 0 0 0 rgba(14,165,233,0.18); }
          100% { box-shadow: 0 0 0 22px rgba(14,165,233,0); }
        }
        @keyframes aerion-pop {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .aerion-pop { animation: aerion-pop 320ms cubic-bezier(.22,1,.36,1); }
        @media (prefers-reduced-motion: reduce) {
          .aerion-pop, .aerion-ring { animation: none !important; }
        }
      `}</style>

      {/* ATMOSPHERE */}
      <div className="pointer-events-none absolute left-[-160px] top-[-100px] h-[420px] w-[420px] rounded-full bg-sky-300/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-150px] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-300/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-200/20 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* HERO */}
        <section
          style={reveal(0)}
          className="relative mb-8 overflow-hidden rounded-[32px] border border-sky-200 bg-white/80 p-6 shadow-[0_10px_50px_rgba(14,165,233,0.08)] backdrop-blur-xl sm:p-8"
        >

          {/* decorative circles */}
          <div className="absolute right-[-70px] top-[-100px] h-72 w-72 rounded-full border border-sky-200" />
          <div className="absolute right-[-20px] top-[-50px] h-56 w-56 rounded-full border border-sky-200" />

          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">

            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-xl">
                  ⚡
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-600">
                    AERION
                  </p>

                  <p className="text-[10px] text-slate-500">
                    WIND INTELLIGENCE PLATFORM
                  </p>
                </div>
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Control the
                <span className="text-sky-600"> intelligence </span>
                behind your turbine.
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
                Configure the monitoring environment, sensing architecture
                and AI condition-monitoring behaviour of AERION.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-bold text-emerald-700">
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${online ? "animate-pulse" : ""}`}
                  />
                  {online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
                </div>

                <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-[10px] font-bold text-sky-700">
                  100 Hz MONITORING
                </div>

                <div className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[10px] font-bold text-violet-700">
                  AI ENABLED
                </div>
              </div>
            </div>

            {/* HERO STATUS */}
            <div className="relative mx-auto w-full max-w-sm">

              <div className="absolute inset-0 rounded-full bg-sky-200/30 blur-[70px]" />

              <div className="relative rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-sky-100">

                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
                    CORE STATUS
                  </span>

                  <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />
                </div>

                <div className="my-8 flex justify-center">
                  <div
                    className="aerion-ring flex h-40 w-40 items-center justify-center rounded-full border border-sky-200 bg-sky-50"
                    style={{ animation: "aerion-ring-pulse 2.4s ease-out infinite" }}
                  >
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-sky-200 bg-white shadow-sm">
                      <div className="text-center">
                        <p className="text-3xl font-black text-sky-600 tabular-nums">
                          {hz}
                        </p>
                        <p className="text-[9px] uppercase tracking-widest text-slate-400">
                          Hz
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[9px] text-slate-400">SENSOR</p>
                    <p className="mt-1 text-xs font-bold text-slate-900">02</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[9px] text-slate-400">MODEL</p>
                    <p className="mt-1 text-xs font-bold text-slate-900">IF</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[9px] text-slate-400">STATE</p>
                    <p className="mt-1 text-xs font-bold text-emerald-600">
                      OK
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* SECTION TITLE */}
        <div style={reveal(1)} className="mb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-600">
            CONTROL LAYER
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Configure your intelligence environment
          </h2>
        </div>

        {/* PRESENTATION CARDS */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* SENSOR CARD */}
          <div
            style={reveal(2)}
            className="group relative overflow-hidden rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_20px_50px_rgba(14,165,233,0.1)]"
          >

            <div className="absolute right-[-30px] top-[-30px] text-[120px] opacity-[0.04]">
              📡
            </div>

            <div className="text-3xl transition-transform duration-500 group-hover:scale-110">📡</div>

            <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-sky-600">
              SENSOR NETWORK
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Physical Layer
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Live acquisition architecture connected to the turbine
              monitoring system.
            </p>

            <div className="mt-6 space-y-3">
              {[
                ["Controller", "ESP8266"],
                ["Vibration", "MPU6050"],
                ["Acoustic", "MAX4466"],
                ["Sampling", "100 Hz"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="flex justify-between rounded-xl bg-slate-50 px-3 py-3 transition-colors duration-300 hover:bg-sky-50"
                >
                  <span className="text-xs text-slate-500">{a}</span>
                  <span className="text-xs font-bold text-sky-700">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI CARD */}
          <div
            style={reveal(3)}
            className="group relative overflow-hidden rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_20px_50px_rgba(139,92,246,0.1)]"
          >

            <div className="absolute right-[-30px] top-[-30px] text-[120px] opacity-[0.04]">
              🧠
            </div>

            <div className="text-3xl transition-transform duration-500 group-hover:scale-110">🧠</div>

            <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-violet-600">
              INTELLIGENCE ENGINE
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              AI Condition Monitoring
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Machine-learning layer analysing deviations from the learned
              normal baseline.
            </p>

            <div className="mt-6 space-y-3">
              {[
                ["Algorithm", "Isolation Forest"],
                ["Estimators", "200"],
                ["Scaler", "StandardScaler"],
                ["Learning", "Unsupervised"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="flex justify-between rounded-xl bg-slate-50 px-3 py-3 transition-colors duration-300 hover:bg-violet-50"
                >
                  <span className="text-xs text-slate-500">{a}</span>
                  <span className="text-xs font-bold text-violet-700">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ALERT CARD */}
          <div
            style={reveal(4)}
            className="group relative overflow-hidden rounded-[28px] border border-amber-100 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_20px_50px_rgba(251,191,36,0.12)]"
          >

            <div className="absolute right-[-30px] top-[-30px] text-[120px] opacity-[0.04]">
              🔔
            </div>

            <div className="text-3xl transition-transform duration-500 group-hover:scale-110">🔔</div>

            <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-amber-600">
              RESPONSE LAYER
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Alert Intelligence
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Configure how AERION surfaces abnormal operating behaviour.
            </p>

            <div className="mt-7 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Live alerts
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  AI risk notifications
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAlerts(!alerts)}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-300 ${
                  alerts ? "bg-amber-300" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-out ${
                    alerts ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[9px] uppercase tracking-widest text-amber-600">
                STATUS
              </p>

              <p key={alerts ? "on" : "off"} className="mt-1 text-sm font-bold text-slate-900 aerion-pop">
                {alerts ? "Monitoring enabled" : "Monitoring paused"}
              </p>
            </div>
          </div>
        </div>

        {/* BIG ARCHITECTURE VISUAL */}
        <section
          style={reveal(5)}
          className="relative mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-8"
        >

          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-transparent to-violet-50" />

          <div className="relative">
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-600">
              INTELLIGENCE FLOW
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              From physical motion to machine intelligence.
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
              The AERION pipeline transforms raw turbine sensor behaviour
              into an AI-assisted condition assessment.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-6">

              {[
                ["01", "SENSE", "MPU6050"],
                ["02", "CAPTURE", "ESP8266"],
                ["03", "STREAM", "100 Hz"],
                ["04", "ENGINEER", "Features"],
                ["05", "DETECT", "Isolation Forest"],
                ["06", "RESPOND", "Risk / Alert"],
              ].map(([num, title, sub], i) => (
                <div key={num} className="relative">

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 hover:border-sky-300 hover:bg-sky-50">

                    <p className="text-[9px] font-bold text-sky-600">
                      {num}
                    </p>

                    <p className="mt-3 text-xs font-black text-slate-900">
                      {title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {sub}
                    </p>

                  </div>

                  {i < 5 && (
                    <div className="hidden lg:block absolute right-[-12px] top-1/2 z-10 text-sky-400">
                      →
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section style={reveal(6)} className="mt-6 grid gap-5 md:grid-cols-2">

          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
              INTERFACE
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Experience controls
            </h3>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Automatic refresh
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Keep monitoring screens updated.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRefresh(!refresh)}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-300 ${
                  refresh ? "bg-sky-300" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-out ${
                    refresh ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

          </div>

          <div className="flex flex-col justify-between rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 to-violet-50 p-6">

            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-sky-600">
                CONFIGURATION
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Ready for deployment
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Your monitoring environment is configured for the current
                AERION prototype architecture.
              </p>
            </div>

            <button
              type="button"
              onClick={apply}
              className={`mt-6 rounded-2xl border px-6 py-4 text-xs font-black tracking-widest transition-all duration-300 ${
                saved
                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                  : "border-sky-300 bg-white text-sky-700 hover:bg-sky-50"
              }`}
            >
              <span key={saved ? "on" : "off"} className="inline-block aerion-pop">
                {saved ? "✓ CONFIGURATION APPLIED" : "APPLY CONFIGURATION"}
              </span>
            </button>

          </div>

        </section>

        {/* FOOTER */}
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[9px] uppercase tracking-[0.25em] text-slate-400 sm:flex-row">
          <span>AERION // WIND INTELLIGENCE</span>
          <span>Condition Monitoring • AI • IoT</span>
        </div>

      </div>
    </div>
  );
}