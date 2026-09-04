// Nxord — APR · Tab Mediciones (lecturas de consumo + registro)
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Plus } from 'lucide-react';
import { useClients } from '@/lib/api/hooks';
import { Modal, Pill, chartGridStroke, chartTooltipStyle, fechaCorta, m3, useToast, ToastHost } from './ui';

const rowStagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const rowItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

// Consumo por sector — últimos 6 meses (demo)
const consumoSector = [
  { mes: 'Sep', 'El Roble': 1180, 'Altos del Lago': 860, 'Sector Sur': 720 },
  { mes: 'Oct', 'El Roble': 1245, 'Altos del Lago': 902, 'Sector Sur': 768 },
  { mes: 'Nov', 'El Roble': 1310, 'Altos del Lago': 948, 'Sector Sur': 801 },
  { mes: 'Dic', 'El Roble': 1422, 'Altos del Lago': 1015, 'Sector Sur': 846 },
  { mes: 'Ene', 'El Roble': 1518, 'Altos del Lago': 1084, 'Sector Sur': 890 },
  { mes: 'Feb', 'El Roble': 1496, 'Altos del Lago': 1062, 'Sector Sur': 872 },
];

interface Lectura {
  id: number;
  medidor: string;
  cliente: string;
  anterior: number;
  actual: number;
  fecha: string;
  validada: boolean;
  enviadaDga: boolean;
}

export default function MedicionesTab() {
  const { data: clientes } = useClients();
  const { toasts, push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ periodo: '2026-02', medidor: '', valor: '' });

  const lecturas = useMemo<Lectura[]>(() => {
    return clientes
      .filter((c) => c.meter_code)
      .map((c, i) => {
        const actual = 1180 + i * 137 + (c.last_consumption_m3 ?? 15);
        return {
          id: 7000 + i,
          medidor: c.meter_code!,
          cliente: c.full_name,
          anterior: Math.round((actual - (c.last_consumption_m3 ?? 15)) * 10) / 10,
          actual: Math.round(actual * 10) / 10,
          fecha: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
          validada: i % 5 !== 4,
          enviadaDga: i % 3 !== 2,
        };
      });
  }, [clientes]);

  const guardar = () => {
    setModalOpen(false);
    push(`Lectura registrada para ${form.medidor || 'medidor'} — período ${form.periodo}`);
    setForm({ periodo: '2026-02', medidor: '', valor: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text">Consumo por sector — últimos 6 meses</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Registrar lectura
        </button>
      </div>

      <div className="mt-4 h-64 rounded-lg border border-border bg-bg-raised p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={consumoSector} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid stroke={chartGridStroke} vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#5A6169' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5A6169' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#23282F44' }} formatter={(v) => [`${v} m³`]} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8B929A' }} />
            <Bar dataKey="El Roble" fill="#7FB6A4" radius={[3, 3, 0, 0]} animationDuration={600} />
            <Bar dataKey="Altos del Lago" fill="#7C93A8" radius={[3, 3, 0, 0]} animationDuration={600} animationBegin={120} />
            <Bar dataKey="Sector Sur" fill="#B9A88F" radius={[3, 3, 0, 0]} animationDuration={600} animationBegin={240} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg-sunken">
              {['Medidor', 'Cliente / Sector', 'Lectura anterior', 'Lectura actual', 'Consumo período', 'Fecha', 'Validada', 'DGA'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={rowStagger} initial="hidden" animate="show">
            {lecturas.map((l) => (
              <motion.tr key={l.id} variants={rowItem} className="h-12 border-b border-border transition-colors last:border-0 hover:bg-bg-raised">
                <td className="tabular px-4 py-3 text-sm font-medium text-text">{l.medidor}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{l.cliente}</td>
                <td className="tabular px-4 py-3 text-sm text-text-muted">{m3(l.anterior)}</td>
                <td className="tabular px-4 py-3 text-sm text-text">{m3(l.actual)}</td>
                <td className="tabular px-4 py-3 text-sm font-semibold text-accent">{m3(l.actual - l.anterior)}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{fechaCorta(l.fecha)}</td>
                <td className="px-4 py-3">
                  {l.validada ? (
                    <span className="inline-flex items-center gap-1 text-accent"><Check className="h-4 w-4" /></span>
                  ) : (
                    <span className="text-xs text-text-faint">Pendiente</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {l.enviadaDga ? <Pill tone="info">Enviada DGA</Pill> : <Pill tone="muted">Sin envío</Pill>}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar lectura">
        <div className="space-y-4">
          <div>
            <label className="eyebrow">Período</label>
            <input
              type="month"
              value={form.periodo}
              onChange={(e) => setForm({ ...form, periodo: e.target.value })}
              className="tabular mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-border-strong focus:outline-none [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="eyebrow">Medidor</label>
            <select
              value={form.medidor}
              onChange={(e) => setForm({ ...form, medidor: e.target.value })}
              className="tabular mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-border-strong focus:outline-none"
            >
              <option value="">Seleccionar medidor…</option>
              {clientes.filter((c) => c.meter_code).map((c) => (
                <option key={c.id} value={c.meter_code}>
                  {c.meter_code} — {c.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow">Lectura actual (m³)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="0,0"
              className="tabular mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-border-strong focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={!form.medidor || !form.valor}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar lectura
            </button>
          </div>
        </div>
      </Modal>

      <ToastHost toasts={toasts} />
    </div>
  );
}
