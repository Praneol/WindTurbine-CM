import React, { useEffect, useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

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
      const eased = 1 - Math.pow(1 - p, 3);

      setValue(Math.round(eased * target));

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

const pipeline = [
  ["01", "SENSE", "MPU6050"],
  ["02", "CAPTURE", "ESP8266"],
  ["03", "STREAM", "100 Hz"],
  ["04", "ENGINEER", "Features"],
  ["05", "DETECT", "Isolation Forest"],
  ["06", "RESPOND", "Risk / Alert"],
];

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
        const response = await fetch(`${API}/api/hardware/latest`);
        setOnline(response.ok);
      } catch {
        setOnline(false);
      }
    };

    check();

    const timer = setInterval(check, 5000);
    const raf = requestAnimationFrame(() => setMounted(true));

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const apply = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const reveal = (order) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition:
      `opacity 600ms cubic-bezier(.22,1,.36,1) ${order * 90}ms, ` +
      `transform 600ms cubic-bezier(.22,1,.36,1) ${order * 90}ms`,
  });

  return (
    <div className="aerion-page">
      <style>{`
        .aerion-page {
          position: relative;
          width: 100%;
          min-height: calc(100vh - 82px);
          overflow: hidden;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f0f9ff 55%,
            #e0f2fe 100%
          );
          color: #0f172a;
          padding: 24px 16px;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
          box-sizing: border-box;
        }

        .aerion-page * {
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .aerion-page {
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .aerion-page {
            padding: 24px 40px;
          }
        }

        /* BACKGROUND */

        .aerion-blob {
          pointer-events: none;
          position: absolute;
          border-radius: 9999px;
          filter: blur(130px);
        }

        .aerion-blob.a {
          left: -160px;
          top: -100px;
          width: 420px;
          height: 420px;
          background: rgba(125, 211, 252, 0.35);
        }

        .aerion-blob.b {
          right: -150px;
          top: 20%;
          width: 500px;
          height: 500px;
          background: rgba(147, 197, 253, 0.25);
        }

        .aerion-blob.c {
          bottom: -200px;
          left: 30%;
          width: 500px;
          height: 500px;
          background: rgba(216, 180, 254, 0.3);
        }

        /* IMPORTANT:
           This class is unique to Settings.
           It no longer uses .aerion-shell.
        */

        .settings-content-shell {
          position: relative;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          min-width: 0;
        }

        /* HERO */

        .aerion-card {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          border: 1px solid #e0f2fe;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 10px 50px rgba(14, 165, 233, 0.08);
          backdrop-filter: blur(16px);
          padding: 24px;
          margin-bottom: 32px;
        }

        @media (min-width: 640px) {
          .aerion-card {
            padding: 32px;
          }
        }

        .aerion-ring-deco {
          position: absolute;
          border-radius: 9999px;
          border: 1px solid #e0f2fe;
          pointer-events: none;
        }

        .aerion-ring-deco.r1 {
          right: -70px;
          top: -100px;
          width: 288px;
          height: 288px;
        }

        .aerion-ring-deco.r2 {
          right: -20px;
          top: -50px;
          width: 224px;
          height: 224px;
        }

        .aerion-hero-grid {
          position: relative;
          display: grid;
          gap: 32px;
          min-width: 0;
        }

        @media (min-width: 1024px) {
          .aerion-hero-grid {
            grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
            align-items: center;
          }
        }

        .aerion-brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .aerion-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 16px;
          background: #e0f2fe;
          font-size: 20px;
        }

        .aerion-eyebrow {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #0284c7;
          margin: 0;
        }

        .aerion-subtle {
          font-size: 10px;
          color: #64748b;
          margin: 2px 0 0;
        }

        .aerion-h1 {
          max-width: 640px;
          font-size: 36px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0;
          color: #0f172a;
        }

        @media (min-width: 640px) {
          .aerion-h1 {
            font-size: 48px;
          }
        }

        .aerion-h1 span {
          color: #0284c7;
        }

        .aerion-lede {
          max-width: 560px;
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin: 20px 0 0;
        }

        .aerion-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .aerion-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 9999px;
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 700;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .aerion-pill.green {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .aerion-pill.blue {
          background: #f0f9ff;
          border-color: #bae6fd;
          color: #0369a1;
        }

        .aerion-pill.violet {
          background: #f5f3ff;
          border-color: #ddd6fe;
          color: #6d28d9;
        }

        .aerion-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 9999px;
          background: #10b981;
        }

        .aerion-dot.live {
          animation: aerion-blink 1.6s ease-in-out infinite;
        }

        /* STATUS */

        .aerion-status-wrap {
          position: relative;
          margin: 0 auto;
          width: 100%;
          max-width: 384px;
        }

        .aerion-status-glow {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(186, 230, 253, 0.4);
          filter: blur(60px);
        }

        .aerion-status-card {
          position: relative;
          border-radius: 32px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(14, 165, 233, 0.1);
        }

        .aerion-status-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .aerion-status-label {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .aerion-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #0ea5e9;
          box-shadow: 0 0 10px #0ea5e9;
          animation: aerion-blink 1.6s ease-in-out infinite;
        }

        .aerion-ring-outer {
          margin: 32px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 160px;
          height: 160px;
          border-radius: 9999px;
          border: 1px solid #bae6fd;
          background: #f0f9ff;
          animation: aerion-ring-pulse 2.4s ease-out infinite;
        }

        .aerion-ring-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 112px;
          height: 112px;
          border-radius: 9999px;
          border: 1px solid #bae6fd;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .aerion-hz-num {
          font-size: 30px;
          font-weight: 900;
          color: #0284c7;
          margin: 0;
          font-variant-numeric: tabular-nums;
        }

        .aerion-hz-unit {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8;
          margin: 4px 0 0;
        }

        .aerion-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .aerion-stat-box {
          min-width: 0;
          border-radius: 12px;
          background: #f8fafc;
          padding: 12px 8px;
          text-align: center;
        }

        .aerion-stat-label {
          font-size: 9px;
          color: #94a3b8;
          margin: 0;
        }

        .aerion-stat-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0;
        }

        .aerion-stat-value.ok {
          color: #059669;
        }

        /* SECTION */

        .aerion-section-title {
          margin-bottom: 20px;
        }

        .aerion-h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 8px 0 0;
        }

        /* FEATURE CARDS */

        .aerion-grid3 {
          display: grid;
          gap: 20px;
          grid-template-columns: minmax(0, 1fr);
          min-width: 0;
        }

        @media (min-width: 768px) {
          .aerion-grid3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .aerion-grid3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .aerion-feature-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border-radius: 28px;
          background: #ffffff;
          padding: 24px;
          border: 1px solid;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease,
            border-color 0.4s ease;
        }

        .aerion-feature-card:hover {
          transform: translateY(-4px);
        }

        .aerion-feature-card.sky {
          border-color: #e0f2fe;
        }

        .aerion-feature-card.sky:hover {
          border-color: #7dd3fc;
          box-shadow: 0 20px 50px rgba(14, 165, 233, 0.1);
        }

        .aerion-feature-card.violet {
          border-color: #ede9fe;
        }

        .aerion-feature-card.violet:hover {
          border-color: #c4b5fd;
          box-shadow: 0 20px 50px rgba(139, 92, 246, 0.1);
        }

        .aerion-feature-card.amber {
          border-color: #fef3c7;
        }

        .aerion-feature-card.amber:hover {
          border-color: #fcd34d;
          box-shadow: 0 20px 50px rgba(251, 191, 36, 0.12);
        }

        .aerion-feature-icon-bg {
          position: absolute;
          right: -30px;
          top: -30px;
          font-size: 120px;
          opacity: 0.05;
          pointer-events: none;
        }

        .aerion-feature-icon {
          font-size: 30px;
          display: inline-block;
          transition: transform 0.4s ease;
        }

        .aerion-feature-card:hover .aerion-feature-icon {
          transform: scale(1.12);
        }

        .aerion-feature-eyebrow {
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin: 24px 0 0;
        }

        .aerion-feature-eyebrow.sky {
          color: #0284c7;
        }

        .aerion-feature-eyebrow.violet {
          color: #7c3aed;
        }

        .aerion-feature-eyebrow.amber {
          color: #d97706;
        }

        .aerion-h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 8px 0 0;
        }

        .aerion-body {
          font-size: 12px;
          line-height: 1.6;
          color: #64748b;
          margin: 8px 0 0;
        }

        /* SPECS */

        .aerion-spec-list {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .aerion-spec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          border-radius: 12px;
          background: #f8fafc;
          padding: 12px;
          transition: background 0.3s ease;
        }

        .aerion-spec-row:hover {
          background: #f0f9ff;
        }

        .aerion-spec-key {
          min-width: 0;
          font-size: 12px;
          color: #64748b;
        }

        .aerion-spec-val {
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
        }

        .aerion-spec-val.sky {
          color: #0369a1;
        }

        .aerion-spec-val.violet {
          color: #6d28d9;
        }

        /* TOGGLES */

        .aerion-toggle-row {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 16px;
        }

        .aerion-toggle-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .aerion-toggle-sub {
          font-size: 10px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .aerion-switch {
          width: 48px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 9999px;
          border: none;
          padding: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
          background: #cbd5e1;
        }

        .aerion-switch.on.amber {
          background: #fcd34d;
        }

        .aerion-switch.on.sky {
          background: #7dd3fc;
        }

        .aerion-switch-knob {
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
          transform: translateX(0);
        }

        .aerion-switch.on .aerion-switch-knob {
          transform: translateX(20px);
        }

        .aerion-status-note {
          margin-top: 16px;
          border-radius: 16px;
          border: 1px solid #fde68a;
          background: #fffbeb;
          padding: 16px;
        }

        .aerion-status-note-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #d97706;
          margin: 0;
        }

        .aerion-status-note-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0;
          display: inline-block;
        }

        /* FLOW */

        .aerion-flow-card {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          border: 1px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.85);
          padding: 24px;
          margin-top: 24px;
          backdrop-filter: blur(16px);
        }

        @media (min-width: 640px) {
          .aerion-flow-card {
            padding: 32px;
          }
        }

        .aerion-flow-wash {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #f0f9ff,
            transparent,
            #f5f3ff
          );
          pointer-events: none;
        }

        .aerion-flow-grid {
          position: relative;
          margin-top: 32px;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (min-width: 768px) {
          .aerion-flow-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .aerion-flow-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }

        .aerion-flow-step {
          position: relative;
          min-width: 0;
        }

        .aerion-flow-box {
          min-width: 0;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 16px;
          transition:
            border-color 0.3s ease,
            background 0.3s ease;
        }

        .aerion-flow-box:hover {
          border-color: #7dd3fc;
          background: #f0f9ff;
        }

        .aerion-flow-num {
          font-size: 9px;
          font-weight: 700;
          color: #0284c7;
          margin: 0;
        }

        .aerion-flow-title {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
          margin: 12px 0 0;
        }

        .aerion-flow-sub {
          font-size: 10px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .aerion-flow-arrow {
          display: none;
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          color: #7dd3fc;
        }

        @media (min-width: 1100px) {
          .aerion-flow-arrow {
            display: block;
          }
        }

        /* PREFERENCES */

        .aerion-prefs-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: minmax(0, 1fr);
          margin-top: 24px;
        }

        @media (min-width: 768px) {
          .aerion-prefs-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
        }

        .aerion-pref-card {
          min-width: 0;
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.85);
          padding: 24px;
          backdrop-filter: blur(16px);
        }

        .aerion-pref-cta-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 28px;
          border: 1px solid #e0f2fe;
          background: linear-gradient(135deg, #f0f9ff, #f5f3ff);
          padding: 24px;
        }

        .aerion-apply-btn {
          margin-top: 24px;
          border-radius: 16px;
          padding: 16px 24px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.15em;
          border: 1px solid #7dd3fc;
          background: #ffffff;
          color: #0369a1;
          cursor: pointer;
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease;
        }

        .aerion-apply-btn:hover {
          background: #f0f9ff;
        }

        .aerion-apply-btn.saved {
          border-color: #6ee7b7;
          background: #d1fae5;
          color: #047857;
        }

        /* FOOTER */

        .aerion-footer {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8;
        }

        @media (min-width: 640px) {
          .aerion-footer {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        /* ANIMATIONS */

        @keyframes aerion-ring-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.18);
          }

          100% {
            box-shadow: 0 0 0 22px rgba(14, 165, 233, 0);
          }
        }

        @keyframes aerion-pop {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }

          60% {
            transform: scale(1.03);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes aerion-blink {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }

        .aerion-pop {
          animation: aerion-pop 320ms cubic-bezier(.22, 1, .36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .aerion-pop,
          .aerion-ring-outer,
          .aerion-live-dot,
          .aerion-dot.live {
            animation: none !important;
          }
        }

        @media (max-width: 500px) {
          .aerion-h1 {
            font-size: 30px;
          }

          .aerion-h2 {
            font-size: 21px;
          }

          .aerion-stat-box {
            padding: 10px 5px;
          }

          .aerion-toggle-row {
            padding: 13px;
          }
        }
      `}</style>

      <div className="aerion-blob a" />
      <div className="aerion-blob b" />
      <div className="aerion-blob c" />

      {/* IMPORTANT: unique Settings shell */}
      <div className="settings-content-shell">

        {/* HERO */}

        <section className="aerion-card" style={reveal(0)}>
          <div className="aerion-ring-deco r1" />
          <div className="aerion-ring-deco r2" />

          <div className="aerion-hero-grid">
            <div>
              <div className="aerion-brand-row">
                <div className="aerion-brand-icon">⚡</div>

                <div>
                  <p className="aerion-eyebrow">AERION</p>
                  <p className="aerion-subtle">
                    WIND INTELLIGENCE PLATFORM
                  </p>
                </div>
              </div>

              <h1 className="aerion-h1">
                Control the <span>intelligence</span> behind your turbine.
              </h1>

              <p className="aerion-lede">
                Configure the monitoring environment, sensing architecture
                and AI condition-monitoring behaviour of AERION.
              </p>

              <div className="aerion-pill-row">
                <div className="aerion-pill green">
                  <span className={`aerion-dot${online ? " live" : ""}`} />
                  {online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
                </div>

                <div className="aerion-pill blue">
                  100 Hz MONITORING
                </div>

                <div className="aerion-pill violet">
                  AI ENABLED
                </div>
              </div>
            </div>

            <div className="aerion-status-wrap">
              <div className="aerion-status-glow" />

              <div className="aerion-status-card">
                <div className="aerion-status-head">
                  <span className="aerion-status-label">
                    CORE STATUS
                  </span>

                  <span className="aerion-live-dot" />
                </div>

                <div className="aerion-ring-outer">
                  <div className="aerion-ring-inner">
                    <div style={{ textAlign: "center" }}>
                      <p className="aerion-hz-num">{hz}</p>
                      <p className="aerion-hz-unit">Hz</p>
                    </div>
                  </div>
                </div>

                <div className="aerion-stat-grid">
                  <div className="aerion-stat-box">
                    <p className="aerion-stat-label">SENSOR</p>
                    <p className="aerion-stat-value">02</p>
                  </div>

                  <div className="aerion-stat-box">
                    <p className="aerion-stat-label">MODEL</p>
                    <p className="aerion-stat-value">IF</p>
                  </div>

                  <div className="aerion-stat-box">
                    <p className="aerion-stat-label">STATE</p>
                    <p className="aerion-stat-value ok">OK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TITLE */}

        <div
          className="aerion-section-title"
          style={reveal(1)}
        >
          <p className="aerion-eyebrow">CONTROL LAYER</p>

          <h2 className="aerion-h2">
            Configure your intelligence environment
          </h2>
        </div>

        {/* FEATURE CARDS */}

        <div className="aerion-grid3">

          {/* SENSOR */}

          <div
            className="aerion-feature-card sky"
            style={reveal(2)}
          >
            <div className="aerion-feature-icon-bg">
              📡
            </div>

            <div className="aerion-feature-icon">
              📡
            </div>

            <p className="aerion-feature-eyebrow sky">
              SENSOR NETWORK
            </p>

            <h3 className="aerion-h3">
              Physical Layer
            </h3>

            <p className="aerion-body">
              Live acquisition architecture connected to the turbine
              monitoring system.
            </p>

            <div className="aerion-spec-list">
              {[
                ["Controller", "ESP8266"],
                ["Vibration", "MPU6050"],
                ["Acoustic", "MAX4466"],
                ["Sampling", "100 Hz"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="aerion-spec-row"
                >
                  <span className="aerion-spec-key">
                    {a}
                  </span>

                  <span className="aerion-spec-val sky">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI */}

          <div
            className="aerion-feature-card violet"
            style={reveal(3)}
          >
            <div className="aerion-feature-icon-bg">
              🧠
            </div>

            <div className="aerion-feature-icon">
              🧠
            </div>

            <p className="aerion-feature-eyebrow violet">
              INTELLIGENCE ENGINE
            </p>

            <h3 className="aerion-h3">
              AI Condition Monitoring
            </h3>

            <p className="aerion-body">
              Machine-learning layer analysing deviations from the
              learned normal baseline.
            </p>

            <div className="aerion-spec-list">
              {[
                ["Algorithm", "Isolation Forest"],
                ["Estimators", "200"],
                ["Scaler", "StandardScaler"],
                ["Learning", "Unsupervised"],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="aerion-spec-row"
                >
                  <span className="aerion-spec-key">
                    {a}
                  </span>

                  <span className="aerion-spec-val violet">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ALERTS */}

          <div
            className="aerion-feature-card amber"
            style={reveal(4)}
          >
            <div className="aerion-feature-icon-bg">
              🔔
            </div>

            <div className="aerion-feature-icon">
              🔔
            </div>

            <p className="aerion-feature-eyebrow amber">
              RESPONSE LAYER
            </p>

            <h3 className="aerion-h3">
              Alert Intelligence
            </h3>

            <p className="aerion-body">
              Configure how AERION surfaces abnormal operating behaviour.
            </p>

            <div className="aerion-toggle-row">
              <div>
                <p className="aerion-toggle-title">
                  Live alerts
                </p>

                <p className="aerion-toggle-sub">
                  AI risk notifications
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAlerts(!alerts)}
                className={`aerion-switch${
                  alerts ? " on amber" : ""
                }`}
              >
                <span className="aerion-switch-knob" />
              </button>
            </div>

            <div className="aerion-status-note">
              <p className="aerion-status-note-label">
                STATUS
              </p>

              <span
                key={alerts ? "on" : "off"}
                className="aerion-status-note-value aerion-pop"
              >
                {alerts
                  ? "Monitoring enabled"
                  : "Monitoring paused"}
              </span>
            </div>
          </div>
        </div>

        {/* ARCHITECTURE FLOW */}

        <section
          className="aerion-flow-card"
          style={reveal(5)}
        >
          <div className="aerion-flow-wash" />

          <div style={{ position: "relative" }}>
            <p className="aerion-eyebrow">
              INTELLIGENCE FLOW
            </p>

            <h2 className="aerion-h2">
              From physical motion to machine intelligence.
            </h2>

            <p
              className="aerion-body"
              style={{ maxWidth: 640 }}
            >
              The AERION pipeline transforms raw turbine sensor
              behaviour into an AI-assisted condition assessment.
            </p>

            <div className="aerion-flow-grid">
              {pipeline.map(([num, title, sub], i) => (
                <div
                  key={num}
                  className="aerion-flow-step"
                >
                  <div className="aerion-flow-box">
                    <p className="aerion-flow-num">
                      {num}
                    </p>

                    <p className="aerion-flow-title">
                      {title}
                    </p>

                    <p className="aerion-flow-sub">
                      {sub}
                    </p>
                  </div>

                  {i < pipeline.length - 1 && (
                    <div className="aerion-flow-arrow">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PREFERENCES */}

        <section
          className="aerion-prefs-grid"
          style={reveal(6)}
        >
          <div className="aerion-pref-card">
            <p
              className="aerion-eyebrow"
              style={{ color: "#94a3b8" }}
            >
              INTERFACE
            </p>

            <h3 className="aerion-h3">
              Experience controls
            </h3>

            <div
              className="aerion-toggle-row"
              style={{ marginTop: 24 }}
            >
              <div>
                <p className="aerion-toggle-title">
                  Automatic refresh
                </p>

                <p className="aerion-toggle-sub">
                  Keep monitoring screens updated.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRefresh(!refresh)}
                className={`aerion-switch${
                  refresh ? " on sky" : ""
                }`}
              >
                <span className="aerion-switch-knob" />
              </button>
            </div>
          </div>

          <div className="aerion-pref-cta-card">
            <div>
              <p className="aerion-eyebrow sky">
                CONFIGURATION
              </p>

              <h3 className="aerion-h3">
                Ready for deployment
              </h3>

              <p className="aerion-body">
                Your monitoring environment is configured for
                the current AERION prototype architecture.
              </p>
            </div>

            <button
              type="button"
              onClick={apply}
              className={`aerion-apply-btn${
                saved ? " saved" : ""
              }`}
            >
              <span
                key={saved ? "on" : "off"}
                className="aerion-pop"
                style={{ display: "inline-block" }}
              >
                {saved
                  ? "✓ CONFIGURATION APPLIED"
                  : "APPLY CONFIGURATION"}
              </span>
            </button>
          </div>
        </section>

        {/* FOOTER */}

        <div className="aerion-footer">
          <span>
            AERION // WIND INTELLIGENCE
          </span>

          <span>
            Condition Monitoring • AI • IoT
          </span>
        </div>
      </div>
    </div>
  );
}