// Nxord — App / Dispositivos (/app/dispositivos)
// Lista de dispositivos de telemetría + detalle en drawer derecho.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Droplets, Gauge, Search, Send, Waves, X } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDevices, useReadings24h, useVariables } from '@/lib/api/hooks';
import type { TelemetryDevice, TelemetryReading, TelemetryVariable } from '@/lib/api/types';
import EmptyState from '@/components/app/EmptyState';
import StatusBadge from '@/components/app/StatusBadge';
import { cn } from '@/lib/utils';

// ---------- helpers ----------

const TYPE_META: Record<string, { label: string; color: string }> = {
  pozo: { label: 'Pozo', color: 'var(--accent)' },
  estanque: { label: 'Estanque', color: 'var(--info)' },
  medidor: { label: 'Caudal', color: 'var(--chart-3)' },
  valvula: { label: 'Superficie', color: 'var(--warn)' },
  clima: { label: 'Clima', color: 'var(--info)' },
};

const VAR_COLORS = ['var(--accent)', 'var(--info)', 'var(--chart-3)', 'var(--warn)'];

function typeLabel(t: string) {
  return TYPE_META[t]?.label ?? t;
}

function varColor(variable: TelemetryVariable): string {
  const n = variable.name.toLowerCase();
  if (n.includes('caudal')) return 'var(--accent)';
  if (n.includes('nivel')) return 'var(--info)';
  if (n.includes('total')) return 'var(--chart-3)';
  if (n.includes('pres')) return 'var(--warn)';
  return VAR_COLORS[variable.id % VAR_COLORS.length];
}

function varShortCode(variable: TelemetryVariable): string {
  const n = variable.name.toLowerCase();
  if (n.includes('caudal')) return 'FLOW';
  if (n.includes('nivel')) return 'LEVEL';
  if (n.includes('total')) return 'TOTAL';
  if (n.includes('pres')) return 'PRES';
  return variable.name.slice(0, 5).toUpperCase();
}

