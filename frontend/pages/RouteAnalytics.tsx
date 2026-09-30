import { useState, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const ROUTES = [
  { id: "mum-par", label: "Mumbai → Paradip", origin: "Mumbai", dest: "Paradip", distance: 1280, transit: 4.2, freightRate: 41.2, reliability: 94, congestion: "Medium", risk: "LOW", riskScore: 88 },
  { id: "mum-hal", label: "Mumbai → Haldia",  origin: "Mumbai", dest: "Haldia",  distance: 1350, transit: 4.7, freightRate: 44.1, reliability: 78, congestion: "High",   risk: "MEDIUM", riskScore: 62 },
  { id: "mum-viz", label: "Mumbai → Vizag",   origin: "Mumbai", dest: "Vizag",   distance: 1160, transit: 3.9, freightRate: 42.8, reliability: 89, congestion: "Low",    risk: "LOW", riskScore: 82 },
  { id: "che-par", label: "Chennai → Paradip",origin: "Chennai",dest: "Paradip", distance: 980,  transit: 3.4, freightRate: 39.5, reliability: 91, congestion: "Low",    risk: "LOW", riskScore: 90 },
  { id: "che-hal", label: "Chennai → Haldia", origin: "Chennai",dest: "Haldia",  distance: 1100, transit: 3.9, freightRate: 42.0, reliability: 80, congestion: "Medium", risk: "MEDIUM", riskScore: 71 },
];

const buildChartData = (route: typeof ROUTES[0]) => {
  const base = route.freightRate - 4;
  const seed = route.id.charCodeAt(0);
  const hist = [
    { date: "Aug 4",  actual: +(base + 0.4).toFixed(2) },
    { date: "Aug 7",  actual: +(base - 0.2).toFixed(2) },
    { date: "Aug 11", actual: +(base + 1.1).toFixed(2) },
    { date: "Aug 14", actual: +(base + 0.5).toFixed(2) },
    { date: "Aug 18", actual: +(base + 2.2).toFixed(2) },
    { date: "Aug 21", actual: +(base + 3.5).toFixed(2) },
    { date: "Aug 25", actual: +(base + 2.8).toFixed(2) },
    { date: "Aug 28", actual: +(base + 4.1).toFixed(2) },
    { date: "Sep 1",  actual: +route.freightRate.toFixed(2) },
  ];
  const fcast = [
    { date: "Sep 1",  forecast: +route.freightRate.toFixed(2),       upper: +(route.freightRate + 0.7).toFixed(2), lower: +(route.freightRate - 0.7).toFixed(2) },
    { date: "Sep 4",  forecast: +(route.freightRate + 0.5).toFixed(2), upper: +(route.freightRate + 1.6).toFixed(2), lower: +(route.freightRate - 0.1).toFixed(2) },
    { date: "Sep 7",  forecast: +(route.freightRate + 1.0).toFixed(2), upper: +(route.freightRate + 2.7).toFixed(2), lower: +(route.freightRate - 0.1).toFixed(2) },
    { date: "Sep 10", forecast: +(route.freightRate + 1.4).toFixed(2), upper: +(route.freightRate + 3.3).toFixed(2), lower: +(route.freightRate + 0.3).toFixed(2) },
    { date: "Sep 14", forecast: +(route.freightRate + 2.1).toFixed(2), upper: +(route.freightRate + 4.4).toFixed(2), lower: +(route.freightRate + 0.6).toFixed(2) },
    { date: "Sep 18", forecast: +(route.freightRate + 2.3).toFixed(2), upper: +(route.freightRate + 5.0).toFixed(2), lower: +(route.freightRate + 0.4).toFixed(2) },
    { date: "Sep 22", forecast: +(route.freightRate + 2.0).toFixed(2), upper: +(route.freightRate + 4.7).toFixed(2), lower: +(route.freightRate + 0.1).toFixed(2) },
    { date: "Sep 25", forecast: +(route.freightRate + 2.4).toFixed(2), upper: +(route.freightRate + 5.2).toFixed(2), lower: +(route.freightRate + 0.4).toFixed(2) },
    { date: "Oct 1",  forecast: +(route.freightRate + 2.4).toFixed(2), upper: +(route.freightRate + 5.4).toFixed(2), lower: +(route.freightRate + 0.2).toFixed(2) },
  ];
  const merged: Record<string, any> = {};
  hist.forEach(d => { merged[d.date] = { date: d.date, actual: d.actual }; });
  fcast.forEach(d => { merged[d.date] = { ...(merged[d.date] || {}), date: d.date, forecast: d.forecast, upper: d.upper, lower: d.lower }; });
  return Object.values(merged);
};

const buildTransitData = (routes: typeof ROUTES) =>
  routes.map(r => ({ name: r.label.split("→")[1].trim(), transit: r.transit, risk: r.riskScore, freight: r.freightRate }));

const congestionHistory = [
  { date: "Aug 21", paradip: 52, haldia: 61, vizag: 28 },
  { date: "Aug 25", paradip: 56, haldia: 68, vizag: 30 },
  { date: "Aug 28", paradip: 60, haldia: 73, vizag: 27 },
  { date: "Sep 1",  paradip: 58, haldia: 80, vizag: 24 },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const riskBadgeClass = (r: string) => r === "LOW" ? "badge-success" : r === "MEDIUM" ? "badge-warning" : "badge-critical";
const congColor = (c: string) => c === "High" ? "#EF4444" : c === "Medium" ? "#F59E0B" : "#22C55E";
const congPct  = (c: string) => c === "High" ? 80 : c === "Medium" ? 52 : 22;

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 600, color: "#F8FAFC", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => p.value != null && (
        <div key={p.dataKey} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 2 }}>
          <div style={{ width: 8, height: 2, background: p.color, borderRadius: 1, marginTop: 5, flexShrink: 0 }} />
          <span style={{ color: "#64748B" }}>{p.name}</span>
          <span className="mono" style={{ color: "#F8FAFC", fontWeight: 600, marginLeft: "auto" }}>
            {typeof p.value === "number" && p.name?.toLowerCase().includes("rate") ? `$${p.value.toFixed(2)}/MT` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Sub-components ────────────────────────────────────────────────────── */

function KPICard({ label, value, unit, sub, trend, trendDir, icon }: any) {
  return (
    <div className="kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{label}</span>
        <span style={{ color: "#3B82F6", opacity: 0.7 }} dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 5 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em" }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "#64748B" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {trend && <span style={{ fontSize: 12, fontWeight: 600, color: trendDir === "up" ? "#22C55E" : trendDir === "down" ? "#EF4444" : "#F59E0B" }}>
          {trendDir === "up" ? "▲" : trendDir === "down" ? "▼" : "●"} {trend}
        </span>}
        {sub && <span style={{ fontSize: 11, color: "#64748B" }}>{sub}</span>}
      </div>
    </div>
  );
}

function RouteSummaryPanel({ route }: { route: typeof ROUTES[0] }) {
  return (
    <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Route Summary</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 14 }}>{route.label}</div>

      {[
        { label: "Freight Rate",   value: `$${route.freightRate.toFixed(2)}/MT`, color: "#F8FAFC" },
        { label: "Distance",       value: `${route.distance} NM`,                color: "#F8FAFC" },
        { label: "Transit Time",   value: `${route.transit} days`,               color: "#F8FAFC" },
        { label: "Reliability",    value: `${route.reliability}%`,               color: route.reliability >= 90 ? "#22C55E" : route.reliability >= 75 ? "#F59E0B" : "#EF4444" },
        { label: "Congestion",     value: route.congestion,                       color: congColor(route.congestion) },
        { label: "Risk Level",     value: route.risk,                             color: route.risk === "LOW" ? "#22C55E" : route.risk === "MEDIUM" ? "#F59E0B" : "#EF4444" },
        { label: "Route Score",    value: `${route.riskScore}%`,                  color: route.riskScore >= 85 ? "#22C55E" : route.riskScore >= 65 ? "#F59E0B" : "#EF4444" },
      ].map(row => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1C2733" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>{row.label}</span>
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
        </div>
      ))}

      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#64748B" }}>Route Score</span>
          <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: route.riskScore >= 85 ? "#22C55E" : "#F59E0B" }}>{route.riskScore}%</span>
        </div>
        <div className="match-score-bar">
          <div className="match-score-fill" style={{ width: `${route.riskScore}%` }} />
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, color: "#3B4A5A" }}>Last updated: 2 min ago · Source: MarineTraffic / IPA</div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function RouteAnalytics() {
  const [selectedRouteId, setSelectedRouteId] = useState("mum-par");
  const [period, setPeriod] = useState("30d");
  const [cargoType, setCargoType] = useState("Coal");

  const route = ROUTES.find(r => r.id === selectedRouteId) ?? ROUTES[0];
  const chartData = useMemo(() => buildChartData(route), [selectedRouteId]);
  const transitData = buildTransitData(ROUTES);

  const yDomain: [number, number] = [Math.floor(route.freightRate - 5), Math.ceil(route.freightRate + 6)];

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>Route Analytics</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Freight rate trends, transit performance & route risk by corridor</p>
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748B" }}>
          <span style={{ color: "#22C55E" }}>●</span> Live data &nbsp;·&nbsp; Sep 3, 2026 · 14:22 IST
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Route</label>
            <select className="select-field" value={selectedRouteId} onChange={e => setSelectedRouteId(e.target.value)}>
              {ROUTES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Cargo Type</label>
            <select className="select-field" value={cargoType} onChange={e => setCargoType(e.target.value)}>
              {["Coal", "Iron Ore", "Grain", "Fertilizer", "Bauxite"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Period</label>
            <select className="select-field" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="30d">30 Days</option>
              <option value="60d">60 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Date Range</label>
            <input className="input-field" defaultValue="Aug 4 – Oct 1, 2026" style={{ fontSize: 12 }} />
          </div>
          <button className="btn-primary" style={{ height: 36, whiteSpace: "nowrap" }}>Apply Filters</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <KPICard
          label="Avg Freight Rate"
          value={`$${route.freightRate.toFixed(2)}`}
          unit="/ MT"
          trend="+2.3%"
          trendDir="up"
          sub="vs prior 30d"
          icon={`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`}
        />
        <KPICard
          label="Avg Transit Time"
          value={route.transit.toFixed(1)}
          unit="days"
          trend="+0.2d"
          trendDir="down"
          sub="vs prior 30d"
          icon={`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`}
        />
        <KPICard
          label="Route Reliability"
          value={`${route.reliability}%`}
          unit=""
          trend={route.reliability >= 85 ? "High" : "Moderate"}
          trendDir={route.reliability >= 85 ? "up" : "neutral"}
          sub="on-time performance"
          icon={`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`}
        />
        <KPICard
          label="Port Congestion"
          value={congPct(route.congestion) + "%"}
          unit=""
          trend={route.congestion}
          trendDir={route.congestion === "High" ? "down" : route.congestion === "Medium" ? "neutral" : "up"}
          sub={`at ${route.dest}`}
          icon={`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`}
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14, marginBottom: 14 }}>
        {/* Freight Rate Chart */}
        <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC", marginBottom: 2 }}>Freight Rate Trend &amp; Forecast</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{route.label} · {cargoType} · $/MT</div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {[["Historical Rate", "#3B82F6", false], ["Forecast", "#22C55E", true], ["Confidence Band", "rgba(59,130,246,0.2)", false]].map(([label, color, dashed]) => (
                <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 2, background: color as string, borderRadius: 1, borderTop: dashed ? "1px dashed " + color : "none" }} />
                  <span style={{ fontSize: 10, color: "#64748B" }}>{label as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insight */}
          <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 5, padding: "7px 11px", marginBottom: 14, display: "flex", gap: 7 }}>
            <svg style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1 }} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>
              <span style={{ color: "#3B82F6", fontWeight: 600 }}>Forecast Insight · </span>
              Freight rates on {route.label} are projected to rise ~{(((route.freightRate + 2.4) - route.freightRate) / route.freightRate * 100).toFixed(1)}% over 30 days. Elevated volatility expected mid-September due to port congestion at {route.dest}.
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1C2733" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} domain={yDomain} width={44} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine x="Sep 1" stroke="#3B82F6" strokeDasharray="3 3" strokeWidth={1} label={{ value: "TODAY", fill: "#3B82F6", fontSize: 9, fontWeight: 700 }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confBand)" name="Upper bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#0B0F14" name="Lower bound" />
              <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} name="Historical Rate" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Forecast Rate" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Panel */}
        <RouteSummaryPanel route={route} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Transit Time comparison */}
        <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 3 }}>Transit Time Comparison</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 14 }}>Days at sea per route — all corridors</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={transitData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1C2733" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} domain={[3, 5.5]} tickFormatter={v => `${v}d`} width={32} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="transit" name="Transit (days)" radius={[3, 3, 0, 0]}
                fill="transparent"
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const isActive = transitData[index]?.name === route.dest;
                  return <rect x={x} y={y} width={width} height={height} fill={isActive ? "#3B82F6" : "rgba(59,130,246,0.28)"} rx={3} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Congestion Trend */}
        <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 3 }}>Port Congestion Trend</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 14 }}>7-day congestion index across major ports (%)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={congestionHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1C2733" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} domain={[15, 90]} tickFormatter={v => `${v}%`} width={36} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="paradip" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="Paradip" />
              <Line type="monotone" dataKey="haldia"  stroke="#EF4444" strokeWidth={1.5} dot={false} name="Haldia"  />
              <Line type="monotone" dataKey="vizag"   stroke="#22C55E" strokeWidth={1.5} dot={false} name="Vizag"   />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {[["Paradip", "#3B82F6"], ["Haldia", "#EF4444"], ["Vizag", "#22C55E"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 2, background: c, borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: "#64748B" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Risk Indicator */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "14px 20px", marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC", marginBottom: 12 }}>Route Risk Matrix — All Corridors</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
          {ROUTES.map((r, i) => (
            <div
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              style={{
                padding: "12px 14px",
                borderRight: i < ROUTES.length - 1 ? "1px solid #1C2733" : "none",
                cursor: "pointer",
                background: selectedRouteId === r.id ? "rgba(59,130,246,0.06)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <div style={{ fontSize: 11, color: "#F8FAFC", fontWeight: 600, marginBottom: 4 }}>{r.label.split("→")[1].trim()}</div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8 }}>{r.label.split("→")[0].trim()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#64748B" }}>Freight</span>
                  <span className="mono" style={{ fontSize: 10, color: "#F8FAFC", fontWeight: 600 }}>${r.freightRate}/MT</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#64748B" }}>Transit</span>
                  <span className="mono" style={{ fontSize: 10, color: "#F8FAFC" }}>{r.transit}d</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#64748B" }}>Risk</span>
                  <span className={`badge ${riskBadgeClass(r.risk)}`} style={{ fontSize: 9, padding: "1px 5px" }}>{r.risk}</span>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 3, background: "#1C2733", borderRadius: 2 }}>
                  <div style={{ width: `${r.riskScore}%`, height: "100%", background: r.riskScore >= 85 ? "#22C55E" : r.riskScore >= 65 ? "#F59E0B" : "#EF4444", borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
