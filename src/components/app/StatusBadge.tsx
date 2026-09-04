import { cn } from '@/lib/utils';

export type StatusKind = 'online' | 'offline' | 'alerta' | 'dga';

const config: Record<StatusKind, { label: string; dot: string; text: string; pulse?: boolean }> = {
  online: { label: 'Online', dot: 'bg-accent', text: 'text-accent', pulse: true },
  offline: { label: 'Offline', dot: 'bg-danger', text: 'text-danger' },
  alerta: { label: 'Alerta', dot: 'bg-warn', text: 'text-warn' },
  dga: { label: 'Enviado DGA', dot: 'bg-info', text: 'text-info' },
};

export default function StatusBadge({ status, className }: { status: StatusKind; className?: string }) {
  const c = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-sunken px-2.5 py-0.5 text-xs font-medium',
        c.text,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {c.pulse && (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 [animation-duration:2s]', c.dot)} />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', c.dot)} />
      </span>
      {c.label}
    </span>
  );
}
