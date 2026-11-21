import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wind,
  Activity,
  Brain,
  Bell,
  Wrench,
  Box,
  BarChart3,
  Settings
} from "lucide-react";

function MainLayout() {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Turbines", path: "/turbines", icon: Wind },
    { name: "Live Sensors", path: "/sensors", icon: Activity },
    { name: "AI Health", path: "/ai-health", icon: Brain },
    { name: "Alerts", path: "/alerts", icon: Bell },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
    { name: "Digital Twin", path: "/digital-twin", icon: Box },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <div className="app-shell">
      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          background: #f0f9ff;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .app-shell * {
          box-sizing: border-box;
        }

        /* SIDEBAR */

        .app-sidebar {
          width: 250px;
          min-width: 250px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e0f2fe;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .app-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px 20px;
          margin-bottom: 12px;
          border-bottom: 1px solid #e0f2fe;
        }

        .app-brand-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #e0f2fe;
          color: #0284c7;
        }

        .app-brand h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .app-brand span {
          font-size: 10px;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .app-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .app-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 10px 12px;
          border-radius: 12px;
          color: #475569;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .app-nav-item:hover {
          background: #f0f9ff;
          color: #0284c7;
        }

        .app-nav-item.active {
          background: #e0f2fe;
          color: #0369a1;
        }

        .app-nav-item svg {
          flex-shrink: 0;
        }

        /* STATUS */

        .app-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #a7f3d0;
          background: #ecfdf5;
        }

        .app-status-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #10b981;
          animation: app-blink 1.6s ease-in-out infinite;
        }

        .app-status strong {
          display: block;
          font-size: 12px;
          color: #047857;
        }

        .app-status small {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          color: #059669;
        }

        /* MAIN */

        .app-main {
          flex: 1;
          min-width: 0;
          width: calc(100% - 250px);
          display: flex;
          flex-direction: column;
        }

        .app-topbar {
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 32px;
          background: rgba(255,255,255,0.92);
          border-bottom: 1px solid #e0f2fe;
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .app-topbar h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }

        .app-topbar p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .app-live-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 15px;
          border-radius: 999px;
          border: 1px solid #bae6fd;
          background: #f0f9ff;
          color: #0369a1;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .app-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
          animation: app-blink 1.6s ease-in-out infinite;
        }

        .app-page-content {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        @keyframes app-blink {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }

        @media (max-width: 900px) {
          .app-shell {
            flex-direction: column;
          }

          .app-sidebar {
            position: relative;
            width: 100%;
            min-width: 100%;
            height: auto;
            padding: 12px;
            flex-direction: row;
            align-items: center;
            overflow-x: auto;
          }

          .app-brand {
            flex-shrink: 0;
            border-bottom: none;
            margin: 0;
            padding: 0 12px 0 0;
          }

          .app-nav {
            flex-direction: row;
            flex: none;
          }

          .app-nav-item {
            flex-shrink: 0;
          }

          .app-nav-item span {
            display: none;
          }

          .app-status {
            display: none;
          }

          .app-main {
            width: 100%;
          }

          .app-topbar {
            padding: 16px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .app-status-dot,
          .app-live-dot {
            animation: none;
          }
        }
      `}</style>

      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brand-icon">
            <Wind size={20} />
          </div>

          <div>
            <h2>AERION</h2>
            <span>Wind Intelligence</span>
          </div>
        </div>

        <nav className="app-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `app-nav-item${isActive ? " active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="app-status">
          <span className="app-status-dot" />

          <div>
            <strong>System Online</strong>
            <small>Remote Monitoring Active</small>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <h1>Wind Turbine Condition Monitoring</h1>
            <p>AI-powered remote monitoring platform</p>
          </div>

          <div className="app-live-pill">
            <span className="app-live-dot" />
            Live
          </div>
        </header>

        <section className="app-page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;