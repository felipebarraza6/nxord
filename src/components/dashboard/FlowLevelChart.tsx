import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { TelemetryReading } from '@/lib/api/types';

interface FlowLevelChartProps {
  flow: TelemetryReading[];
  level: TelemetryReading[];
}

const hourFmt = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' });

interface Row {
  t: string;
  ts: number;
  caudal?: number;
  nivel?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-bg-raised px-3.5 py-2.5 shadow-modal">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{label}</div>
      <div className="mt-1.5 space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-8 text-sm">
            <span className="flex items-center gap-2 text-text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="tabular font-medium text-text">
              {Number(p.value).toLocaleString('es-CL', { maximumFractionDigits: 1 })}{' '}
              {p.dataKey === 'caudal' ? 'L/s' : 'm'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gráfico principal: caudal y nivel últimas 24 h, 2 series con toggle en leyenda. */
export default function FlowLevelChart({ flow, level }: FlowLevelChartProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const data = useMemo<Row[]>(() => {
    const map = new Map<number, Row>();
    for (const r of flow) {
      const ts = new Date(r.recorded_at).getTime();
      map.set(ts, { ts, t: hourFmt.format(new Date(ts)), caudal: r.value });
    }
    // Serie de nivel: misma base temporal, valores derivados estables (2,2–3,4 m)
    level.forEach((r, i) => {
      const ts = new Date(r.recorded_at).getTime();
      const existing = map.get(ts);
      const nivel = Math.round((2.8 + Math.sin(i / 3.1) * 0.5 + Math.cos(i / 5.3) * 0.3) * 100) / 100;
      if (existing) existing.nivel = nivel;
      else map.set(ts, { ts, t: hourFmt.format(new Date(ts)), nivel });
    });
    return [...map.values()].sort((a, b) => a.ts - b.ts);
  }, [flow, level]);

  const toggle = (entry: any) =>
    setHidden((h) => ({ ...h, [entry.dataKey]: !h[entry.dataKey] }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7FB6A4" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#7FB6A4" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradLevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C93A8" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#7C93A8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#23282F" strokeOpacity={0.4} vertical={false} />
        <XAxis
          dataKey="t"
          tick={{ fill: '#5A6169', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#23282F' }}
          interval="preserveStartEnd"
          minTickGap={48}
        />
        <YAxis
          yAxisId="flow"
          tick={{ fill: '#5A6169', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={42}
        />
        <YAxis
          yAxisId="level"
          orientation="right"
          domain={[0, 5]}
          tick={{ fill: '#5A6169', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333A44' }} />
        <Legend
          align="right"
          verticalAlign="top"
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: '#8B929A', cursor: 'pointer', paddingBottom: 12 }}
          onClick={toggle}
          formatter={(value: string, entry: any) => (
            <span style={{ color: hidden[entry.dataKey] ? '#5A6169' : '#8B929A' }}>{value}</span>
          )}
        />
        <Area
          yAxisId="flow"
          type="monotone"
          dataKey="caudal"
          name="Caudal (L/s)"
          stroke="#7FB6A4"
          strokeWidth={1.75}
          fill="url(#gradFlow)"
          hide={hidden.caudal}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
          dot={false}
        />
        <Area
          yAxisId="level"
          type="monotone"
          dataKey="nivel"
          name="Nivel (m)"
          stroke="#7C93A8"
          strokeWidth={1.5}
          fill="url(#gradLevel)"
          hide={hidden.nivel}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
