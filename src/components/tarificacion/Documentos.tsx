// Nxord — Tarificación · Documentos tributarios (DTE SII)
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { useTaxDocuments } from '@/lib/api/hooks';
import type { TaxDocument } from '@/lib/api/types';
import EmptyState from '@/components/app/EmptyState';
import { Drawer, Pill, clp, fechaCorta, folio } from '@/components/apr/ui';
import { cn } from '@/lib/utils';

const dteLabels: Record<TaxDocument['doc_type'], string> = {
  39: 'Boleta 39',
  33: 'Factura 33',
  61: 'Nota de crédito 61',
  56: 'Nota de débito 56',
};

type SiiEstado = 'aceptado' | 'pendiente' | 'rechazado';
function siiEstado(d: TaxDocument): SiiEstado {
  if (d.status === 'anulado') return 'rechazado';
  if (d.status === 'pendiente') return 'pendiente';
  return 'aceptado';
}
const siiCfg: Record<SiiEstado, { label: string; tone: 'accent' | 'warn' | 'danger' }> = {
  aceptado: { label: 'Aceptado', tone: 'accent' },
  pendiente: { label: 'Pendiente', tone: 'warn' },
  rechazado: { label: 'Rechazado', tone: 'danger' },
};

function netoDe(total: number) {
  return Math.round(Math.abs(total) / 1.19);
}

function DocDrawer({ doc, onClose, onPagar }: {
  doc: TaxDocument | null;
  onClose: () => void;
  onPagar: (d: TaxDocument) => void;
}) {
  return (
    <Drawer open={!!doc} onClose={onClose} title={doc ? `${dteLabels[doc.doc_type]} ${folio(doc.folio)}` : ''}>
      {doc && (
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-bg-raised p-6">
            <p className="eyebrow">Folio</p>
            <p className="tabular mt-2 text-[32px] font-medium leading-none text-text">{folio(doc.folio)}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-text-muted">{doc.client_name}</span>
              <Pill tone={siiCfg[siiEstado(doc)].tone}>{siiCfg[siiEstado(doc)].label} SII</Pill>
            </div>
          </div>

          <div>
            <p className="eyebrow">Detalle</p>
            <div className="mt-3 divide-y divide-border rounded-lg border border-border">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-text-muted">Consumo de agua potable — 18,3 m³ × tarifa vigente</span>
                <span className="tabular text-text">{clp(netoDe(doc.amount) - 1500)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-text-muted">Cargo fijo de servicio</span>
                <span className="tabular text-text">{clp(1500)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-raised p-5">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Neto</span>
              <span className="tabular text-text">{clp(netoDe(doc.amount))}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-text-muted">IVA 19 %</span>
              <span className="tabular text-text">{clp(Math.abs(doc.amount) - netoDe(doc.amount))}</span>
            </div>
            <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-text-muted">Total</span>
              <span className="tabular text-2xl font-medium text-accent">{clp(Math.abs(doc.amount))}</span>
            </div>
          </div>

          <div>
            <p className="eyebrow">Timbre electrónico</p>
            <div className="mt-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-border-strong bg-bg-sunken">
              <p className="tabular text-xs text-text-faint">TED · SII · {fechaCorta(doc.issued_at)}</p>
            </div>
          </div>

          {doc.status !== 'pagado' && doc.status !== 'anulado' && (
            <button
              onClick={() => onPagar(doc)}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
            >
              Registrar pago
            </button>
          )}
        </div>
      )}
    </Drawer>
  );
}

export default function Documentos({ onPagar, onGenerarCargos }: {
  onPagar: (d: TaxDocument) => void;
  onGenerarCargos: () => void;
}) {
  const { data: docs } = useTaxDocuments();
  const [filtro, setFiltro] = useState<number | 'todos'>('todos');
  const [seleccionado, setSeleccionado] = useState<TaxDocument | null>(null);

  const filtrados = useMemo(
    () => docs.filter((d) => filtro === 'todos' || d.doc_type === filtro),
    [docs, filtro],
  );

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-text">Documentos tributarios</h2>
        <div className="flex flex-wrap gap-1.5">
          {(['todos', 39, 33, 61, 56] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filtro === t
                  ? 'border-accent/40 bg-accent-dim text-accent'
                  : 'border-border bg-bg-raised text-text-muted hover:border-border-strong hover:text-text',
              )}
            >
              {t === 'todos' ? 'Todos' : dteLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Aún no hay documentos emitidos este período."
            description="Genera los cargos desde las mediciones validadas y emite los DTE al SII."
            ctaLabel="Generar cargos desde mediciones"
            onCta={onGenerarCargos}
          />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-sunken">
                {['Tipo', 'Folio', 'Cliente', 'Neto', 'IVA', 'Total', 'Fecha', 'Estado SII', ''].map((h) => (
                  <th key={h} className={cn('px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint', ['Neto', 'IVA', 'Total'].includes(h) && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              key={String(filtro)}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {filtrados.map((d) => {
                const sii = siiEstado(d);
                return (
                  <motion.tr
                    key={d.id}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } } }}
                    onClick={() => setSeleccionado(d)}
                    className="h-12 cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-bg-raised"
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-text-muted">{dteLabels[d.doc_type]}</span>
                    </td>
                    <td className="tabular px-4 py-3 text-sm font-medium text-text">{folio(d.folio)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{d.client_name}</td>
                    <td className="tabular px-4 py-3 text-right text-sm text-text-muted">{clp(netoDe(d.amount))}</td>
                    <td className="tabular px-4 py-3 text-right text-sm text-text-muted">{clp(Math.abs(d.amount) - netoDe(d.amount))}</td>
                    <td className="tabular px-4 py-3 text-right text-sm font-medium text-text">{clp(d.amount)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{fechaCorta(d.issued_at)}</td>
                    <td className="px-4 py-3"><Pill tone={siiCfg[sii].tone}>{siiCfg[sii].label}</Pill></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSeleccionado(d);
                          }}
                          className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-bg hover:text-text"
                          aria-label="Ver PDF"
                        >
                          <FileDown className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        {d.status !== 'pagado' && d.status !== 'anulado' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPagar(d);
                            }}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      )}

      <DocDrawer doc={seleccionado} onClose={() => setSeleccionado(null)} onPagar={onPagar} />
    </section>
  );
}
