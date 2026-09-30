import { useState, useCallback } from "react";
import Dashboard from "./pages/Dashboard";
import VesselDirectory from "./pages/VesselDirectory";
import RouteAnalytics from "./pages/RouteAnalytics";
import PortConstraints from "./pages/PortConstraints";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export type Page = "dashboard" | "vessels" | "routes" | "ports";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const navigate = useCallback((p: Page) => setPage(p), []);

  const pageMap = {
    dashboard: <Dashboard navigate={navigate} />,
    vessels: <VesselDirectory navigate={navigate} />,
    routes: <RouteAnalytics />,
    ports: <PortConstraints />,
  };

  const titles: Record<Page, { title: string; breadcrumb: string[] }> = {
    dashboard: { title: "Dashboard", breadcrumb: ["FreightIQ", "Dashboard"] },
    vessels: { title: "Vessel Directory", breadcrumb: ["FreightIQ", "Vessel Directory"] },
    routes: { title: "Route Analytics", breadcrumb: ["FreightIQ", "Route Analytics"] },
    ports: { title: "Port Constraints", breadcrumb: ["FreightIQ", "Port Constraints"] },
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0B0F14", overflow: "hidden" }}>
      <Sidebar activePage={page} navigate={navigate} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar breadcrumb={titles[page].breadcrumb} />
        <div style={{ flex: 1, overflowY: "auto", background: "#0B0F14" }}>
          {pageMap[page]}
        </div>
      </div>
    </div>
  );
}
