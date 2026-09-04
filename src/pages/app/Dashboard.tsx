import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  TriangleAlert,
  ArrowRight,
  Droplets,
  Users,
  ReceiptText,
  Banknote,
} from 'lucide-react';
import {
  useDevices,
  useVariables,
  useReadings24h,
  useAlertTriggers,
  useClients,
  useTaxDocuments,
  usePayments,
} from '@/lib/api/hooks';
import KpiCard from '@/components/dashboard/KpiCard';
import NetworkSchematic from '@/components/dashboard/NetworkSchematic';
import LiveReadingsList from '@/components/dashboard/LiveReadingsList';
import FlowLevelChart from '@/components/dashboard/FlowLevelChart';
import { cn } from '@/lib/utils';

const ranges = ['24h', '7d', '30d'] as const;
type Range = (typeof ranges)[number];

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.round(mins / 60)} h`;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg border border-border bg-gradient-to-r from-bg-raised via-border/40 to-bg-raised bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export default function Dashboard() {
  const devices = useDevices();
  const variables = useVariables();
  const flowReadings = useReadings24h(206);
  const levelReadings = useReadings24h(204);
  const alerts = useAlertTriggers();
  const clients = useClients();
  const documents = useTaxDocuments();
  const payments = usePayments();

  const [range, setRange] = useState<Range>('24h');
  const [spinning, setSpinning] = useState(false);
  const [pulsingIds, setPulsingIds] = useState<number[]>([]);

  const loading = devices.isLoading;

  const online = devices.data.filter((d) => d.is_online).length;
  const total = devices.data.length;

  const flowValues = flowReadings.data.map((r) => r.value);
  const avgFlow = flowValues.length ? flowValues.reduce((a, b) => a + b, 0) / flowValues.length : 0;

  const activeAlerts = alerts.data.filter((a) => !a.acknowledged);
  const warnCount = activeAlerts.filter((a) => a.severity === 'warning').length;
  const critCount = activeAlerts.filter((a) => a.severity === 'critical').length;

  const offlineDevices = devices.data.filter((d) => !d.is_online);

  const aprSummary = useMemo(() => {
    const m3 = clients.data.reduce((acc, c) => acc + (c.last_consumption_m3 ?? 0), 0);
    const activeClients = clients.data.filter((c) => c.is_active).length;
    const charges = documents.data.filter((d) => d.doc_type !== 61 && d.status !== 'anulado').length;
    const revenue = payments.data.reduce((acc, p) => acc + p.amount, 0);
    return { m3, activeClients, charges, revenue };
  }, [clients.data, documents.data, payments.data]);

  const refresh = () => {
    setSpinning(true);
    [devices, variables, flowReadings, levelReadings, alerts, clients, documents, payments].forEach((q) =>
      q.refetch(),
    );
    setTimeout(() => setSpinning(false), 700);
  };

  const onNewReading = (deviceId: number) => {
    setPulsingIds((ids) => [...ids, deviceId]);
    setTimeout(() => setPulsingIds((ids) => ids.filter((i) => i !== deviceId)), 2200);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[132px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Skeleton className="h-[420px] lg:col-span-7" />
          <Skeleton className="h-[420px] lg:col-span-5" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Encabezado de vista */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Dashboard de telemetría</h1>
          <p className="mt-1 text-sm text-text-muted">KPIs en vivo, series de lecturas y estado de la red.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-bg-raised p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                  range === r ? 'bg-accent-dim text-text' : 'text-text-faint hover:text-text-muted',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-md border border-border bg-bg-raised px-3 py-2 text-xs font-medium text-text-muted transition-all hover:border-border-strong hover:text-text"
            aria-label="Refrescar datos"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', spinning && 'animate-spin')} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Banner modo demo */}
      {devices.isDemo && (
        <div className="flex items-center gap-2.5 rounded-md border border-warn/30 bg-warn/10 px-4 py-2.5 text-[13px] text-warn">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          API no disponible — mostrando datos demo.
        </div>
      )}

      {/* Fila KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Dispositivos online"
          value={online}
          suffix={`/ ${total}`}
          delta="+2 vs ayer"
          deltaDirection="up"
          pulse
        />
        <KpiCard
          index={1}
          label="Caudal promedio"
          value={Math.round(avgFlow * 10) / 10}
          decimals={1}
          suffix="L/s"
          sparkline={flowValues}
        />
        <KpiCard
          index={2}
          label="Alertas activas"
          value={activeAlerts.length}
          delta={`${warnCount} warning · ${critCount} crítica${critCount === 1 ? '' : 's'}`}
          deltaDirection="down"
          deltaGoodWhenDown
        />
        <KpiCard
          index={3}
          label="Lecturas con error"
          value={0.4}
          decimals={1}
          suffix="%"
          delta="-0,2 pts vs ayer"
          deltaDirection="down"
          deltaGoodWhenDown
          sparkline={[1.1, 0.9, 1.3, 0.8, 0.7, 0.6, 0.5, 0.4]}
          sparklineColor="var(--danger)"
        />
      </div>

      {/* Mapa esquemático + últimas lecturas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
          className="rounded-lg border border-border bg-bg-raised p-5 lg:col-span-7"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-medium text-text">Esquema de red</h2>
              <p className="mt-0.5 text-xs text-text-faint">Vista esquemática · no georreferenciada</p>
            </div>
          </div>
          <NetworkSchematic devices={devices.data} variables={variables.data} pulsingIds={pulsingIds} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
          className="overflow-hidden rounded-lg border border-border bg-bg-raised lg:col-span-5"
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[17px] font-medium text-text">Últimas lecturas</h2>
              <p className="mt-0.5 text-xs text-text-faint">Actualización automática cada 15 s</p>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
          </div>
          <div className="mt-3">
            <LiveReadingsList devices={devices.data} variables={variables.data} onNewReading={onNewReading} />
          </div>
        </motion.section>
      </div>

      {/* Gráfico principal */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-lg border border-border bg-bg-raised p-6"
      >
        <h2 className="text-[17px] font-medium text-text">Caudal y nivel — últimas {range}</h2>
        <p className="mt-0.5 text-xs text-text-faint">Macromedidor salida estanque · haz click en la leyenda para alternar series</p>
        <div className="mt-4">
          <FlowLevelChart flow={flowReadings.data} level={levelReadings.data} />
        </div>
      </motion.section>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-lg border border-border bg-bg-raised p-6"
        >
          <h2 className="text-[17px] font-medium text-text">Dispositivos con problema</h2>
          <div className="mt-4 divide-y divide-border">
            {offlineDevices.length === 0 && (
              <p className="py-6 text-sm text-text-muted">Sin dispositivos con problema. Toda la red está online.</p>
            )}
            {offlineDevices.map((d) => {
              const hours = d.last_seen_at
                ? Math.round((Date.now() - new Date(d.last_seen_at).getTime()) / 3600000)
                : 0;
              const reason = hours >= 12 ? 'DISCONNECTION' : 'NO_DATA';
              return (
                <div key={d.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-text">{d.name}</div>
                    <div className="mt-0.5 text-xs text-text-faint">
                      {d.code} · última conexión {timeAgo(d.last_seen_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full border border-border bg-bg-sunken px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
                        reason === 'DISCONNECTION' ? 'text-danger' : 'text-warn',
                      )}
                    >
                      {reason}
                    </span>
                    <Link
                      to="/app/dispositivos"
                      className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:brightness-110"
                    >
                      Ver dispositivo <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          className="rounded-lg border border-border bg-bg-raised p-6"
        >
          <h2 className="text-[17px] font-medium text-text">Resumen APR del mes</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              {
                icon: Droplets,
                label: 'Consumo totalizado',
                value: `${aprSummary.m3.toLocaleString('es-CL', { maximumFractionDigits: 1 })} m³`,
              },
              { icon: Users, label: 'Clientes activos', value: String(aprSummary.activeClients) },
              { icon: ReceiptText, label: 'Cargos emitidos', value: String(aprSummary.charges) },
              { icon: Banknote, label: 'Recaudación', value: clp.format(aprSummary.revenue) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-bg-sunken p-4">
                <s.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
                <div className="tabular mt-3 text-xl font-medium text-text">{s.value}</div>
                <div className="mt-1 text-xs text-text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
