import { useState } from "react";
import FreightChart from "../components/FreightChart";
import type { Page } from "../App";

interface Props {
  navigate: (p: Page) => void;
}

/* ─── KPI data ──────────────────────────────────────────────────────────── */
const kpis = [
  {
    label: "Current Freight Rate",
    value: "$42.80", unit: "/ MT",
    trend: "+4.8%", trendDir: "up", sub: "vs prev. week",
    navigateTo: null as Page | null,
    accentColor: "#2F80ED",
    glowColor: "rgba(47,128,237,0.18)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: "30-Day Forecast",
    value: "$45.20", unit: "/ MT",
    trend: "+5.6%", trendDir: "up", sub: "expected change",
    navigateTo: "routes" as Page,
    accentColor: "#10B981",
    glowColor: "rgba(16,185,129,0.15)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    label: "Matching Vessels",
    value: "24", unit: "",
    trend: "128 analyzed", trendDir: "neutral", sub: "available now",
    navigateTo: "vessels" as Page,
    accentColor: "#06B6D4",
    glowColor: "rgba(6,182,212,0.15)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
        <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
        <path d="M12 3v4"/>
      </svg>
    ),
  },
  {
    label: "Operational Risk",
    value: "MEDIUM", unit: "",
    trend: "4 active alerts", trendDir: "warning", sub: "risk level",
    navigateTo: "ports" as Page,
    accentColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.15)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

/* ─── Alert data ─────────────────────────────────────────────────────────── */
const alerts = [
  { severity: "critical", port: "Paradip Port",  title: "Potential demurrage exposure",       detail: "Delay: 18 hrs · Est. cost: ₹1.8L",              navigateTo: "ports" as Page },
  { severity: "warning",  port: "Haldia Port",   title: "Draft restriction during low tide",  detail: "Window: 06:00–10:00 IST · Max draft: 9.5m",     navigateTo: "ports" as Page },
  { severity: "success",  port: "Vizag Port",    title: "No major operational restrictions",  detail: "All berths operational · Congestion: LOW",       navigateTo: null as Page | null },
  { severity: "warning",  port: "Mumbai Port",   title: "Moderate vessel congestion",         detail: "Avg wait: 6.2 hrs · 14 vessels queued",          navigateTo: "ports" as Page },
];

/* ─── News data ──────────────────────────────────────────────────────────── */
type NewsSev = "critical" | "warning" | "positive" | "neutral";
const news: { headline: string; category: string; tag: string; time: string; sev: NewsSev; excerpt: string; to: Page }[] = [
  {
    headline: "Paradip Port berth congestion rises to 58% — 8–12 hr delays reported",
    category: "Paradip Port", tag: "PORT OPS", time: "47m ago", sev: "warning",
    excerpt: "Berths 4–6 under maintenance. Vessels >195m LOA must contact VHF Ch 16 before entry.",
    to: "ports",
  },
  {
    headline: "Haldia tidal window narrows: spring tides Sep 7–9, effective max draft 8.8m",
    category: "Haldia Port", tag: "TIDAL ALERT", time: "1h 20m ago", sev: "critical",
    excerpt: "Panamax and above must reschedule or arrange lightening. CIWTC advisory #HLD-2026-091 in effect.",
    to: "ports",
  },
  {
    headline: "BSI Panamax index up 3.1% WoW — coal demand from Indian utilities driving rates",
    category: "Freight Market", tag: "MARKET", time: "2h ago", sev: "positive",
    excerpt: "Baltic Panamax Index reached 1,842 pts. Indian Power Ministry Q4 bulk coal procurement cited.",
    to: "routes",
  },
  {
    headline: "Haldia vessel queue exceeds 14 ships — demurrage climbing for coal charterers",
    category: "Shipping Market", tag: "MARKET", time: "3h 15m ago", sev: "warning",
    excerpt: "Daily demurrage at Haldia now $18,000–$22,000/day for Supramax class vessels.",
    to: "ports",
  },
];

