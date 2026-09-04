import { useDevices } from '@/lib/api/hooks';

export default function ApiStatus() {
  const { isDemo } = useDevices();
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
      <span className={`h-1.5 w-1.5 rounded-full ${isDemo ? 'bg-warn' : 'bg-accent'}`} />
      <span className="text-xs text-text-muted">{isDemo ? 'Modo demo' : 'Conectado'}</span>
    </div>
  );
}
