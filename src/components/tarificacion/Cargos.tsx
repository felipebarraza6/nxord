// Nxord — Tarificación · Cargos del período
import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useClients } from '@/lib/api/hooks';
import { Pill, clp } from '@/components/apr/ui';
import { cn } from '@/lib/utils';

export interface Cargo {
  id: number;
  cliente: string;
  rut: string;
  consumoM3: number;
  monto: number;
  estado: 'calculado' | 'emitido';
  flash?: boolean;
}

interface Props {
  cargos: Cargo[];
  onEmitir: (id: number) => void;
}

export function useCargos(): [Cargo[], Dispatch<SetStateAction<Cargo[]>>] {
  const { data: clientes } = useClients();
  const base = useMemo<Cargo[]>(
    () =>
      clientes
        .filter((c) => c.is_active)
        .map((c, i) => {
          const consumo = c.last_consumption_m3 ?? 15;
          const neto = 6500 + Math.max(0, consumo - 15) * 420 + 1500;
          return {
            id: 8000 + c.id,
            cliente: c.full_name,
            rut: c.rut,
            consumoM3: consumo,
            monto: Math.round(neto * 1.19),
            estado: (i % 3 === 0 ? 'emitido' : 'calculado') as Cargo['estado'],
          };
        }),
    [clientes],
  );
  const [extra, setExtra] = useState<Cargo[]>([]);
  const merged = useMemo(() => {
    const ids = new Set(extra.map((e) => e.id));
    return [...base.filter((b) => !ids.has(b.id)), ...extra];
  }, [base, extra]);
  return [merged, setExtra];
}

export default function Cargos({ cargos, onEmitir }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-text">Cargos del período</h2>
        <span className="tabular text-xs text-text-faint">{cargos.length} cargos · febrero 2026</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-bg-sunken">
              {['Cliente', 'RUT', 'Consumo', 'Cargo calculado', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence initial={false}>
              {cargos.map((c) => (
                <motion.tr
                  key={c.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } } }}
                  className={cn(
                    'h-12 border-b border-border transition-colors last:border-0 hover:bg-bg-raised',
                    c.flash && 'border-l-2 border-l-accent bg-accent-dim/40',
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-text">{c.cliente}</td>
                  <td className="tabular px-4 py-3 text-sm text-text-muted">{c.rut}</td>
                  <td className="tabular px-4 py-3 text-sm text-text-muted">
                    {c.consumoM3.toLocaleString('es-CL', { minimumFractionDigits: 1 })} m³
                  </td>
                  <td className="tabular px-4 py-3 text-sm font-medium text-text">{clp(c.monto)}</td>
                  <td className="px-4 py-3">
                    {c.estado === 'emitido' ? <Pill tone="accent">Emitido</Pill> : <Pill tone="info">Calculado</Pill>}
                  </td>
                  <td className="px-4 py-3">
                    {c.estado === 'calculado' ? (
                      <button
                        onClick={() => onEmitir(c.id)}
                        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        Emitir DTE <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-text-faint">Con documento</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </section>
  );
}