/* ─── Market indicators ──────────────────────────────────────────────────── */
const indicators = [
  { label: "Bunker Cost",         value: "$612/MT",  change: "+2.4%", dir: "up",   bars: [3,4,3,5,4,6,5], color: "#F59E0B" },
  { label: "Freight Demand",      value: "74.2",     change: "+1.1%", dir: "up",   bars: [4,5,4,6,5,7,6], color: "#2F80ED" },
  { label: "Port Congestion",     value: "68%",      change: "+7.1%", dir: "up",   bars: [3,4,4,5,5,6,6], color: "#EF4444" },
  { label: "Vessel Availability", value: "82%",      change: "-3.2%", dir: "down", bars: [7,6,6,5,6,5,5], color: "#10B981" },
  { label: "Avg Waiting Time",    value: "8.4 hrs",  change: "+0.8h", dir: "up",   bars: [3,4,4,5,4,5,5], color: "#F59E0B" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const sevLabel: Record<string, string> = { critical: "HIGH", warning: "MEDIUM", success: "LOW" };

const newsColors: Record<NewsSev, { dot: string; label: string; lc: string; bg: string; bd: string }> = {
  critical: { dot: "#EF4444", label: "HIGH",     lc: "#EF4444", bg: "rgba(239,68,68,0.07)",  bd: "rgba(239,68,68,0.22)" },
  warning:  { dot: "#F59E0B", label: "MEDIUM",   lc: "#F59E0B", bg: "rgba(245,158,11,0.07)", bd: "rgba(245,158,11,0.22)" },
  positive: { dot: "#10B981", label: "POSITIVE", lc: "#10B981", bg: "rgba(16,185,129,0.06)",  bd: "rgba(16,185,129,0.2)" },
  neutral:  { dot: "#2F80ED", label: "INFO",     lc: "#4C9EFF", bg: "rgba(47,128,237,0.06)",  bd: "rgba(47,128,237,0.2)" },
};

function Sparkline({ bars, color }: { bars: number[]; color: string }) {
  const max = Math.max(...bars);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 22 }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          width: 4, borderRadius: "2px 2px 0 0",
          height: `${(b / max) * 100}%`,
          background: i === bars.length - 1 ? color : color + "44",
        }} />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Dashboard({ navigate }: Props) {
  const [kpiHover, setKpiHover] = useState<number | null>(null);
  const [alertHover, setAlertHover] = useState<number | null>(null);
  const [newsHover, setNewsHover] = useState<number | null>(null);

  return (
    <div style={{ padding: "22px 26px", minHeight: "100%", background: "#070C12" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#EDF2F7", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.2 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#2A4258", margin: "5px 0 0", letterSpacing: "0.01em" }}>Freight intelligence, vessel operations & risk monitoring</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select className="select-field" style={{ width: "auto", fontSize: 12 }}>
            <option>Sep 2026</option><option>Oct 2026</option>
          </select>
          <button className="btn-secondary" style={{ fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
          <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => navigate("vessels")}>
            Find Vessels →
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((kpi, i) => {
          const hov = kpiHover === i;
          return (
            <div
              key={i}
              className="kpi-card"
              onClick={() => kpi.navigateTo && navigate(kpi.navigateTo)}
              onMouseEnter={() => setKpiHover(i)}
              onMouseLeave={() => setKpiHover(null)}
              style={{
                cursor: kpi.navigateTo ? "pointer" : "default",
                transform: hov && kpi.navigateTo ? "translateY(-2px)" : "none",
                borderColor: hov && kpi.navigateTo ? `rgba(47,128,237,0.45)` : undefined,
                boxShadow: hov && kpi.navigateTo ? `0 0 0 1px rgba(47,128,237,0.1), 0 8px 28px rgba(0,0,0,0.4)` : undefined,
              }}
            >
              {/* Top accent strip */}
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 2,
                background: `linear-gradient(90deg, transparent, ${kpi.accentColor}66, transparent)`,
                borderRadius: "0 0 2px 2px",
              }} />

              {/* Icon bg glow */}
              <div style={{
                position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 9,
                background: kpi.glowColor,
                border: `1px solid ${kpi.accentColor}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: kpi.accentColor,
              }}>
                {kpi.icon}
              </div>

              <div style={{ paddingRight: 48 }}>
                <div style={{ fontSize: 11, color: "#2A4258", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
                  {kpi.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 7 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: kpi.value === "MEDIUM" ? 20 : 26,
                    fontWeight: 700,
                    color: kpi.value === "MEDIUM" ? "#F59E0B" : "#EDF2F7",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}>{kpi.value}</span>
                  {kpi.unit && <span style={{ fontSize: 12, color: "#2A4258", fontWeight: 500 }}>{kpi.unit}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: kpi.trendDir === "up" ? "#10B981" : kpi.trendDir === "down" ? "#EF4444" : kpi.trendDir === "warning" ? "#F59E0B" : "#7A9AB8",
                  }}>
                    {kpi.trendDir === "up" ? "▲" : kpi.trendDir === "down" ? "▼" : ""} {kpi.trend}
                  </span>
                  <span style={{ fontSize: 11, color: "#1F3A52" }}>{kpi.sub}</span>
                </div>
                {kpi.navigateTo && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                    color: hov ? "#4C9EFF" : "#1F3A52",
                    marginTop: 9, transition: "color 0.14s",
                    textTransform: "uppercase",
                  }}>
                    {kpi.navigateTo === "vessels" ? "Open Vessel Directory" : kpi.navigateTo === "routes" ? "Open Route Analytics" : "Open Port Constraints"} →
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Forecast chart ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(145deg, #0D1520 0%, #111D2B 100%)",
        border: "1px solid #1F3044",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle top glow line */}
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(47,128,237,0.3), transparent)" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#C4D4E2", letterSpacing: "-0.01em", marginBottom: 3 }}>
              30-Day Freight Rate Forecast
            </div>
            <div style={{ fontSize: 11, color: "#2A4258" }}>Projected movement based on historical and market indicators</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select className="select-field" style={{ width: "auto", fontSize: 11, padding: "5px 28px 5px 10px", height: 32 }}>
              <option>All Routes</option>
              <option>Mumbai–Paradip</option>
              <option>Mumbai–Haldia</option>
            </select>
            <select className="select-field" style={{ width: "auto", fontSize: 11, padding: "5px 28px 5px 10px", height: 32 }}>
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
            </select>
            <button className="btn-ghost" style={{ fontSize: 11, color: "#4C9EFF" }} onClick={() => navigate("routes")}>
              Full Analytics →
            </button>
          </div>
        </div>

        {/* Insight banner */}
        <div style={{
          background: "rgba(47,128,237,0.07)",
          border: "1px solid rgba(47,128,237,0.2)",
          borderRadius: 8, padding: "9px 14px", marginBottom: 16,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <svg style={{ color: "#4C9EFF", flexShrink: 0, marginTop: 1 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: "#4C9EFF" }}>Forecast Insight · </span>
            <span style={{ color: "#7A9AB8" }}>Freight rates expected to rise over 30 days with elevated volatility around mid-September. Consider locking rates before Sep 14.</span>
          </div>
        </div>

        <FreightChart />

        <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
          {[
            { label: "Historical Rate",     sw: 16, sh: 2, sc: "#2F80ED" },
            { label: "Forecast",            sw: 16, sh: 2, sc: "#10B981" },
            { label: "Confidence Interval", sw: 16, sh: 8, sc: "rgba(47,128,237,0.18)" },
          ].map(({ label, sw, sh, sc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: sw, height: sh, background: sc, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: "#253D54" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Risk Alerts + News ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Risk Alerts */}
        <div style={{ background: "linear-gradient(145deg, #0D1520, #111D2B)", border: "1px solid #1F3044", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #162030", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#C4D4E2", letterSpacing: "-0.01em" }}>Operational Risk Alerts</span>
            </div>
            <span className="badge badge-critical">4 Active</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`risk-alert ${a.severity}`}
                onMouseEnter={() => setAlertHover(i)}
                onMouseLeave={() => setAlertHover(null)}
                onClick={() => a.navigateTo && navigate(a.navigateTo)}
                style={{ cursor: a.navigateTo ? "pointer" : "default" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span className={`badge badge-${a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "success"}`} style={{ fontSize: 10 }}>
                    {sevLabel[a.severity]}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#C4D4E2" }}>{a.port}</span>
                </div>
                <div style={{ fontSize: 12, color: "#7A9AB8", marginBottom: 4, lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: "#2A4258", fontFamily: "'JetBrains Mono', monospace" }}>{a.detail}</div>
                {a.severity !== "success" && (
                  <button
                    className="btn-ghost"
                    style={{ marginTop: 7, fontSize: 11, padding: "4px 8px", color: alertHover === i ? "#4C9EFF" : "#2F80ED" }}
                    onClick={e => { e.stopPropagation(); a.navigateTo && navigate(a.navigateTo); }}
                  >
                    View Details →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current News */}
        <div style={{ background: "linear-gradient(145deg, #0D1520, #111D2B)", border: "1px solid #1F3044", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #162030", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4C9EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#C4D4E2", letterSpacing: "-0.01em" }}>Current News</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", background: "rgba(47,128,237,0.1)", border: "1px solid rgba(47,128,237,0.22)", borderRadius: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2F80ED", boxShadow: "0 0 8px rgba(47,128,237,0.9)" }} />
                <span style={{ fontSize: 9.5, color: "#4C9EFF", fontWeight: 800, letterSpacing: "0.1em" }}>LIVE</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#1F3A52" }}>Maritime intelligence</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {news.map((item, i) => {
              const cfg = newsColors[item.sev];
              const hov = newsHover === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setNewsHover(i)}
                  onMouseLeave={() => setNewsHover(null)}
                  onClick={() => navigate(item.to)}
                  style={{
                    background: hov ? "rgba(22,32,48,0.85)" : "rgba(10,18,28,0.6)",
                    borderTop: `1px solid ${hov ? cfg.bd : "rgba(31,48,68,0.5)"}`,
                    borderRight: `1px solid ${hov ? cfg.bd : "rgba(31,48,68,0.5)"}`,
                    borderBottom: `1px solid ${hov ? cfg.bd : "rgba(31,48,68,0.5)"}`,
                    borderLeft: `3px solid ${cfg.dot}`,
                    borderRadius: 8, padding: "11px 13px",
                    cursor: "pointer", transition: "background 0.12s, border-color 0.12s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                      color: cfg.lc, background: cfg.bg, border: `1px solid ${cfg.bd}`,
                      padding: "1px 6px", borderRadius: 3,
                    }}>
                      {item.tag}
                    </span>
                    <span style={{ fontSize: 11, color: "#253D54", fontWeight: 500 }}>{item.category}</span>
                    <span style={{ fontSize: 10, color: "#1A3044", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: hov ? "#EDF2F7" : "#7A9AB8", lineHeight: 1.45, marginBottom: 5 }}>
                    {item.headline}
                  </div>
                  <div style={{ fontSize: 11, color: "#1F3A52", lineHeight: 1.5, marginBottom: 7 }}>{item.excerpt}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: hov ? "#4C9EFF" : "#2F80ED", transition: "color 0.12s" }}>
                    {item.to === "ports" ? "View Port Constraints →" : "View Route Analytics →"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Market indicators ─────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(145deg, #0D1520, #111D2B)", border: "1px solid #1F3044", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "13px 20px 11px", borderBottom: "1px solid #162030", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#C4D4E2", letterSpacing: "-0.01em" }}>Market & Operational Indicators</span>
          <button className="btn-ghost" style={{ fontSize: 11, color: "#4C9EFF" }} onClick={() => navigate("routes")}>
            Route Analytics →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {indicators.map((ind, i) => (
            <div key={i} style={{ padding: "14px 18px", borderRight: i < indicators.length - 1 ? "1px solid #162030" : "none" }}>
              <div style={{ fontSize: 10.5, color: "#253D54", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>{ind.label}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "#C4D4E2" }}>{ind.value}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: ind.dir === "up" ? "#EF4444" : "#10B981" }}>
                  {ind.dir === "up" ? "▲" : "▼"} {ind.change}
                </span>
              </div>
              <Sparkline bars={ind.bars} color={ind.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
