import { useState } from "react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const PORTS = {
  Paradip: {
    region: "Odisha",
    maxDraft: 10.0,
    maxLOA: 200,
    maxBeam: 32,
    channelDepth: 10.5,
    tidalRestriction: "Required (2 windows/day)",
    berthingRestriction: "No night berthing for Capesize",
    berths: 6,
    availBerths: 3,
    congestionPct: 58,
    congestion: "Medium",
    status: "Active",
    waitingHrs: 8.4,
    demurrageRisk: "MEDIUM",
    lastUpdated: "2 hrs ago",
    tidalWindow: "06:00–10:00 & 18:00–22:00 IST",
    note: "Channel dredging ongoing; max draft reduced by 0.5m until Oct 15.",
  },
  Haldia: {
    region: "West Bengal",
    maxDraft: 9.5,
    maxLOA: 190,
    maxBeam: 30,
    channelDepth: 9.8,
    tidalRestriction: "Mandatory (HW ± 2h)",
    berthingRestriction: "Daylight only · Panamax restricted during spring tides",
    berths: 4,
    availBerths: 1,
    congestionPct: 80,
    congestion: "High",
    status: "Restricted",
    waitingHrs: 14.2,
    demurrageRisk: "HIGH",
    lastUpdated: "45 min ago",
    tidalWindow: "Variable — check CIWTC notice",
    note: "High sedimentation. LOA > 185m requires special permission from CIWTC.",
  },
};

type PortName = keyof typeof PORTS;

const VESSEL_CLASSES = [
  { name: "Handysize",  capacity: "10–35k MT", draft: 8.2,  loa: 150, beam: 23 },
  { name: "Handymax",   capacity: "35–50k MT", draft: 8.8,  loa: 165, beam: 27 },
  { name: "Supramax",   capacity: "50–60k MT", draft: 9.1,  loa: 175, beam: 28 },
  { name: "Ultramax",   capacity: "60–65k MT", draft: 9.4,  loa: 180, beam: 29 },
  { name: "Panamax",    capacity: "60–80k MT", draft: 9.8,  loa: 190, beam: 32 },
  { name: "Post-Pax",   capacity: "80–100k MT",draft: 10.8, loa: 220, beam: 36 },
  { name: "Capesize",   capacity: "100k+ MT",  draft: 13.1, loa: 260, beam: 43 },
];

const WARNINGS = [
  { sev: "HIGH",   port: "Haldia",  text: "Spring tides forecast Sep 7–9. Effective max draft drops to 8.8m. All Panamax arrivals must be rescheduled or lightened.", ts: "Updated: 1 hr ago" },
  { sev: "HIGH",   port: "Paradip", text: "Channel dredging in progress (Berth 4–6). Max draft temporarily 9.5m until Oct 15, 2026. Confirm with Port Authority before arrival.", ts: "Updated: 2 hrs ago" },
  { sev: "MEDIUM", port: "Haldia",  text: "Only 1 berth operational (Berth 2). Expected congestion wait: 12–16 hrs for bulk carriers.", ts: "Updated: 45 min ago" },
  { sev: "MEDIUM", port: "Paradip", text: "LOA > 195m vessels: call Port Control on VHF Ch 16 prior to entry. Pilotage compulsory.", ts: "Updated: 3 hrs ago" },
  { sev: "LOW",    port: "Paradip", text: "Minor swell 1.2m forecast Sep 4–5. No operational impact expected. Monitor weather window.", ts: "Updated: 4 hrs ago" },
  { sev: "LOW",    port: "Haldia",  text: "Fog advisory for Hooghly River: reduced visibility possible early mornings Sep 6–8.", ts: "Updated: 6 hrs ago" },
];

/* ─── Helper components ─────────────────────────────────────────────────── */

type Status = "ok" | "warn" | "block";
function StatusCell({ status, label }: { status: Status; label: string }) {
  const cfg = {
    ok:    { color: "#22C55E", icon: "✓", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.18)" },
    warn:  { color: "#F59E0B", icon: "⚠", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.18)" },
    block: { color: "#EF4444", icon: "✕", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.18)" },
  }[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, width: "fit-content" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.icon}</span>
      <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function MeterBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: "#1C2733", borderRadius: 2, marginTop: 4 }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

