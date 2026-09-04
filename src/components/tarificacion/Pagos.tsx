// Nxord — Tarificación · Pagos y recaudación
import { motion } from 'framer-motion';
import { usePayments } from '@/lib/api/hooks';
import type { Payment } from '@/lib/api/types';
import { Pill, CountUp, clp, fechaCorta } from '@/components/apr/ui';

const metodoLabel: Record<Payment['method'], string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  webpay: 'WebPay',
  tarjeta: 'Tarjeta',
};

export default function Pagos() {
  const { data: pagos } = usePayments();

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-text">Pagos</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Tabla de pagos */}
        <div className="overflow-hidden rounded-lg border border-border xl:col-span-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-sunken">
                {['Fecha', 'Cliente', 'Monto', 'Método', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {pagos.map((p) => (
                <motion.tr
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } } }}
                  className="h-12 border-b border-border transition-colors last:border-0 hover:bg-bg-raised"
                >
                  <td className="px-4 py-3 text-sm text-text-muted">{fechaCorta(p.paid_at)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text">{p.client_name}</td>
                  <td className="tabular px-4 py-3 text-sm font-medium text-text">{clp(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-bg-sunken px-2.5 py-0.5 text-xs text-text-muted">
                      {metodoLabel[p.method]}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Pill tone="accent">Conciliado</Pill></td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {/* StatCards recaudación */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {(
            [
              { label: 'Recaudación del mes', value: 2847320, format: (n: number) => clp(n), delta: '▲ +8,4 % vs. enero', cls: 'text-accent' },
              { label: 'Pendiente por cobrar', value: 412500, format: (n: number) => clp(n), delta: '41 documentos abiertos', cls: 'text-warn' },
              { label: 'Morosidad', value: 4.2, format: (n: number) => `${n.toFixed(1).replace('.', ',')} %`, delta: '▼ -0,6 pts', cls: 'text-accent' },
            ] as const
          ).map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.08, ease: 'easeOut' }}
              className="rounded-lg border border-border bg-bg-raised p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong"
            >
              <p className="eyebrow">{s.label}</p>
              <div className="mt-3">
                <CountUp value={s.value} duration={1} format={s.format} className="text-[32px] font-medium leading-none text-text" />
                <div className={`tabular mt-2 text-[13px] font-medium ${s.cls}`}>{s.delta}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
