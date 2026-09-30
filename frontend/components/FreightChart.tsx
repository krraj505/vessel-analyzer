import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend } from "recharts";

const generateData = () => {
  const historical = [
    { date: "Aug 4", rate: 38.2, type: "historical" },
    { date: "Aug 7", rate: 37.8, type: "historical" },
    { date: "Aug 11", rate: 39.1, type: "historical" },
    { date: "Aug 14", rate: 38.5, type: "historical" },
    { date: "Aug 18", rate: 40.2, type: "historical" },
    { date: "Aug 21", rate: 41.5, type: "historical" },
    { date: "Aug 25", rate: 40.8, type: "historical" },
    { date: "Aug 28", rate: 42.1, type: "historical" },
    { date: "Sep 1", rate: 42.8, type: "current" },
  ];
  const forecast = [
    { date: "Sep 1", forecast: 42.8, upper: 43.5, lower: 42.1 },
    { date: "Sep 4", forecast: 43.3, upper: 44.6, lower: 42.0 },
    { date: "Sep 7", forecast: 43.8, upper: 45.5, lower: 42.1 },
    { date: "Sep 10", forecast: 44.2, upper: 46.1, lower: 42.3 },
    { date: "Sep 14", forecast: 44.9, upper: 47.2, lower: 42.6 },
    { date: "Sep 18", forecast: 45.1, upper: 47.8, lower: 42.4 },
    { date: "Sep 22", forecast: 44.8, upper: 47.5, lower: 42.1 },
    { date: "Sep 25", forecast: 45.2, upper: 48.0, lower: 42.4 },
    { date: "Sep 29", forecast: 45.6, upper: 48.5, lower: 42.7 },
    { date: "Oct 1", forecast: 45.2, upper: 48.2, lower: 42.2 },
  ];

  const allDates = [...historical, ...forecast];
  const merged: Record<string, any> = {};
  historical.forEach(d => { merged[d.date] = { date: d.date, actual: d.rate }; });
  forecast.forEach(d => { merged[d.date] = { ...merged[d.date], date: d.date, forecast: d.forecast, upper: d.upper, lower: d.lower }; });
  return Object.values(merged);
};

const data = generateData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div style={{ fontWeight: 600, color: "#F8FAFC", marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          p.value != null && (
            <div key={p.dataKey} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
              <div style={{ width: 8, height: 2, background: p.color, borderRadius: 1 }} />
              <span style={{ color: "#64748B", fontSize: 11 }}>{p.name}</span>
              <span className="mono" style={{ color: "#F8FAFC", fontWeight: 600, marginLeft: "auto" }}>${p.value.toFixed(2)}/MT</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

export default function FreightChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#1C2733" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} domain={[36, 50]} width={42} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x="Sep 1" stroke="#3B82F6" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: "TODAY", fill: "#3B82F6", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }} />
        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceGrad)" name="Upper bound" />
        <Area type="monotone" dataKey="lower" stroke="none" fill="#0B0F14" name="Lower bound" />
        <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} name="Historical rate" connectNulls={false} />
        <Line type="monotone" dataKey="forecast" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Forecast" connectNulls={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
