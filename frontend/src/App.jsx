import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Turbines from "./pages/turbines/Turbines";
import AIHealth from "./pages/ai-health/AIHealth";
import Sensors from "./pages/sensors/Sensors";
import Alerts from "./pages/alerts/Alerts";
import Analytics from "./pages/analytics/Analytics";
import Settings from "./pages/settings/Settings";
import Predictions from "./pages/predictions/Predictions";
import DigitalTwin from "./pages/digital-twin/DigitalTwin";
import Maintenance from "./pages/maintenance/Maintenance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>

          <Route path="/" element={<Dashboard />} />
          <Route path="/turbines" element={<Turbines />} />
          <Route path="/ai-health" element={<AIHealth />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/digital-twin" element={<DigitalTwin />} />
          <Route path="/maintenance" element={<Maintenance />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;