const vesselCompat = (vessel: typeof VESSEL_CLASSES[0], port: typeof PORTS[PortName]) => ({
  draft: vessel.draft <= port.maxDraft,
  loa:   vessel.loa <= port.maxLOA,
  beam:  vessel.beam <= port.maxBeam,
  get all() { return this.draft && this.loa && this.beam; },
});

const sevClass = (s: string) => s === "HIGH" ? "badge-critical" : s === "MEDIUM" ? "badge-warning" : "badge-success";
const congColor = (c: string) => c === "High" ? "#EF4444" : c === "Medium" ? "#F59E0B" : "#22C55E";

/* ─── Comparison table row ──────────────────────────────────────────────── */

function CompRow({
  label, icon,
  par, hal,
  parStatus, halStatus,
  note,
}: {
  label: string; icon?: string;
  par: string; hal: string;
  parStatus: Status; halStatus: Status;
  note?: string;
}) {
  return (
    <tr>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(37,48,59,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <span style={{ color: "#64748B", opacity: 0.7 }} dangerouslySetInnerHTML={{ __html: icon }} />}
          <div>
            <div style={{ fontSize: 12, color: "#F8FAFC", fontWeight: 500 }}>{label}</div>
            {note && <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{note}</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(37,48,59,0.5)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="mono" style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 600 }}>{par}</span>
          <StatusCell status={parStatus} label={parStatus === "ok" ? "Clear" : parStatus === "warn" ? "Conditional" : "Blocked"} />
        </div>
      </td>
      <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(37,48,59,0.5)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="mono" style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 600 }}>{hal}</span>
          <StatusCell status={halStatus} label={halStatus === "ok" ? "Clear" : halStatus === "warn" ? "Conditional" : "Blocked"} />
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function PortConstraints() {
  const [selectedPort, setSelectedPort] = useState<PortName | "All">("All");
  const [vesselClass, setVesselClass] = useState("All Classes");
  const [search, setSearch] = useState("");

  const par = PORTS.Paradip;
  const hal = PORTS.Haldia;

  const activeWarnings = WARNINGS.filter(w =>
    (selectedPort === "All" || w.port === selectedPort) &&
    (!search || w.text.toLowerCase().includes(search.toLowerCase()) || w.port.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVessels = VESSEL_CLASSES.filter(v =>
    vesselClass === "All Classes" || v.name === vesselClass
  );

  const sevCounts = { HIGH: WARNINGS.filter(w => w.sev === "HIGH").length, MEDIUM: WARNINGS.filter(w => w.sev === "MEDIUM").length, LOW: WARNINGS.filter(w => w.sev === "LOW").length };

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>Port Constraints</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Physical limits, tidal windows, berth availability & operational restrictions</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="badge badge-critical">{sevCounts.HIGH} HIGH</span>
          <span className="badge badge-warning">{sevCounts.MEDIUM} MEDIUM</span>
          <span className="badge badge-success">{sevCounts.LOW} LOW</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 10, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Port Filter</label>
          <select className="select-field" style={{ width: 160 }} value={selectedPort} onChange={e => setSelectedPort(e.target.value as any)}>
            <option value="All">All Ports</option>
            <option>Paradip</option>
            <option>Haldia</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Vessel Class</label>
          <select className="select-field" style={{ width: 160 }} value={vesselClass} onChange={e => setVesselClass(e.target.value)}>
            <option>All Classes</option>
            {VESSEL_CLASSES.map(v => <option key={v.name}>{v.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, maxWidth: 260 }}>
          <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Search Warnings</label>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="input-field" style={{ paddingLeft: 28, fontSize: 12 }} />
          </div>
        </div>
        <button className="btn-secondary" style={{ height: 36, fontSize: 12 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      {/* Port status banners */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {(["Paradip", "Haldia"] as PortName[]).map(name => {
          const p = PORTS[name];
          return (
            <div key={name} style={{ background: "#111821", border: `1px solid ${p.status === "Active" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.25)"}`, borderRadius: 8, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{name} Port</span>
                  <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8 }}>{p.region}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className={`badge ${p.status === "Active" ? "badge-success" : "badge-critical"}`}>{p.status}</span>
                  <span className={`badge ${p.demurrageRisk === "HIGH" ? "badge-critical" : p.demurrageRisk === "MEDIUM" ? "badge-warning" : "badge-success"}`}>Demurrage: {p.demurrageRisk}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                {[
                  ["Max Draft", `${p.maxDraft}m`],
                  ["Max LOA",   `${p.maxLOA}m`],
                  ["Max Beam",  `${p.maxBeam}m`],
                  ["Wait Time", `${p.waitingHrs}h`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(11,15,20,0.6)", borderRadius: 5, padding: "7px 10px", border: "1px solid #1C2733" }}>
                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>{k}</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>Congestion</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: congColor(p.congestion) }}>{p.congestionPct}% — {p.congestion}</span>
                </div>
                <MeterBar pct={p.congestionPct} color={congColor(p.congestion)} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>Berths available</span>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#F8FAFC" }}>{p.availBerths} / {p.berths}</span>
              </div>
              {p.note && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#F59E0B", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 4, padding: "5px 9px" }}>
                  ⚠ {p.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Constraints comparison table */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, marginBottom: 14 }}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid #25303B", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>Constraint Comparison</span>
          <span className="badge badge-muted">Paradip vs Haldia</span>
          <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>
            <span className="status-dot success" style={{ marginRight: 4 }} /> Compatible &nbsp;
            <span className="status-dot warning" style={{ marginRight: 4 }} /> Conditional &nbsp;
            <span className="status-dot critical" style={{ marginRight: 4 }} /> Blocked
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(11,15,20,0.5)" }}>
                <th style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", width: "38%" }}>Constraint / Parameter</th>
                <th style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3B82F6" }}>Paradip</th>
                <th style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F59E0B" }}>Haldia</th>
              </tr>
            </thead>
            <tbody>
              <CompRow
                label="Maximum Draft" note="Applies at LAT under normal conditions"
                par={`${par.maxDraft}m`} hal={`${hal.maxDraft}m`}
                parStatus="warn" halStatus="warn"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><path d="M6 16h12M6 10h8"/></svg>`}
              />
              <CompRow
                label="Maximum LOA" note="Length overall"
                par={`${par.maxLOA}m`} hal={`${hal.maxLOA}m`}
                parStatus="ok" halStatus="warn"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>`}
              />
              <CompRow
                label="Maximum Beam" note="Extreme breadth"
                par={`${par.maxBeam}m`} hal={`${hal.maxBeam}m`}
                parStatus="ok" halStatus="ok"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`}
              />
              <CompRow
                label="Channel Depth" note="Shallowest section at MHHW"
                par={`${par.channelDepth}m`} hal={`${hal.channelDepth}m`}
                parStatus="warn" halStatus="warn"
              />
              <CompRow
                label="Tidal Restriction" note="Entry/exit timing"
                par={par.tidalRestriction} hal={hal.tidalRestriction}
                parStatus="warn" halStatus="block"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c1.5-4 5-6 10-6s8.5 2 10 6c-1.5 4-5 6-10 6s-8.5-2-10-6z"/></svg>`}
              />
              <CompRow
                label="Berthing Restriction"
                par={par.berthingRestriction} hal={hal.berthingRestriction}
                parStatus="warn" halStatus="block"
              />
              <CompRow
                label="Berth Availability"
                par={`${par.availBerths} / ${par.berths} berths`} hal={`${hal.availBerths} / ${hal.berths} berths`}
                parStatus="ok" halStatus="block"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`}
              />
              <CompRow
                label="Congestion Index"
                par={`${par.congestionPct}% — ${par.congestion}`} hal={`${hal.congestionPct}% — ${hal.congestion}`}
                parStatus="warn" halStatus="block"
              />
              <CompRow
                label="Avg Vessel Wait Time"
                par={`${par.waitingHrs} hrs`} hal={`${hal.waitingHrs} hrs`}
                parStatus="warn" halStatus="block"
                icon={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`}
              />
              <CompRow
                label="Operational Status"
                par={par.status} hal={hal.status}
                parStatus="ok" halStatus="block"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2-col: Operational Warnings + Vessel Compatibility */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Operational Warnings */}
        <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8 }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #25303B", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>Operational Warnings</span>
            <span className="badge badge-critical">{sevCounts.HIGH}</span>
            <span className="badge badge-warning">{sevCounts.MEDIUM}</span>
            <span className="badge badge-success">{sevCounts.LOW}</span>
          </div>
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 7, maxHeight: 380, overflowY: "auto" }}>
            {activeWarnings.length === 0
              ? <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", padding: 20 }}>No warnings match current filters.</div>
              : activeWarnings.map((w, i) => (
                <div key={i} className={`risk-alert ${w.sev === "HIGH" ? "critical" : w.sev === "MEDIUM" ? "warning" : "success"}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span className={`badge ${sevClass(w.sev)}`} style={{ fontSize: 10 }}>{w.sev}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#F8FAFC" }}>{w.port} Port</span>
                    <span style={{ fontSize: 10, color: "#64748B", marginLeft: "auto" }}>{w.ts}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{w.text}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Vessel Compatibility */}
        <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8 }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #25303B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>Vessel Class Compatibility</span>
            <span style={{ fontSize: 11, color: "#64748B" }}>Draft · LOA · Beam</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(11,15,20,0.5)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" }}>Class</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" }}>Capacity</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3B82F6" }} colSpan={2}>Paradip</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F59E0B" }} colSpan={2}>Haldia</th>
                </tr>
                <tr style={{ background: "rgba(11,15,20,0.3)" }}>
                  <th colSpan={2} />
                  <th style={{ padding: "5px 8px", fontSize: 10, color: "#64748B", fontWeight: 500, textAlign: "center" }}>Status</th>
                  <th style={{ padding: "5px 8px", fontSize: 10, color: "#64748B", fontWeight: 500, textAlign: "center" }}>Limiting</th>
                  <th style={{ padding: "5px 8px", fontSize: 10, color: "#64748B", fontWeight: 500, textAlign: "center" }}>Status</th>
                  <th style={{ padding: "5px 8px", fontSize: 10, color: "#64748B", fontWeight: 500, textAlign: "center" }}>Limiting</th>
                </tr>
              </thead>
              <tbody>
                {filteredVessels.map((v, i) => {
                  const pc = vesselCompat(v, par);
                  const hc = vesselCompat(v, hal);
                  const pLimit = !pc.draft ? `Draft ${v.draft}m > ${par.maxDraft}m` : !pc.loa ? `LOA ${v.loa}m > ${par.maxLOA}m` : !pc.beam ? `Beam ${v.beam}m > ${par.maxBeam}m` : "—";
                  const hLimit = !hc.draft ? `Draft ${v.draft}m > ${hal.maxDraft}m` : !hc.loa ? `LOA ${v.loa}m > ${hal.maxLOA}m` : !hc.beam ? `Beam ${v.beam}m > ${hal.maxBeam}m` : "—";
                  return (
                    <tr key={i}>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)" }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: "#F8FAFC" }}>{v.name}</div>
                        <div style={{ fontSize: 10, color: "#64748B", fontFamily: "JetBrains Mono, monospace" }}>D:{v.draft}m L:{v.loa}m B:{v.beam}m</div>
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)", fontSize: 11, color: "#64748B" }}>{v.capacity}</td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)", textAlign: "center" }}>
                        {pc.all
                          ? <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 14 }}>✓</span>
                          : <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 14 }}>✕</span>}
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)" }}>
                        <span style={{ fontSize: 10, color: pc.all ? "#22C55E" : "#EF4444", fontFamily: "JetBrains Mono, monospace" }}>{pLimit}</span>
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)", textAlign: "center" }}>
                        {hc.all
                          ? <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 14 }}>✓</span>
                          : <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 14 }}>✕</span>}
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(37,48,59,0.4)" }}>
                        <span style={{ fontSize: 10, color: hc.all ? "#22C55E" : "#EF4444", fontFamily: "JetBrains Mono, monospace" }}>{hLimit}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "8px 14px", borderTop: "1px solid #25303B", fontSize: 10, color: "#64748B" }}>
            Compatibility based on physical limits only. Tidal and operational restrictions may further constrain entry.
          </div>
        </div>
      </div>
    </div>
  );
}
