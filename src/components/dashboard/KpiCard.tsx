import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'flat';
  deltaGoodWhenDown?: boolean;
  sparkline?: number[];
  sparklineColor?: string;
  pulse?: boolean;
  pulseColor?: string;
  index?: number;
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const w = 96;
  const h = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${((i / (points.length - 1)) * w).toFixed(1)},${(h - 2 - ((p - min) / range) * (h - 4)).toFixed(1)}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
}

/** StatCard de KPI con count-up, sparkline draw-in y dot pulse opcional. */
export default function KpiCard({
  label,
  value,
  decimals = 0,
  suffix,
  delta,
  deltaDirection = 'flat',
  deltaGoodWhenDown = false,
  sparkline,
  sparklineColor = 'var(--accent)',
  pulse = false,
  pulseColor = 'bg-accent',
  index = 0,
}: KpiCardProps) {
  const deltaColor =
    deltaDirection === 'flat'
      ? 'text-text-faint'
      : (deltaDirection === 'up') !== deltaGoodWhenDown
        ? 'text-accent'
        : 'text-danger';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.08 }}
      className="rounded-lg border border-border bg-bg-raised p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="flex items-center gap-2">
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 [animation-duration:2s]', pulseColor)} />
            <span className={cn('relative inline-flex h-2 w-2 rounded-full', pulseColor)} />
          </span>
        )}
        <p className="eyebrow">{label}</p>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="tabular text-[32px] font-medium leading-none text-text">
            <CountUp value={value} decimals={decimals} duration={800} />
            {suffix && <span className="ml-1.5 text-[15px] font-normal text-text-muted">{suffix}</span>}
          </div>
          {delta && (
            <div className={cn('tabular mt-2 text-[13px] font-medium', deltaColor)}>
              {deltaDirection === 'up' && '▲ '}
              {deltaDirection === 'down' && '▼ '}
              {delta}
            </div>
          )}
        </div>
        {sparkline && <Sparkline points={sparkline} color={sparklineColor} />}
      </div>
    </motion.div>
  );
}
