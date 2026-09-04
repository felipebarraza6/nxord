import { cn } from '@/lib/utils';

type DeltaDirection = 'up' | 'down' | 'flat';

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: DeltaDirection;
  /** color semántico del delta: por defecto up=accent, down=danger */
  deltaGoodWhenDown?: boolean;
  sparkline?: number[];
  className?: string;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 96;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - 2 - ((p - min) / range) * (h - 4)}`)
    .join(' L ');
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <path d={`M ${path}`} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  delta,
  deltaDirection = 'flat',
  deltaGoodWhenDown = false,
  sparkline,
  className,
}: StatCardProps) {
  const deltaColor =
    deltaDirection === 'flat'
      ? 'text-text-faint'
      : (deltaDirection === 'up') !== deltaGoodWhenDown
        ? 'text-accent'
        : 'text-danger';

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-bg-raised p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong',
        className,
      )}
    >
      <p className="eyebrow">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="tabular text-[32px] font-medium leading-none text-text">{value}</div>
          {delta && (
            <div className={cn('tabular mt-2 text-[13px] font-medium', deltaColor)}>
              {deltaDirection === 'up' && '▲ '}
              {deltaDirection === 'down' && '▼ '}
              {delta}
            </div>
          )}
        </div>
        {sparkline && <Sparkline points={sparkline} />}
      </div>
    </div>
  );
}
