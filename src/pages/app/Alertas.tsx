// Nxord — App / Alertas (/app/alertas)
// Triggers por severidad con acuse, reglas de alerta y canales.
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BellRing, Check, Mail, MessageSquare, Plus, Radio, Search, Webhook, X } from 'lucide-react';
import { Link } from 'react-router';
import { useAlertTriggers } from '@/lib/api/hooks';
import type { AlertTrigger } from '@/lib/api/types';
import EmptyState from '@/components/app/EmptyState';
import { cn } from '@/lib/utils';

type Severity = 'critical' | 'warning' | 'info';

const SEV: Record<Severity, { label: string; color: string; text: string }> = {
  critical: { label: 'Crítica', color: 'var(--danger)', text: 'text-danger' },
  warning: { label: 'Media', color: 'var(--warn)', text: 'text-warn' },
  info: { label: 'Info', color: 'var(--info)', text: 'text-info' },
};

const RULE_TYPE: Record<string, string> = {
  'Caudal bajo umbral': 'THRESHOLD_MIN',
  'Desconexión de dispositivo': 'DISCONNECTION',
  'Nivel estanque alto': 'THRESHOLD_MAX',
  'Tasa de cambio anómala': 'RATE_OF_CHANGE',
};

const DIAGNOSIS: Record<string, string> = {
  'Caudal bajo umbral':
    'Posible fuga aguas abajo del sector 2 o bomba trabajando bajo capacidad. Revisar presión de descarga y estado del macromedidor antes de despachar terreno.',
  'Desconexión de dispositivo':
    'Sin telemetría entrante. Causa probable: alimentación eléctrica del gabinete o cobertura de señal. Verificar último voltaje reportado y estado del enlace.',
  'Nivel estanque alto':
    'Estanque próximo a su capacidad máxima. Considerar reducir bombeo de pozos o abrir by-pass hacia la red de distribución.',
  'Tasa de cambio anómala':
    'Variación brusca de caudal. Patrón compatible con apertura de válvula no programada o rotura de matriz en el tramo norte.',
};

function timeAgo(iso: string): string {
  try {
    return `hace ${formatDistanceToNow(new Date(iso), { locale: es })}`;
  } catch {
    return '—';
  }
}

// ---------- count-up ----------

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular">{n}</span>;
}

// ---------- página ----------

const TABS = ['Alertas', 'Reglas', 'Canales'] as const;
type Tab = (typeof TABS)[number];
type SevFilter = 'todas' | Severity;

