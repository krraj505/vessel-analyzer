import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend } from "recharts";
import { apiFetch } from "../api";

type ForecastPoint = {
  date: string;
  forecast: number;
  lower: number;
  upper: number;
};

function formatChartDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
  const [data, setData] = useState<ForecastPoint[]>([]);

  useEffect(() => {
    apiFetch("/market/forecast")
      .then((res) => res.json())
      .then((payload) => {
        if (!Array.isArray(payload)) {
          setData([]);
          return;
        }
        setData(
          payload.map((row: { date?: string; forecast?: number; lower?: number; upper?: number }) => ({
            date: formatChartDate(String(row.date ?? "")),
            forecast: Number(row.forecast),
            lower: Number(row.lower),
            upper: Number(row.upper),
          })),
        );
      })
      .catch(() => {
        setData([]);
      });
  }, []);

  const values = data.flatMap((d) => [d.lower, d.forecast, d.upper]).filter((n) => Number.isFinite(n));
  const min = values.length ? Math.min(...values) : 36;
  const max = values.length ? Math.max(...values) : 50;
  const pad = (max - min) * 0.12 || 1;

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
        <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} domain={[Math.floor(min - pad), Math.ceil(max + pad)]} width={42} />
        <Tooltip content={<CustomTooltip />} />
        {data[0] && (
          <ReferenceLine x={data[0].date} stroke="#3B82F6" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: "TODAY", fill: "#3B82F6", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }} />
        )}
        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceGrad)" name="Upper bound" />
        <Area type="monotone" dataKey="lower" stroke="none" fill="#0B0F14" name="Lower bound" />
        <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} name="Historical rate" connectNulls={false} />
        <Line type="monotone" dataKey="forecast" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Forecast" connectNulls={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
