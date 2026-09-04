import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TelemetryDevice, TelemetryVariable } from '@/lib/api/types';

interface LiveRow {
  key: number;
  deviceName: string;
  deviceId: number;
  variableName: string;
  unit: string;
  value: number;
  at: Date;
  validatedDga: boolean;
}

function timeAgo(at: Date) {
  const mins = Math.max(0, Math.round((Date.now() - at.getTime()) / 60000));
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.round(mins / 60)} h`;
}

interface Props {
  devices: TelemetryDevice[];
  variables: TelemetryVariable[];
  onNewReading?: (deviceId: number) => void;
}

/** Lista en vivo de últimas lecturas — auto-refresh simulado cada 15 s. */
export default function LiveReadingsList({ devices, variables, onNewReading }: Props) {
  const counter = useRef(0);
  const onNewRef = useRef(onNewReading);
  onNewRef.current = onNewReading;

  const seed = useMemo<LiveRow[]>(() => {
    const byDevice = new Map(devices.map((d) => [d.id, d]));
    return variables
      .filter((v) => v.last_value != null && byDevice.get(v.device)?.is_online)
      .sort(
        (a, b) =>
          new Date(b.last_reading_at ?? 0).getTime() - new Date(a.last_reading_at ?? 0).getTime(),
      )
      .slice(0, 8)
      .map((v) => ({
        key: counter.current++,
        deviceName: byDevice.get(v.device)?.name ?? '',
        deviceId: v.device,
        variableName: v.name.toUpperCase(),
        unit: v.unit,
        value: v.last_value!,
        at: new Date(v.last_reading_at ?? Date.now()),
        validatedDga: v.name.toLowerCase().includes('caudal') || v.name.toLowerCase().includes('total'),
      }));
  }, [devices, variables]);

  const [rows, setRows] = useState<LiveRow[]>(seed);

  // Re-sembrar cuando lleguen datos distintos (cambio de sucursal / carga inicial)
  useEffect(() => {
    setRows(seed);
  }, [seed]);

  // Tick: cada 15 s entra una lectura nueva por arriba
  useEffect(() => {
    const onlineVars = variables.filter(
      (v) => v.last_value != null && devices.find((d) => d.id === v.device)?.is_online,
    );
    if (onlineVars.length === 0) return;
    let i = 0;
    const id = setInterval(() => {
      const v = onlineVars[i++ % onlineVars.length];
      const jitter = v.last_value! * (Math.sin(Date.now() / 4000 + v.id) * 0.04);
      const row: LiveRow = {
        key: counter.current++,
        deviceName: devices.find((d) => d.id === v.device)?.name ?? '',
        deviceId: v.device,
        variableName: v.name.toUpperCase(),
        unit: v.unit,
        value: Math.round((v.last_value! + jitter) * 10) / 10,
        at: new Date(),
        validatedDga: v.name.toLowerCase().includes('caudal') || v.name.toLowerCase().includes('total'),
      };
      setRows((r) => [row, ...r].slice(0, 8));
      onNewRef.current?.(v.device);
    }, 15_000);
    return () => clearInterval(id);
  }, [devices, variables]);

  // refresco de etiquetas "hace X min"
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="divide-y divide-border">
      <AnimatePresence initial={false}>
        {rows.map((r, idx) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: idx === 0 ? 0 : Math.min(idx * 0.05, 0.3) }}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm text-text">{r.deviceName}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-faint">
                <span className="font-semibold uppercase tracking-[0.08em]">{r.variableName}</span>
                <span>·</span>
                <span>{timeAgo(r.at)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="tabular text-sm font-medium text-text">
                {r.value.toLocaleString('es-CL', { maximumFractionDigits: 1 })}{' '}
                <span className="text-text-faint">{r.unit}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border border-border bg-bg-sunken px-2 py-0.5 text-[10px] font-medium ${
                  r.validatedDga ? 'text-info' : 'text-text-muted'
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${r.validatedDga ? 'bg-info' : 'bg-text-faint'}`} />
                {r.validatedDga ? 'DGA' : 'Validado'}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
