// Nxord — APR · Tab Cumplimiento DGA
import { motion } from 'framer-motion';
import { Pill, fechaCorta, num } from './ui';

interface DerechoAgua {
  codeDga: string;
  estandar: 'MAYOR' | 'MEDIO' | 'MENOR' | 'CMP';
  flowGrantedLs: number;
  flowMeasuredLs: number;
  totalGrantedM3: number;
}

const derechos: DerechoAgua[] = [
  { codeDga: '1102-0456-1', estandar: 'MENOR', flowGrantedLs: 8.0, flowMeasuredLs: 4.8, totalGrantedM3: 252_288 },
  { codeDga: '1102-0457-2', estandar: 'MENOR', flowGrantedLs: 5.5, flowMeasuredLs: 3.6, totalGrantedM3: 173_448 },
  { codeDga: '1102-0781-4', estandar: 'MEDIO', flowGrantedLs: 14.0, flowMeasuredLs: 12.4, totalGrantedM3: 441_504 },
  { codeDga: '1102-0933-8', estandar: 'CMP', flowGrantedLs: 10.0, flowMeasuredLs: 9.1, totalGrantedM3: 315_360 },
];

const envios = [
  { id: 1, fecha: daysAgo(1), dispositivo: 'MM-OUT-1', voucher: 'a3f8c1e2b9d44e7f8a0c6b1d3e5f7902', estado: 'Aceptado' },
  { id: 2, fecha: daysAgo(1), dispositivo: 'MM-IN-1', voucher: '7c2e9a41f0b83d6e5c1a2f4b8d0e6937', estado: 'Aceptado' },
  { id: 3, fecha: daysAgo(2), dispositivo: 'PZ-001', voucher: 'e5b10f7c3a28d496b0e3c5f7a9d21864', estado: 'Aceptado' },
  { id: 4, fecha: daysAgo(3), dispositivo: 'PZ-002', voucher: '9d4a6e80c2f15b73a8c0e2d4f6b81035', estado: 'Aceptado' },
  { id: 5, fecha: daysAgo(4), dispositivo: 'MM-OUT-1', voucher: '2f7c9b1e4a60d385c8e0a2b4d6f19407', estado: 'Aceptado' },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

const estandarTone: Record<DerechoAgua['estandar'], 'accent' | 'info' | 'warn' | 'muted'> = {
  MAYOR: 'warn',
  MEDIO: 'info',
  MENOR: 'accent',
  CMP: 'muted',
};

export default function DgaTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {derechos.map((d, i) => {
          const pct = Math.min(100, Math.round((d.flowMeasuredLs / d.flowGrantedLs) * 100));
          const caliente = pct > 90;
          return (
            <motion.div
              key={d.codeDga}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.1, ease: 'easeOut' }}
              className="rounded-lg border border-border bg-bg-raised p-6"
            >
              <div className="flex items-center justify-between">
                <p className="tabular text-sm font-medium text-text">{d.codeDga}</p>
                <Pill tone={estandarTone[d.estandar]}>{d.estandar}</Pill>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="eyebrow">Caudal medido</p>
                  <p className="tabular mt-1 text-2xl font-medium text-text">
                    {d.flowMeasuredLs.toLocaleString('es-CL')} <span className="text-sm text-text-faint">l/s</span>
                  </p>
                </div>
                <p className="tabular text-xs text-text-faint">de {d.flowGrantedLs.toLocaleString('es-CL')} l/s</p>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg-sunken">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 + i * 0.1 }}
                  className={caliente ? 'h-full bg-warn' : 'h-full bg-accent'}
                />
              </div>
              <p className="tabular mt-3 text-xs text-text-faint">
                {pct} % del concedido · Total {num(d.totalGrantedM3)} m³/año
              </p>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-text">Envíos a la DGA</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-sunken">
                {['Fecha', 'Dispositivo', 'Voucher DGA', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {envios.map((e) => (
                <motion.tr
                  key={e.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } } }}
                  className="h-12 border-b border-border transition-colors last:border-0 hover:bg-bg-raised"
                >
                  <td className="px-4 py-3 text-sm text-text-muted">{fechaCorta(e.fecha)}</td>
                  <td className="tabular px-4 py-3 text-sm font-medium text-text">{e.dispositivo}</td>
                  <td className="tabular px-4 py-3 text-sm text-text-muted">{e.voucher.slice(0, 12)}…{e.voucher.slice(-4)}</td>
                  <td className="px-4 py-3"><Pill tone="info">Aceptado</Pill></td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
