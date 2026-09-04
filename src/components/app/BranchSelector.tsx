import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { BRANCH_KEY } from '@/lib/api/client';
import { useBranches } from '@/lib/api/hooks';
import type { Branch } from '@/lib/api/types';

export default function BranchSelector() {
  const { data: branches } = useBranches();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(BRANCH_KEY));

  const active: Branch | undefined = useMemo(
    () => branches.find((b) => String(b.id) === activeId) ?? branches[0],
    [branches, activeId],
  );

  useEffect(() => {
    if (!activeId && active) {
      localStorage.setItem(BRANCH_KEY, String(active.id));
      setActiveId(String(active.id));
    }
  }, [activeId, active]);

  const select = (b: Branch) => {
    localStorage.setItem(BRANCH_KEY, String(b.id));
    setActiveId(String(b.id));
    setOpen(false);
    // Notifica a otras vistas del cambio de sucursal
    window.dispatchEvent(new CustomEvent('nxord:branch-changed', { detail: b.id }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-border bg-bg-raised px-3 py-1.5 text-sm text-text transition-colors hover:border-border-strong"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="max-w-[200px] truncate font-medium">{active?.name ?? 'Sucursal'}</span>
        {active?.commune && (
          <span className="hidden text-xs text-text-faint sm:inline">
            {active.commune}{active.region ? ` · ${active.region}` : ''}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-text-faint" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-bg-raised shadow-modal">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => select(b)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-bg-sunken"
              >
                <div>
                  <div className="text-sm font-medium text-text">{b.name}</div>
                  <div className="text-xs text-text-faint">
                    {[b.commune, b.region].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {String(b.id) === String(active?.id) && <Check className="h-4 w-4 text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
