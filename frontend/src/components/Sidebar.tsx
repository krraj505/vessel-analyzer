import { useState } from "react";
import type { Page } from "../App";

interface Props {
  activePage: Page;
  navigate: (p: Page) => void;
}

const ICONS: Record<string, JSX.Element> = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  vessels: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
      <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
      <path d="M12 3v4"/>
    </svg>
  ),
  routes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      <path d="M2 12h20"/>
    </svg>
  ),
  ports: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/>
      <line x1="12" y1="8" x2="12" y2="21"/>
      <line x1="5" y1="14" x2="19" y2="14"/>
      <line x1="5" y1="14" x2="8" y2="21"/>
      <line x1="19" y1="14" x2="16" y2="21"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  help: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const NAV_ITEMS: { id: Page; label: string; sub: string; icon: keyof typeof ICONS; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard",        sub: "Overview & KPIs",      icon: "dashboard", badge: "4" },
  { id: "vessels",   label: "Vessel Directory",  sub: "Match & Compare",      icon: "vessels" },
  { id: "routes",    label: "Route Analytics",   sub: "Corridors & Rates",    icon: "routes" },
  { id: "ports",     label: "Port Constraints",  sub: "Limits & Alerts",      icon: "ports" },
];

export default function Sidebar({ activePage, navigate }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      width: 230,
      minWidth: 230,
      background: "#060B11",
      borderRight: "1px solid #162030",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* Logo */}
      <div style={{ padding: "20px 16px 18px", borderBottom: "1px solid #162030" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(140deg, #4C9EFF 0%, #1D6FD6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 20px rgba(47,128,237,0.55), 0 2px 8px rgba(0,0,0,0.4)",
            letterSpacing: "-0.03em",
          }}>F</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#EDF2F7", letterSpacing: "-0.03em", lineHeight: 1.1 }}>FreightIQ</div>
            <div style={{ fontSize: 9, color: "#253D54", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 3 }}>Maritime Intelligence</div>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <div style={{ padding: "16px 12px 0", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#1F3A52", letterSpacing: "0.14em", textTransform: "uppercase", padding: "0 4px 10px" }}>
          Navigation
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV_ITEMS.map(item => {
            const isActive  = activePage === item.id;
            const isHovered = hovered === item.id && !isActive;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                onKeyDown={e => e.key === "Enter" && navigate(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 13px",
                  borderRadius: 10,
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                  overflow: "hidden",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(47,128,237,0.18) 0%, rgba(47,128,237,0.08) 100%)"
                    : isHovered
                    ? "rgba(22,32,48,0.8)"
                    : "rgba(10,18,28,0.6)",
                  border: isActive
                    ? "1px solid rgba(47,128,237,0.5)"
                    : isHovered
                    ? "1px solid #1F3044"
                    : "1px solid #162030",
                  boxShadow: isActive
                    ? "0 0 0 1px rgba(47,128,237,0.08), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(76,158,255,0.1)"
                    : isHovered
                    ? "0 2px 8px rgba(0,0,0,0.2)"
                    : "none",
                  transition: "background 0.14s, border-color 0.14s, box-shadow 0.14s",
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span style={{
                    position: "absolute", left: 0, top: "20%", height: "60%", width: 3,
                    background: "linear-gradient(180deg, #4C9EFF, #2F80ED)",
                    borderRadius: "0 3px 3px 0",
                    boxShadow: "0 0 12px rgba(47,128,237,0.9)",
                  }} />
                )}

                {/* Active bg shimmer */}
                {isActive && (
                  <span style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(76,158,255,0.35), transparent)",
                  }} />
                )}

                {/* Icon */}
                <span style={{
                  display: "flex", flexShrink: 0,
                  color: isActive ? "#4C9EFF" : isHovered ? "#7A9AB8" : "#2A4258",
                  transition: "color 0.14s",
                }}>
                  {ICONS[item.icon]}
                </span>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#EDF2F7" : isHovered ? "#B8CFE2" : "#5A7A94",
                    letterSpacing: "0.01em",
                    lineHeight: 1.2,
                    transition: "color 0.14s",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: isActive ? "#4C9EFF" : "#1F3A52",
                    marginTop: 2,
                    transition: "color 0.14s",
                    fontWeight: 500,
                  }}>
                    {item.sub}
                  </div>
                </div>

                {/* Badge */}
                {item.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: "rgba(239,68,68,0.15)",
                    color: "#EF4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                    padding: "1px 6px", borderRadius: 5, flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Market widget */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #162030, transparent)", margin: "18px 0 14px" }} />
        <div style={{ fontSize: 9, fontWeight: 700, color: "#1F3A52", letterSpacing: "0.14em", textTransform: "uppercase", padding: "0 4px 10px" }}>Market</div>
        <div style={{
          padding: "13px 14px",
          background: "rgba(10,18,28,0.7)",
          border: "1px solid #162030",
          borderRadius: 10,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(47,128,237,0.2), transparent)" }} />
          <div style={{ fontSize: 10, color: "#253D54", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Live Freight Index</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#EDF2F7", letterSpacing: "-0.02em" }}>$42.80</span>
            <span style={{ fontSize: 11, color: "#2A4258", fontWeight: 500 }}>/MT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>▲ 4.8%</span>
            <span style={{ fontSize: 10, color: "#1F3A52" }}>7-day change</span>
          </div>
        </div>
      </div>

      {/* Bottom utilities */}
      <div style={{ padding: "8px 12px 14px", borderTop: "1px solid #162030" }}>
        {[
          { id: "settings", label: "Settings",      icon: "settings" as const },
          { id: "help",     label: "Help & Support", icon: "help" as const },
        ].map(item => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 7, cursor: "pointer",
              background: hovered === item.id ? "rgba(22,32,48,0.7)" : "transparent",
              border: "1px solid transparent",
              marginBottom: 2, transition: "background 0.12s",
            }}
          >
            <span style={{ display: "flex", color: hovered === item.id ? "#2A4258" : "#1A3044" }}>
              {ICONS[item.icon]}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: hovered === item.id ? "#5A7A94" : "#253D54", transition: "color 0.12s" }}>
              {item.label}
            </span>
          </div>
        ))}

        {/* User */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", marginTop: 4,
          background: "rgba(10,18,28,0.8)",
          border: "1px solid #162030",
          borderRadius: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #2F80ED, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 10px rgba(47,128,237,0.4)",
          }}>AR</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C4D4E2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Arjun Rao</div>
            <div style={{ fontSize: 10, color: "#253D54", fontWeight: 500 }}>Senior Analyst</div>
          </div>
          <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.8)", flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