function timeAgo(iso?: string): string {
  if (!iso) return '—';
  try {
    return `hace ${formatDistanceToNow(new Date(iso), { locale: es })}`;
  } catch {
    return '—';
  }
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${fmtTime(iso)}`;
}

// ---------- página ----------

const FILTERS = ['todos', 'pozo', 'estanque', 'medidor', 'valvula'] as const;

export default function Dispositivos() {
  const { data: devices, isDemo, isLoading } = useDevices();
  const { data: allVariables } = useVariables();
  const [typeFilter, setTypeFilter] = useState<(typeof FILTERS)[number]>('todos');
  const [onlyOffline, setOnlyOffline] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<TelemetryDevice | null>(null);

  const filtered = useMemo(
    () =>
      devices.filter((d) => {
        if (typeFilter !== 'todos' && d.device_type !== typeFilter) return false;
        if (onlyOffline && d.is_online) return false;
        if (query) {
          const q = query.toLowerCase();
          return (
            d.name.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q) ||
            (d.location ?? '').toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [devices, typeFilter, onlyOffline, query],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Dispositivos</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Telemetría de la red — pozos, estanques, medidores y clima.
          </p>
        </div>
        {isDemo && (
          <span className="rounded-full border border-border bg-bg-sunken px-3 py-1 text-xs text-text-faint">
            Modo demo
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                typeFilter === f
                  ? 'border-accent bg-accent-dim text-text'
                  : 'border-border bg-transparent text-text-muted hover:border-border-strong hover:text-text',
              )}
            >
              {f === 'todos' ? 'Todos' : typeLabel(f)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOnlyOffline((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
            onlyOffline
              ? 'border-danger bg-[#C96F5E14] text-danger'
              : 'border-border text-text-muted hover:border-border-strong hover:text-text',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', onlyOffline ? 'bg-danger' : 'bg-text-faint')} />
          Solo offline
        </button>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar dispositivo…"
            className="h-9 w-56 rounded-md border border-border bg-bg pl-9 pr-3 text-[13px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="mt-6 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-bg-raised" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Sin dispositivos en esta sucursal"
            description={
              isDemo
                ? 'Estás viendo datos de demostración. Al conectar la operación aparecerán los dispositivos reales de la red.'
                : 'No hay dispositivos que coincidan con los filtros aplicados.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-sunken">
                {['Estado', 'Nombre', 'Tipo', 'Variables', 'Última lectura', 'Última conexión', 'Envío DGA'].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((d, i) => (
                  <DeviceRow
                    key={d.id}
                    device={d}
                    index={i}
                    variables={allVariables.filter((v) => v.device === d.id)}
                    onOpen={() => setSelected(d)}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer de detalle */}
      <AnimatePresence>
        {selected && <DeviceDrawer device={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ---------- fila ----------

function DeviceRow({
  device: d,
  index,
  variables,
  onOpen,
}: {
  device: TelemetryDevice;
  index: number;
  variables: TelemetryVariable[];
  onOpen: () => void;
}) {
  const lastVar = variables.find((v) => v.last_value !== undefined);
  return (
    <motion.tr
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
      onClick={onOpen}
      className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-raised"
    >
      <td className="px-4 py-3">
        <span className="relative flex h-2 w-2">
          {d.is_online && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s]" />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', d.is_online ? 'bg-accent' : 'bg-danger')} />
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-text">{d.name}</div>
        <div className="tabular text-xs text-text-faint">{d.code}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className="rounded-full border px-2 py-0.5 text-xs"
          style={{ borderColor: 'var(--border-strong)', color: TYPE_META[d.device_type]?.color ?? 'var(--text-muted)' }}
        >
          {typeLabel(d.device_type)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {variables.map((v) => (
            <span
              key={v.id}
              className="rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide"
              style={{ borderColor: 'var(--border)', color: varColor(v), background: 'var(--bg-sunken)' }}
            >
              {varShortCode(v)}
            </span>
          ))}
        </div>
      </td>
      <td className="tabular px-4 py-3 text-sm text-text">
        {lastVar?.last_value !== undefined ? (
          <>
            {lastVar.last_value.toLocaleString('es-CL')}{' '}
            <span className="text-xs text-text-faint">{lastVar.unit}</span>
          </>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-[13px] text-text-muted">{timeAgo(d.last_seen_at)}</td>
      <td className="px-4 py-3">
        {d.is_online ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#7C93A814] px-2 py-0.5 text-xs text-info">
            <Send className="h-3 w-3" strokeWidth={1.75} /> Enviado
          </span>
        ) : (
          <span className="text-xs text-text-faint">Pendiente</span>
        )}
      </td>
    </motion.tr>
  );
}

// ---------- drawer ----------

const TABS = ['Lecturas', 'Variables', 'Configuración', 'Eventos'] as const;
type Tab = (typeof TABS)[number];
const RANGES = [{ k: '24h', h: 24 }, { k: '7d', h: 24 * 7 }, { k: '30d', h: 24 * 30 }] as const;

function DeviceDrawer({ device, onClose }: { device: TelemetryDevice; onClose: () => void }) {
  const { data: variables } = useVariables(device.id);
  const [tab, setTab] = useState<Tab>('Lecturas');
  const [varId, setVarId] = useState<number | undefined>(undefined);
  const [range, setRange] = useState<(typeof RANGES)[number]['k']>('24h');

  const activeVar = variables.find((v) => v.id === varId) ?? variables[0];
  const color = activeVar ? varColor(activeVar) : 'var(--accent)';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <motion.aside
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-border bg-bg shadow-modal"
      >
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text">{device.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={device.is_online ? 'online' : 'offline'} />
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted">
                  {typeLabel(device.device_type)}
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted">
                  cada 5 min
                </span>
              </div>
              <p className="tabular mt-3 text-xs text-text-faint">
                {device.code} · {device.location ?? '—'} · lat −39.6432 · lon −72.3314
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-text-faint transition-colors hover:bg-bg-raised hover:text-text"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'relative pb-2 text-[13px] font-medium transition-colors',
                  tab === t ? 'text-text' : 'text-text-faint hover:text-text-muted',
                )}
              >
                {t}
                {tab === t && (
                  <motion.span layoutId="drawer-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'Lecturas' && (
            <LecturasTab
              variables={variables}
              activeVar={activeVar}
              color={color}
              range={range}
              onVar={(id) => setVarId(id)}
              onRange={setRange}
            />
          )}
          {tab === 'Variables' && <VariablesTab variables={variables} />}
          {tab === 'Configuración' && <ConfigTab device={device} />}
          {tab === 'Eventos' && <EventosTab device={device} />}
        </div>
      </motion.aside>
    </>
  );
}

// ---------- tab lecturas ----------

function LecturasTab({
  variables,
  activeVar,
  color,
  range,
  onVar,
  onRange,
}: {
  variables: TelemetryVariable[];
  activeVar?: TelemetryVariable;
  color: string;
  range: '24h' | '7d' | '30d';
  onVar: (id: number) => void;
  onRange: (r: '24h' | '7d' | '30d') => void;
}) {
  const { data: readings } = useReadings24h(activeVar?.id);

  // Replicar la serie de 24h para simular rangos mayores
  const series = useMemo(() => {
    const hours = range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30;
    if (hours <= readings.length) return readings.slice(-hours);
    const out: TelemetryReading[] = [];
    for (let i = hours; i > 0; i--) {
      const src = readings[(i - 1) % Math.max(readings.length, 1)];
      if (src) {
        out.push({
          ...src,
          id: src.id * 1000 + i,
          recorded_at: new Date(Date.now() - (i - 1) * 3600_000).toISOString(),
          value: Math.round((src.value + Math.sin(i * 0.9) * 0.3) * 10) / 10,
        });
      }
    }
    return out;
  }, [readings, range]);

  const stats = useMemo(() => {
    if (!series.length) return null;
    const vals = series.map((r) => r.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      avg: sum / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      n: vals.length,
      errors: Math.floor(vals.length * 0.02),
    };
  }, [series]);

  if (!activeVar) {
    return <p className="text-sm text-text-muted">Este dispositivo no tiene variables configuradas.</p>;
  }

  const fmt = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 1 });

  return (
    <div>
      {/* Selector variable + rango */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <button
              key={v.id}
              onClick={() => onVar(v.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                v.id === activeVar.id
                  ? 'border-accent bg-accent-dim text-text'
                  : 'border-border text-text-muted hover:border-border-strong',
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.k}
              onClick={() => onRange(r.k)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                range === r.k ? 'bg-accent-dim text-text' : 'text-text-faint hover:text-text-muted',
              )}
            >
              {r.k}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 h-56 rounded-lg border border-border bg-bg-raised p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="varFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
            <XAxis
              dataKey="recorded_at"
              tickFormatter={(iso: string) => (range === '24h' ? fmtTime(iso) : fmtDateTime(iso))}
              tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--text-faint)' }}
              labelFormatter={(iso) => fmtDateTime(String(iso))}
              formatter={(value: number | string) => [
                `${value} ${activeVar.unit}`,
                `${activeVar.name} (procesado)`,
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill="url(#varFill)"
              animationDuration={400}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {[
            { l: 'Promedio', v: fmt(stats.avg) },
            { l: 'Mín', v: fmt(stats.min) },
            { l: 'Máx', v: fmt(stats.max) },
            { l: 'N lecturas', v: String(stats.n) },
            { l: 'Errores', v: String(stats.errors) },
          ].map((s) => (
            <div key={s.l} className="rounded-md border border-border bg-bg-sunken px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-faint">{s.l}</p>
              <p className="tabular mt-1 text-xl font-medium text-text">{s.v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de lecturas */}
      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg-sunken">
              {['Fecha', 'Valor', 'Error', 'Validada', 'DGA'].map((h) => (
                <th key={h} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...series]
              .slice(-10)
              .reverse()
              .map((r, i) => {
                const isError = i === 3; // una fila de error ilustrativa
                return (
                  <tr
                    key={r.id}
                    className={cn('border-b border-border last:border-0', isError && 'bg-[#C96F5E14]')}
                  >
                    <td className="tabular px-3 py-2 text-[13px] text-text-muted">{fmtDateTime(r.recorded_at)}</td>
                    <td className="tabular px-3 py-2 text-[13px] text-text">
                      {r.value.toLocaleString('es-CL')} <span className="text-xs text-text-faint">{activeVar.unit}</span>
                    </td>
                    <td className="px-3 py-2">
                      {isError ? <span className="h-1.5 w-1.5 rounded-full bg-danger inline-block" /> : <span className="text-text-faint">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {!isError && <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2} />}
                    </td>
                    <td className="px-3 py-2 text-[13px] text-info">
                      {!isError && <Send className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- tab variables ----------

function VariablesTab({ variables }: { variables: TelemetryVariable[] }) {
  if (!variables.length) return <p className="text-sm text-text-muted">Sin variables configuradas.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {variables.map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-lg border border-border bg-bg-raised p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text">{v.name}</p>
            <span className="h-3 w-3 rounded-sm" style={{ background: varColor(v) }} title="Color de chart" />
          </div>
          <dl className="mt-3 space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-faint">Unidad</dt>
              <dd className="tabular text-text-muted">{v.unit}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-faint">Último valor</dt>
              <dd className="tabular text-text">{v.last_value?.toLocaleString('es-CL') ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-faint">Es contador</dt>
              <dd>
                <span
                  className={cn(
                    'relative inline-flex h-4 w-7 items-center rounded-full',
                    v.name.toLowerCase().includes('total') ? 'bg-accent' : 'bg-border-strong',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3 w-3 transform rounded-full bg-bg transition-transform',
                      v.name.toLowerCase().includes('total') ? 'translate-x-3.5' : 'translate-x-0.5',
                    )}
                  />
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-faint">Umbral</dt>
              <dd className="tabular text-text-muted">
                {v.name.toLowerCase().includes('caudal') ? `10 ${v.unit}` : '—'}
              </dd>
            </div>
          </dl>
        </motion.div>
      ))}
    </div>
  );
}

// ---------- tab configuración ----------

function ConfigTab({ device }: { device: TelemetryDevice }) {
  const rows: [string, string][] = [
    ['Código de dispositivo', device.code],
    ['Frecuencia de lectura', 'cada 5 min'],
    ['Umbral mínimo de caudal', '10 l/s'],
    ['Umbral máximo de nivel', '90 %'],
    ['Código DGA', `DGA-${device.code}`],
    ['Caudal concedido', '18 l/s'],
    ['Ubicación', device.location ?? '—'],
  ];
  return (
    <div>
      <div className="rounded-lg border border-border bg-bg-raised p-5">
        <dl className="divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3">
              <dt className="text-[13px] text-text-faint">{k}</dt>
              <dd className="tabular text-[13px] text-text opacity-70">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-text-faint">
        <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} />
        Solo lectura — la edición de configuración está disponible conectado a la operación.
      </p>
    </div>
  );
}

// ---------- tab eventos ----------

function EventosTab({ device }: { device: TelemetryDevice }) {
  const events = useMemo(() => {
    const now = Date.now();
    const base = [
      { icon: Send, color: 'var(--info)', label: 'Envío DGA confirmado', at: now - 45 * 60_000 },
      { icon: Waves, color: 'var(--accent)', label: 'Lectura validada', at: now - 2 * 3600_000 },
      { icon: Droplets, color: 'var(--warn)', label: 'Lectura con error de sensor', at: now - 7 * 3600_000 },
      { icon: Gauge, color: 'var(--accent)', label: 'Conexión restablecida', at: now - 26 * 3600_000 },
    ];
    if (!device.is_online) {
      base.unshift({ icon: X, color: 'var(--danger)', label: 'Pérdida de conexión', at: now - 6 * 3600_000 });
    }
    return base;
  }, [device.is_online]);

  return (
    <ol className="relative ml-2 space-y-5 border-l border-border pl-6">
      {events.map((e, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="relative"
        >
          <span
            className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-bg-sunken"
            style={{ color: e.color }}
          >
            <e.icon className="h-2.5 w-2.5" strokeWidth={2} />
          </span>
          <p className="text-[13px] font-medium text-text">{e.label}</p>
          <p className="tabular mt-0.5 text-xs text-text-faint">{fmtDateTime(new Date(e.at).toISOString())}</p>
        </motion.li>
      ))}
    </ol>
  );
}
