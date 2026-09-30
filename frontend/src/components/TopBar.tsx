import { useState } from "react";

interface Props {
  breadcrumb: string[];
}

export default function TopBar({ breadcrumb }: Props) {
  const [search, setSearch] = useState("");
  const [notifHovered, setNotifHovered] = useState(false);

  return (
    <div className="top-bar">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {breadcrumb.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F3044" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
            <span style={{
              fontSize: 13,
              color: i === breadcrumb.length - 1 ? "#C4D4E2" : "#253D54",
              fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
              letterSpacing: "0.01em",
            }}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: "relative", width: 264 }}>
        <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#253D54", pointerEvents: "none" }}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vessels, ports, routes…"
          className="input-field"
          style={{ paddingLeft: 34, paddingRight: 36, height: 34, fontSize: 12, borderRadius: 8 }}
        />
        <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: "#1F3044", fontWeight: 700, letterSpacing: "0.08em", background: "#0D1520", border: "1px solid #1F3044", padding: "1px 5px", borderRadius: 4 }}>⌘K</span>
      </div>

      {/* Notification bell */}
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onMouseEnter={() => setNotifHovered(true)}
        onMouseLeave={() => setNotifHovered(false)}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          background: notifHovered ? "rgba(22,32,48,0.8)" : "transparent",
          border: notifHovered ? "1px solid #1F3044" : "1px solid transparent",
          transition: "all 0.12s", cursor: "pointer",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3E5A72" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "1.5px solid #070C12", boxShadow: "0 0 6px rgba(239,68,68,0.7)" }} />
      </div>

      {/* System status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "5px 12px",
        background: "rgba(16,185,129,0.07)",
        border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: 7,
        flexShrink: 0,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.8)" }} />
        <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, letterSpacing: "0.04em" }}>Systems Operational</span>
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: "#253D54", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ color: "#2A4258" }}>Sep 4, 2026</span>
        <span style={{ color: "#162030", margin: "0 5px" }}>·</span>
        <span style={{ color: "#1F3A52" }}>Updated 2m ago</span>
      </div>

      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "linear-gradient(135deg, #2F80ED, #6366F1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer", flexShrink: 0,
        boxShadow: "0 0 10px rgba(47,128,237,0.4)",
      }}>
        AR
      </div>
    </div>
  );
}