export default function Alertas() {
  const { data: alerts, isDemo, isLoading } = useAlertTriggers();
  const [tab, setTab] = useState<Tab>('Alertas');
  const [sevFilter, setSevFilter] = useState<SevFilter>('todas');
  const [hideAck, setHideAck] = useState(false);
  const [query, setQuery] = useState('');
  const [acked, setAcked] = useState<Record<number, string>>({});
  const [showNewRule, setShowNewRule] = useState(false);

  const counts = useMemo(
    () => ({
      critical: alerts.filter((a) => a.severity === 'critical' && !isAck(a, acked)).length,
      warning: alerts.filter((a) => a.severity === 'warning' && !isAck(a, acked)).length,
      unacked: alerts.filter((a) => !isAck(a, acked)).length,
    }),
    [alerts, acked],
  );

  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => (sevFilter === 'todas' ? true : a.severity === sevFilter))
        .filter((a) => (hideAck ? !isAck(a, acked) : true))
        .filter((a) => {
          if (!query) return true;
          const q = query.toLowerCase();
          return (
            a.rule_name.toLowerCase().includes(q) ||
            (a.device_name ?? '').toLowerCase().includes(q) ||
            a.message.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => +new Date(b.triggered_at) - +new Date(a.triggered_at)),
    [alerts, sevFilter, hideAck, query, acked],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Alertas</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Triggers de la red, reglas de monitoreo y canales de notificación.
          </p>
        </div>
        {isDemo && (
          <span className="rounded-full border border-border bg-bg-sunken px-3 py-1 text-xs text-text-faint">
            Modo demo
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative pb-2.5 text-sm font-medium transition-colors',
              tab === t ? 'text-text' : 'text-text-faint hover:text-text-muted',
            )}
          >
            {t}
            {tab === t && (
              <motion.span layoutId="alertas-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {tab === 'Alertas' && (
        <>
          {/* StatCards filtrables */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(
              [
                { label: 'Críticas', value: counts.critical, color: 'var(--danger)', filter: 'critical' as SevFilter },
                { label: 'Advertencias', value: counts.warning, color: 'var(--warn)', filter: 'warning' as SevFilter },
                { label: 'Sin acuse', value: counts.unacked, color: 'var(--info)', filter: 'todas' as SevFilter },
              ] as const
            ).map((c, i) => (
              <motion.button
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                onClick={() => setSevFilter(c.filter)}
                className={cn(
                  'rounded-lg border bg-bg-raised p-6 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong',
                  sevFilter === c.filter ? 'border-border-strong' : 'border-border',
                )}
              >
                <p className="eyebrow flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </p>
                <p className="mt-3 text-[32px] font-medium leading-none text-text">
                  <CountUp value={c.value} />
                </p>
              </motion.button>
            ))}
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(['todas', 'critical', 'warning', 'info'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSevFilter(s)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                    sevFilter === s
                      ? 'border-accent bg-accent-dim text-text'
                      : 'border-border text-text-muted hover:border-border-strong hover:text-text',
                  )}
                >
                  {s === 'todas' ? 'Todas' : SEV[s].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setHideAck((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                hideAck
                  ? 'border-accent bg-accent-dim text-text'
                  : 'border-border text-text-muted hover:border-border-strong hover:text-text',
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Ocultar reconocidas
            </button>
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar alerta…"
                className="h-9 w-56 rounded-md border border-border bg-bg pl-9 pr-3 text-[13px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Lista */}
          {isLoading ? (
            <div className="mt-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-bg-raised" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Todo en calma. La red no reporta alertas."
                description="Cuando una regla se gatille, aparecerá aquí con su diagnóstico y acciones."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <AnimatePresence initial={false}>
                {filtered.map((a, i) => (
                  <AlertCard
                    key={a.id}
                    alert={a}
                    index={i}
                    ackedAt={acked[a.id]}
                    onAck={() => setAcked((m) => ({ ...m, [a.id]: new Date().toISOString() }))}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {tab === 'Reglas' && <RulesTab onNew={() => setShowNewRule(true)} />}
      {tab === 'Canales' && <ChannelsTab />}

      {/* Modal nueva regla (demo) */}
      <AnimatePresence>
        {showNewRule && <NewRuleModal onClose={() => setShowNewRule(false)} />}
      </AnimatePresence>
    </div>
  );
}

function isAck(a: AlertTrigger, acked: Record<number, string>): boolean {
  return a.acknowledged || Boolean(acked[a.id]);
}

// ---------- tarjeta de alerta ----------

function AlertCard({
  alert: a,
  index,
  ackedAt,
  onAck,
}: {
  alert: AlertTrigger;
  index: number;
  ackedAt?: string;
  onAck: () => void;
}) {
  const sev = SEV[a.severity];
  const acknowledged = a.acknowledged || Boolean(ackedAt);
  const ruleType = RULE_TYPE[a.rule_name] ?? 'NO_DATA';
  const diagnosis = DIAGNOSIS[a.rule_name];

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: acknowledged ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-lg border border-border bg-bg-raised p-5 pl-6"
    >
      {/* Barra de severidad */}
      <span className="absolute inset-y-0 left-0 w-0.5" style={{ background: sev.color }} />
      {/* Flash de borde al entrar */}
      <motion.span
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0 rounded-lg border"
        style={{ borderColor: sev.color }}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-text">{a.rule_name}</p>
          <p className="mt-1 text-[13px] text-text-muted">
            {a.device_name ?? '—'} · {a.message}
          </p>
        </div>
        <span className={cn('rounded-full border border-border bg-bg-sunken px-2.5 py-0.5 text-xs font-medium', sev.text)}>
          {sev.label}
        </span>
      </div>

      <p className="tabular mt-2 text-[13px] text-text-faint">
        {ruleType} · {timeAgo(a.triggered_at)}
      </p>

      {diagnosis && (
        <blockquote className="mt-3 border-l-2 border-info bg-[#7C93A80D] px-4 py-2.5 text-[13px] leading-relaxed text-text-muted">
          {diagnosis}
        </blockquote>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {acknowledged ? (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-accent"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
            Reconocida {ackedAt ? timeAgo(ackedAt) : ''}
          </motion.span>
        ) : (
          <button
            onClick={onAck}
            className="rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-text-muted transition-all hover:-translate-y-px hover:border-border-strong hover:text-text"
          >
            Reconocer
          </button>
        )}
        <Link
          to="/app/dispositivos"
          className="text-[13px] font-medium text-info transition-colors hover:text-text"
        >
          Ver dispositivo →
        </Link>
      </div>
    </motion.div>
  );
}

// ---------- reglas ----------

const DEMO_RULES = [
  { id: 1, name: 'Caudal bajo umbral', type: 'THRESHOLD_MIN', umbral: '10 l/s', severity: 'warning' as Severity, channels: ['correo', 'sms'], active: true },
  { id: 2, name: 'Caudal sobre umbral máximo', type: 'THRESHOLD_MAX', umbral: '18 l/s', severity: 'critical' as Severity, channels: ['correo', 'sms', 'webhook'], active: true },
  { id: 3, name: 'Desconexión de dispositivo', type: 'DISCONNECTION', umbral: '4 h', severity: 'critical' as Severity, channels: ['correo'], active: true },
  { id: 4, name: 'Nivel estanque alto', type: 'THRESHOLD_MAX', umbral: '90 %', severity: 'info' as Severity, channels: ['correo'], active: true },
  { id: 5, name: 'Tasa de cambio anómala', type: 'RATE_OF_CHANGE', umbral: '35 %/h', severity: 'warning' as Severity, channels: ['webhook'], active: false },
  { id: 6, name: 'Sin datos de variable', type: 'NO_DATA', umbral: '30 min', severity: 'info' as Severity, channels: ['correo'], active: true },
];

function RulesTab({ onNew }: { onNew: () => void }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Condiciones de monitoreo evaluadas sobre las variables de cada dispositivo.
        </p>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-text-muted transition-all hover:-translate-y-px hover:border-border-strong hover:text-text"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nueva regla
        </button>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg-sunken">
              {['Nombre', 'Condición', 'Umbral', 'Severidad', 'Canales', 'Activa'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_RULES.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border last:border-0 hover:bg-bg-raised"
              >
                <td className="px-4 py-3 text-sm font-medium text-text">{r.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded border border-border bg-bg-sunken px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-text-muted">
                    {r.type}
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-[13px] text-text">{r.umbral}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full border border-border bg-bg-sunken px-2 py-0.5 text-xs font-medium', SEV[r.severity].text)}>
                    {SEV[r.severity].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.channels.map((c) => (
                      <span key={c} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">
                        {c === 'sms' ? 'SMS' : c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'relative inline-flex h-4 w-7 cursor-not-allowed items-center rounded-full opacity-60',
                      r.active ? 'bg-accent' : 'bg-border-strong',
                    )}
                    title="Solo lectura en modo demo"
                  >
                    <span
                      className={cn(
                        'inline-block h-3 w-3 transform rounded-full bg-bg',
                        r.active ? 'translate-x-3.5' : 'translate-x-0.5',
                      )}
                    />
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- canales ----------

const CHANNELS = [
  { id: 1, icon: Mail, type: 'Correo', dest: 'operaciones@aprlosalerces.cl', state: 'Activo' },
  { id: 2, icon: MessageSquare, type: 'SMS', dest: '+56 9 5555 0142', state: 'Activo' },
  { id: 3, icon: Webhook, type: 'Webhook', dest: 'https://ops.example.cl/hooks/nxord', state: 'Activo' },
  { id: 4, icon: Mail, type: 'Correo', dest: 'directiva@aprlosalerces.cl', state: 'Pausado' },
];

function ChannelsTab() {
  return (
    <div className="mt-6">
      <p className="text-sm text-text-muted">Destinos de notificación para los triggers de alerta.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-lg border border-border bg-bg-raised p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-bg-sunken text-text-muted">
              <c.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">{c.type}</p>
              <p className="tabular mt-0.5 truncate text-[13px] text-text-faint">{c.dest}</p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-sunken px-2.5 py-0.5 text-xs',
                c.state === 'Activo' ? 'text-accent' : 'text-text-faint',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', c.state === 'Activo' ? 'bg-accent' : 'bg-text-faint')} />
              {c.state}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------- modal nueva regla ----------

function NewRuleModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg-raised p-6 shadow-modal"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-sunken text-text-muted">
              <BellRing className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="text-lg font-semibold text-text">Nueva regla de alerta</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-faint hover:bg-bg hover:text-text"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pointer-events-none mt-5 space-y-3 opacity-50">
          {['Nombre de la regla', 'Variable a monitorear', 'Umbral'].map((l) => (
            <div key={l}>
              <p className="mb-1.5 text-xs font-medium text-text-faint">{l}</p>
              <div className="h-9 rounded-md border border-border bg-bg" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            {['correo', 'SMS', 'webhook'].map((c) => (
              <span key={c} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
                {c}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 rounded-md border border-border bg-bg-sunken px-3 py-2 text-xs text-text-muted">
          <Radio className="h-3.5 w-3.5 shrink-0 text-info" strokeWidth={1.75} />
          Disponible conectado a la operación. En modo demo las reglas son de solo lectura.
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
        >
          Entendido
        </button>
      </motion.div>
    </>
  );
}
