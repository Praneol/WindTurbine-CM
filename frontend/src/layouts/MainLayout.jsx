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

      <aside className="sidebar">
        <div className="brand">
          <Wind size={28} />
          <div>
            <h2>AERION</h2>
            <span>Wind Intelligence</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="nav-item"
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="system-status">
          <span className="status-dot"></span>
          <div>
            <strong>System Online</strong>
            <small>Remote Monitoring Active</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Wind Turbine Condition Monitoring</h1>
            <p>AI-powered remote monitoring platform</p>
          </div>

          <div className="connection-status">
            <span className="status-dot"></span>
            Live
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>

    </div>
  );
}

export default MainLayout;