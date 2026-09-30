import { useState } from "react";
import type { Page } from "../App";

interface Props {
  navigate: (p: Page) => void;
}

const vessels = [
  { name: "MV Ocean Star", imo: "9234567", class: "Panamax", capacity: 62000, draft: 9.2, loa: 180, beam: 28, eta: "12 Sep", freight: 41, compat: true, risk: "LOW", score: 92, reason: "Optimal capacity, fully port-compatible, best freight rate." },
  { name: "MV Indra Bharat", imo: "9345678", class: "Supramax", capacity: 55000, draft: 8.8, loa: 165, beam: 27, eta: "13 Sep", freight: 43, compat: true, risk: "LOW", score: 87, reason: "Lower capacity but strong compatibility and low risk profile." },
  { name: "MV Eastern Dawn", imo: "9456789", class: "Capesize", capacity: 88000, draft: 11.8, loa: 230, beam: 38, eta: "12 Sep", freight: 38, compat: false, risk: "HIGH", score: 34, reason: "Draft (11.8m) exceeds Paradip max (10.0m). LOA exceeds limit." },
  { name: "MV Triveni Pride", imo: "9567890", class: "Handymax", capacity: 47000, draft: 8.5, loa: 158, beam: 25, eta: "14 Sep", freight: 45, compat: true, risk: "LOW", score: 78, reason: "Compatible but lower capacity vs cargo requirement." },
  { name: "MV Bengal Carrier", imo: "9678901", class: "Panamax", capacity: 64000, draft: 9.8, loa: 185, beam: 30, eta: "15 Sep", freight: 42, compat: true, risk: "MEDIUM", score: 71, reason: "Near max draft limit. Arrival delay vs required date." },
  { name: "MV Pacific Trader", imo: "9789012", class: "Capesize", capacity: 95000, draft: 13.1, loa: 260, beam: 42, eta: "12 Sep", freight: 36, compat: false, risk: "HIGH", score: 12, reason: "Exceeds all Paradip port limits. Not recommended." },
  { name: "MV Sagar Samrat", imo: "9890123", class: "Supramax", capacity: 58000, draft: 9.0, loa: 172, beam: 28, eta: "13 Sep", freight: 44, compat: true, risk: "LOW", score: 84, reason: "Good match. Slightly higher freight rate offsets delay risk." },
];

const portCompatDetails = {
  paradip: [
    { param: "Draft", limit: "10.0m", compatible: true, vessel: "9.2m" },
    { param: "LOA", limit: "200m", compatible: true, vessel: "180m" },
    { param: "Beam", limit: "32m", compatible: true, vessel: "28m" },
    { param: "Capacity", limit: "65,000 MT", compatible: true, vessel: "62,000 MT" },
  ],
  incompatDetails: [
    { param: "Draft", limit: "10.0m", compatible: false, vessel: "11.8m" },
    { param: "LOA", limit: "200m", compatible: false, vessel: "230m" },
    { param: "Beam", limit: "32m", compatible: false, vessel: "38m" },
    { param: "Capacity", limit: "65,000 MT", compatible: true, vessel: "88,000 MT" },
  ],
};

const scoreBreakdown = [
  { label: "Capacity Fit", value: 100 },
  { label: "Port Compatibility", value: 95 },
  { label: "Freight Cost", value: 91 },
  { label: "Operational Risk", value: 94 },
  { label: "ETA Alignment", value: 88 },
];

function CompatIcon({ ok }: { ok: boolean }) {
  if (ok) return <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 13 }}>✓</span>;
  return <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 13 }}>✕</span>;
}

