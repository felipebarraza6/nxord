// Nxord — APR · Tab Clientes
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useClients, useTaxDocuments } from '@/lib/api/hooks';
import type { Client } from '@/lib/api/types';
import { Drawer, Pill, chartTooltipStyle, clp, folio, fechaCorta, m3 } from './ui';
import { cn } from '@/lib/utils';

const rowStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const rowItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

// Historial de consumo demo (12 meses) derivado del consumo actual
function historial12m(base: number) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses.map((mes, i) => ({
    mes,
    consumo: Math.max(2, Math.round((base * (0.72 + 0.1 * Math.sin(i * 1.3) + (i % 4) * 0.06)) * 10) / 10),
  }));
}

function ClienteDrawer({ cliente, onClose }: { cliente: Client | null; onClose: () => void }) {
  const docs = useTaxDocuments();
  const asociados = useMemo(
    () => (cliente ? docs.data.filter((d) => d.client_name === cliente.full_name).slice(0, 5) : []),
    [docs.data, cliente],
  );
  return (
    <Drawer open={!!cliente} onClose={onClose} title={cliente?.full_name ?? ''} wide>
      {cliente && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['RUT', cliente.rut],
              ['Comuna', cliente.commune],
              ['Dirección', cliente.address ?? '—'],
              ['Medidor asignado', cliente.meter_code ?? '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="eyebrow">{k}</p>
                <p className="tabular mt-1.5 text-sm text-text">{v}</p>
              </div>
            ))}
            <div>
              <p className="eyebrow">Cobro recurrente</p>
              <div className="mt-1.5"><Pill tone="accent">Contrato activo</Pill></div>
            </div>
            <div>
              <p className="eyebrow">Estado</p>
              <div className="mt-1.5">
                <Pill tone={cliente.is_active ? 'accent' : 'muted'}>{cliente.is_active ? 'Activo' : 'Inactivo'}</Pill>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Historial de consumos — 12 meses</p>
            <div className="mt-3 h-44 rounded-lg border border-border bg-bg-raised p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historial12m(cliente.last_consumption_m3 ?? 15)} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#5A6169' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#5A6169' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#23282F44' }} formatter={(v) => [m3(Number(v)), 'Consumo']} />
                  <Bar dataKey="consumo" fill="#7FB6A4" radius={[3, 3, 0, 0]} animationDuration={500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="eyebrow">Documentos asociados</p>
            <div className="mt-3 divide-y divide-border rounded-lg border border-border">
              {asociados.length === 0 && (
                <p className="px-4 py-6 text-sm text-text-faint">Sin documentos emitidos para este cliente.</p>
              )}
              {asociados.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-text-faint" strokeWidth={1.75} />
                    <div>
                      <p className="tabular text-sm text-text">Boleta {folio(d.folio)}</p>
                      <p className="text-xs text-text-faint">{fechaCorta(d.issued_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular text-sm text-text">{clp(d.amount)}</span>
                    <Pill tone={d.status === 'pagado' ? 'accent' : d.status === 'anulado' ? 'danger' : 'warn'}>
                      {d.status === 'pagado' ? 'Pagado' : d.status === 'anulado' ? 'Anulado' : 'Pendiente'}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default function ClientesTab() {
  const { data: clientes } = useClients();
  const [query, setQuery] = useState('');
  const [comuna, setComuna] = useState<string>('todas');
  const [seleccionado, setSeleccionado] = useState<Client | null>(null);

  const comunas = useMemo(() => Array.from(new Set(clientes.map((c) => c.commune))).sort(), [clientes]);
  const filtrados = useMemo(
    () =>
      clientes.filter((c) => {
        const q = query.trim().toLowerCase();
        const okQ = !q || c.full_name.toLowerCase().includes(q) || c.rut.toLowerCase().includes(q);
        const okC = comuna === 'todas' || c.commune === comuna;
        return okQ && okC;
      }),
    [clientes, query, comuna],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o RUT…"
            className="w-72 rounded-md border border-border bg-bg-raised py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-faint focus:border-border-strong focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['todas', ...comunas].map((c) => (
            <button
              key={c}
              onClick={() => setComuna(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                comuna === c
                  ? 'border-accent/40 bg-accent-dim text-accent'
                  : 'border-border bg-bg-raised text-text-muted hover:border-border-strong hover:text-text',
              )}
            >
              {c === 'todas' ? 'Todas las comunas' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg-sunken">
              {['Nombre', 'RUT', 'Dirección / Comuna', 'Medidor', 'Cobro', 'Estado'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={rowStagger} initial="hidden" animate="show" key={query + comuna}>
            {filtrados.map((c) => (
              <motion.tr
                key={c.id}
                variants={rowItem}
                onClick={() => setSeleccionado(c)}
                className="h-12 cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-bg-raised"
              >
                <td className="px-4 py-3 text-sm font-medium text-text">{c.full_name}</td>
                <td className="tabular px-4 py-3 text-sm text-text-muted">{c.rut}</td>
                <td className="px-4 py-3">
                  <span className="text-sm text-text-muted">{c.address ?? '—'}</span>
                  <span className="ml-2 rounded-full border border-border bg-bg-sunken px-2 py-0.5 text-xs text-text-muted">{c.commune}</span>
                </td>
                <td className="tabular px-4 py-3 text-sm text-text-muted">{c.meter_code ?? '—'}</td>
                <td className="px-4 py-3"><Pill tone="info">Recurrente</Pill></td>
                <td className="px-4 py-3">
                  <Pill tone={c.is_active ? 'accent' : 'muted'}>{c.is_active ? 'Activo' : 'Inactivo'}</Pill>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
        {filtrados.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-text-faint">No se encontraron clientes para el filtro aplicado.</p>
        )}
      </div>

      <ClienteDrawer cliente={seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
}
