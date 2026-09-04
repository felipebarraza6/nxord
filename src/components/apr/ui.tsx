// Nxord — utilidades UI compartidas por APR y Tarificación
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------- Formatos es-CL ---------- */

const nfCLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
const nfM3 = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat('es-CL');

export function clp(n: number): string {
  return `$ ${nfCLP.format(Math.round(n))}`;
}

export function m3(n: number): string {
  return `${nfM3.format(n)} m³`;
}

export function num(n: number): string {
  return nfInt.format(n);
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function folio(n: number): string {
  return `N° ${String(n).padStart(6, '0')}`;
}

/* ---------- Count-up (numérica, tabular) ---------- */

export function CountUp({ value, format, duration = 0.8, className }: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const [text, setText] = useState(format(0));
  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setText(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={cn('tabular', className)}>{text}</span>;
}

/* ---------- Toast ---------- */

interface ToastItem {
  id: number;
  message: string;
}

let toastSeq = 1;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const push = (message: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, message }]);
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200));
  };
  return { toasts, push };
}

export function ToastHost({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-3 rounded-md border border-border border-l-2 border-l-accent bg-bg-raised px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
            <p className="text-sm text-text">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Drawer lateral (spring) ---------- */

export function Drawer({ open, onClose, title, children, wide }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className={cn(
              'fixed right-0 top-0 z-[61] flex h-full flex-col border-l border-border bg-bg shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
              wide ? 'w-full max-w-xl' : 'w-full max-w-md',
            )}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
              <h2 className="text-[15px] font-semibold text-text">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-bg-raised hover:text-text"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Modal centrado ---------- */

export function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[61] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg-raised p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-text">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-text-faint transition-colors hover:bg-bg hover:text-text"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Badge pill genérico ---------- */

export type PillTone = 'accent' | 'info' | 'warn' | 'danger' | 'muted';

const pillTones: Record<PillTone, string> = {
  accent: 'text-accent border-accent/30 bg-accent-dim',
  info: 'text-info border-info/30 bg-info/10',
  warn: 'text-warn border-warn/30 bg-warn/10',
  danger: 'text-danger border-danger/30 bg-danger/10',
  muted: 'text-text-muted border-border bg-bg-sunken',
};

export function Pill({ tone = 'muted', children, className }: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', pillTones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------- Tooltip oscuro para Recharts ---------- */

export const chartTooltipStyle = {
  backgroundColor: '#12151A',
  border: '1px solid #23282F',
  borderRadius: 8,
  fontSize: 12,
  color: '#E8EAE6',
} as const;

export const chartGridStroke = '#23282F66';