function DrawerPanel({ vessel, onClose, navigate }: { vessel: typeof vessels[0]; onClose: () => void; navigate: (p: Page) => void }) {
  const isCompat = vessel.compat;
  const details = isCompat ? portCompatDetails.paradip : portCompatDetails.incompatDetails;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #25303B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>{vessel.name}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>IMO: <span className="mono" style={{ color: "#94A3B8" }}>{vessel.imo}</span></div>
          </div>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {/* Vessel specs */}
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Vessel Specifications</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[
              ["Class", vessel.class],
              ["Capacity", `${vessel.capacity.toLocaleString()} MT`],
              ["Draft", `${vessel.draft}m`],
              ["LOA", `${vessel.loa}m`],
              ["Beam", `${vessel.beam}m`],
              ["Speed", "14.2 kts"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(21,30,40,0.8)", borderRadius: 6, padding: "8px 12px", border: "1px solid #1C2733" }}>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3 }}>{k}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Port compatibility */}
          <div style={{ height: 1, background: "#1C2733", marginBottom: 14 }} />
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Port Compatibility — Paradip</div>
          {!isCompat && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 4 }}>NOT COMPATIBLE</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Vessel exceeds maximum allowable draft for Paradip under current conditions. LOA also exceeds port limit.</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {details.map((d) => (
              <div key={d.param} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "rgba(21,30,40,0.6)", borderRadius: 5, border: `1px solid ${d.compatible ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.2)"}` }}>
                <CompatIcon ok={d.compatible} />
                <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>{d.param}</span>
                <span className="mono" style={{ fontSize: 12, color: d.compatible ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{d.vessel}</span>
                <span style={{ fontSize: 11, color: "#64748B" }}>/ {d.limit}</span>
              </div>
            ))}
          </div>

          {/* Match score */}
          {isCompat && (
            <>
              <div style={{ height: 1, background: "#1C2733", marginBottom: 14 }} />
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Match Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(#22C55E ${vessel.score * 3.6}deg, #1C2733 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#111821", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#22C55E" }}>{vessel.score}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>{vessel.score >= 90 ? "Excellent Match" : vessel.score >= 75 ? "Good Match" : "Moderate Match"}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{vessel.reason}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {scoreBreakdown.map(s => (
                  <div key={s.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#F8FAFC" }}>{s.value}%</span>
                    </div>
                    <div className="match-score-bar">
                      <div className="match-score-fill" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 6, padding: "10px 12px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#22C55E", marginBottom: 4 }}>Recommendation</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{vessel.reason}</div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate("routes")}>Compare Routes</button>
            {isCompat && <button className="btn-primary" style={{ flex: 1 }}>Select Vessel</button>}
          </div>
        </div>
      </div>
    </>
  );
}

export default function VesselDirectory({ navigate }: Props) {
  const [selectedVessel, setSelectedVessel] = useState<typeof vessels[0] | null>(null);
  const [search, setSearch] = useState("");
  const [filterPort, setFilterPort] = useState("Paradip");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [searched, setSearched] = useState(false);
  const [sortCol, setSortCol] = useState("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredVessels = vessels
    .filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.imo.includes(search) || v.class.toLowerCase().includes(search.toLowerCase()))
    .filter(v => filterClass === "All Classes" || v.class === filterClass)
    .sort((a, b) => {
      const key = sortCol as keyof typeof a;
      const av = a[key] as number;
      const bv = b[key] as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.3, fontSize: 9 }}>
      {sortCol === col ? (sortDir === "desc" ? "▼" : "▲") : "↕"}
    </span>
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>Vessel Matching</h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Identify vessels compatible with cargo requirements and destination-port constraints</p>
      </div>

      {/* Filter panel */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Cargo & Route Parameters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr) auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Destination Port</label>
            <select className="select-field" value={filterPort} onChange={e => setFilterPort(e.target.value)}>
              <option>Paradip</option><option>Haldia</option><option>Vizag</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Cargo Volume</label>
            <input className="input-field" defaultValue="45,000 MT" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Cargo Type</label>
            <select className="select-field"><option>Coal</option><option>Iron Ore</option><option>Grain</option></select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Required Arrival</label>
            <input className="input-field" defaultValue="12 Sep 2026" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 5 }}>Vessel Class</label>
            <select className="select-field" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option>All Classes</option><option>Handymax</option><option>Supramax</option><option>Panamax</option><option>Capesize</option>
            </select>
          </div>
          <button className="btn-primary" style={{ height: 36, whiteSpace: "nowrap" }} onClick={() => setSearched(true)}>
            FIND MATCHING VESSELS
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ background: "#111821", border: "1px solid #25303B", borderRadius: 8 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #25303B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>Vessel Results</span>
            <span className="badge badge-blue">{filteredVessels.length} found · {filteredVessels.filter(v => v.compat).length} compatible</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vessels..." className="input-field" style={{ paddingLeft: 28, height: 32, fontSize: 12, width: 180 }} />
            </div>
            <button className="btn-secondary" style={{ fontSize: 12, height: 32 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Vessel <SortIcon col="name" /></th>
                <th onClick={() => handleSort("class")}>Class <SortIcon col="class" /></th>
                <th onClick={() => handleSort("capacity")}>Capacity <SortIcon col="capacity" /></th>
                <th onClick={() => handleSort("draft")}>Draft <SortIcon col="draft" /></th>
                <th>LOA</th>
                <th>Beam</th>
                <th onClick={() => handleSort("eta")}>ETA <SortIcon col="eta" /></th>
                <th onClick={() => handleSort("freight")}>Freight Rate <SortIcon col="freight" /></th>
                <th>Port Compat.</th>
                <th>Risk</th>
                <th onClick={() => handleSort("score")}>Match Score <SortIcon col="score" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredVessels.map((v, i) => (
                <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelectedVessel(v)}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: 13 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B", fontFamily: "JetBrains Mono, monospace" }}>IMO {v.imo}</div>
                  </td>
                  <td><span className="badge badge-muted">{v.class}</span></td>
                  <td><span className="mono" style={{ color: "#F8FAFC" }}>{v.capacity.toLocaleString()} MT</span></td>
                  <td>
                    <span className="mono" style={{ color: v.draft > 10 ? "#EF4444" : "#22C55E" }}>{v.draft}m</span>
                    {v.draft > 10 && <span style={{ fontSize: 10, color: "#EF4444", marginLeft: 4 }}>OVER LIMIT</span>}
                  </td>
                  <td className="mono">{v.loa}m</td>
                  <td className="mono">{v.beam}m</td>
                  <td><span className="mono" style={{ color: "#F8FAFC" }}>{v.eta}</span></td>
                  <td><span className="mono" style={{ color: "#F8FAFC", fontWeight: 600 }}>${v.freight}/MT</span></td>
                  <td>
                    {v.compat
                      ? <span style={{ color: "#22C55E", fontWeight: 600, fontSize: 13 }}>✓ Compatible</span>
                      : <span style={{ color: "#EF4444", fontWeight: 600, fontSize: 13 }}>✕ Incompatible</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${v.risk === "LOW" ? "success" : v.risk === "MEDIUM" ? "warning" : "critical"}`}>{v.risk}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: v.score >= 80 ? "#22C55E" : v.score >= 60 ? "#F59E0B" : "#EF4444" }}>{v.score}%</span>
                      <div style={{ width: 48, height: 4, background: "#1C2733", borderRadius: 2 }}>
                        <div style={{ width: `${v.score}%`, height: "100%", background: v.score >= 80 ? "#22C55E" : v.score >= 60 ? "#F59E0B" : "#EF4444", borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "12px 18px", borderTop: "1px solid #25303B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>Showing {filteredVessels.length} of {vessels.length} vessels · Page 1 of 1</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1].map(n => (
              <button key={n} style={{ width: 28, height: 28, borderRadius: 4, background: n === 1 ? "rgba(59,130,246,0.2)" : "transparent", border: `1px solid ${n === 1 ? "#3B82F6" : "#25303B"}`, color: n === 1 ? "#3B82F6" : "#64748B", fontSize: 12, cursor: "pointer" }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {selectedVessel && <DrawerPanel vessel={selectedVessel} onClose={() => setSelectedVessel(null)} navigate={navigate} />}
    </div>
  );
}
