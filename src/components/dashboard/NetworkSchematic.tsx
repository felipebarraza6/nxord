import { useMemo, useState } from 'react';
import type { TelemetryDevice, TelemetryVariable } from '@/lib/api/types';

interface NetworkSchematicProps {
  devices: TelemetryDevice[];
  variables: TelemetryVariable[];
  /** id de dispositivo que acaba de reportar (pulse) */
  pulsingIds?: number[];
}

interface NodeDef {
  id: number;
  x: number; // 0-100 %
  y: number;
  label: string;
}

// Posición esquemática fija según tipo: captación → acumulación → distribución
const typeLane: Record<string, { x: number; ys: number[] }> = {
  pozo: { x: 16, ys: [30, 70] },
  estanque: { x: 50, ys: [30, 70] },
  medidor: { x: 82, ys: [20, 50, 80] },
  valvula: { x: 50, ys: [70] },
};

const typeLabel: Record<string, string> = {
  pozo: 'Pozo',
  estanque: 'Estanque',
  medidor: 'Medidor',
  valvula: 'Válvula',
};

function timeAgoShort(iso?: string) {
  if (!iso) return '—';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.round(mins / 60)} h`;
}

/** Mapa esquemático minimalista de la red APR (no georreferenciado). */
export default function NetworkSchematic({ devices, variables, pulsingIds = [] }: NetworkSchematicProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const nodes = useMemo<NodeDef[]>(() => {
    const used: Record<string, number> = {};
    return devices.map((d) => {
      const lane = typeLane[d.device_type] ?? typeLane.medidor;
      const idx = used[d.device_type] ?? 0;
      used[d.device_type] = idx + 1;
      const y = lane.ys[idx % lane.ys.length];
      return { id: d.id, x: lane.x, y, label: d.name };
    });
  }, [devices]);

  const links = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const pozos = nodes.filter((n) => devices.find((d) => d.id === n.id)?.device_type === 'pozo');
    const estanques = nodes.filter((n) => devices.find((d) => d.id === n.id)?.device_type === 'estanque');
    const medidores = nodes.filter((n) => devices.find((d) => d.id === n.id)?.device_type === 'medidor');
    const valvulas = nodes.filter((n) => devices.find((d) => d.id === n.id)?.device_type === 'valvula');
    const out: [NodeDef, NodeDef][] = [];
    // pozo → estanque más cercano, estanque → medidores, valvulas → estanque principal
    pozos.forEach((p) => {
      const t = estanques[0] ?? medidores[0];
      if (t) out.push([p, t]);
    });
    estanques.forEach((e) => medidores.forEach((m) => out.push([e, m])));
    valvulas.forEach((v) => {
      const t = estanques[1] ?? estanques[0] ?? medidores[0];
      if (t) out.push([t, v]);
    });
    return out.filter(([a, b]) => byId.has(a.id) && byId.has(b.id));
  }, [nodes, devices]);

  const hoverDevice = hovered != null ? devices.find((d) => d.id === hovered) : undefined;
  const hoverVars = hovered != null ? variables.filter((v) => v.device === hovered) : [];

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-lg bg-bg-sunken">
      {/* grilla tenue */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="nxord-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nxord-grid)" />
      </svg>

      {/* enlaces */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={`${a.x}%`}
            y1={`${a.y}%`}
            x2={`${b.x}%`}
            y2={`${b.y}%`}
            stroke="var(--border-strong)"
            strokeWidth="1"
            strokeDasharray="4 5"
            opacity="0.7"
          />
        ))}
      </svg>

      {/* nodos */}
      {nodes.map((n) => {
        const d = devices.find((x) => x.id === n.id)!;
        const isPulsing = pulsingIds.includes(d.id);
        return (
          <button
            key={n.id}
            className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(n.id)}
            onBlur={() => setHovered(null)}
            aria-label={d.name}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              {(d.is_online || isPulsing) && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 [animation-duration:2s] ${
                    d.is_online ? 'bg-accent' : 'bg-danger'
                  }`}
                />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full border-2 ${
                  d.is_online ? 'border-accent bg-accent/30' : 'border-danger bg-danger/30'
                } transition-transform group-hover:scale-125`}
              />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[11px] text-text-faint transition-colors group-hover:text-text-muted">
              {d.code}
            </span>
          </button>
        );
      })}

      {/* tooltip */}
      {hoverDevice && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-bg-raised px-3.5 py-2.5 shadow-modal">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${hoverDevice.is_online ? 'bg-accent' : 'bg-danger'}`} />
            <span className="text-sm font-medium text-text">{hoverDevice.name}</span>
          </div>
          <div className="mt-1 text-xs text-text-faint">
            {typeLabel[hoverDevice.device_type] ?? hoverDevice.device_type}
            {hoverDevice.location ? ` · ${hoverDevice.location}` : ''}
          </div>
          {hoverVars.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-border pt-2">
              {hoverVars.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-6 text-xs">
                  <span className="text-text-muted">{v.name}</span>
                  <span className="tabular text-text">
                    {v.last_value?.toLocaleString('es-CL')} {v.unit}
                    <span className="ml-2 text-text-faint">{timeAgoShort(v.last_reading_at)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          {hoverVars.length === 0 && (
            <div className="mt-2 border-t border-border pt-2 text-xs text-text-faint">
              Última conexión {timeAgoShort(hoverDevice.last_seen_at)}
            </div>
          )}
        </div>
      )}

      {/* leyenda */}
      <div className="absolute right-3 top-3 flex items-center gap-4 text-[11px] text-text-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-2 border-accent bg-accent/30" /> Online
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-2 border-danger bg-danger/30" /> Offline
        </span>
      </div>
    </div>
  );
}
