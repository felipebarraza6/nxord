// Nxord — Tarificación · Stepper del flujo de cobro
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type EtapaId = 'medicion' | 'cargo' | 'documento' | 'pago';

const etapas: { id: EtapaId; label: string; count: string }[] = [
  { id: 'medicion', label: 'Medición', count: '214 lecturas' },
  { id: 'cargo', label: 'Cargo', count: '198 cargos' },
  { id: 'documento', label: 'Documento', count: '192 boletas' },
  { id: 'pago', label: 'Pago', count: '151 pagadas' },
];

export default function Stepper({ activa, onSelect }: { activa: EtapaId; onSelect: (e: EtapaId) => void }) {
  return (
    <div className="rounded-lg border border-border bg-bg-raised px-6 py-5">
      <div className="relative flex items-start justify-between">
        {/* línea conectora */}
        <div className="absolute left-0 right-0 top-[7px] h-px bg-border-strong" />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute left-0 right-0 top-[7px] h-px origin-left bg-accent/50"
        />
        {etapas.map((e, i) => {
          const active = activa === e.id;
          return (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 + i * 0.1 }}
              onClick={() => onSelect(e.id)}
              className="relative z-10 flex flex-col items-center gap-2 bg-bg-raised px-3"
            >
              <span
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2 transition-colors',
                  active ? 'border-accent bg-accent' : 'border-border-strong bg-bg',
                )}
              />
              <span className={cn('text-sm font-medium transition-colors', active ? 'text-text' : 'text-text-muted')}>
                {e.label}
              </span>
              <span className="tabular text-xs text-text-faint">{e.count}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
