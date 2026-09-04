import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import {
  LayoutDashboard,
  Radio,
  BellRing,
  Droplets,
  ReceiptText,
  ChevronsLeft,
  ChevronsRight,
  Puzzle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BranchSelector from './BranchSelector';
import ApiStatus from './ApiStatus';
import { useModules } from '@/lib/modules';
import { cn } from '@/lib/utils';

// Core de telemetría: siempre visible
const coreNav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/dispositivos', label: 'Dispositivos', icon: Radio },
  { to: '/app/alertas', label: 'Alertas', icon: BellRing },
];

// Módulo Nxord APR: solo visible si está activado
const aprNav = [
  { to: '/app/apr', label: 'APR / Mediciones', icon: Droplets },
  { to: '/app/tarificacion', label: 'Tarificación', icon: ReceiptText },
];

function NavItems({ items, collapsed }: { items: typeof coreNav; collapsed: boolean }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          title={item.label}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-accent-dim text-text'
                : 'text-text-muted hover:bg-bg-raised hover:text-text',
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </>
  );
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { aprEnabled, toggleApr } = useModules();

  return (
    <div className="flex min-h-[100dvh] bg-bg text-text">
      {/* Sidebar 240px → 64px colapsada */}
      <aside
        className={cn(
          'flex shrink-0 flex-col border-r border-border bg-bg-sunken transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <img src="/rune.svg" alt="Nxord" className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <span className="text-base font-semibold tracking-[-0.02em] text-text">Nxord</span>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavItems items={coreNav} collapsed={collapsed} />

          {/* Módulo Nxord APR: entradas solo si está activado */}
          <AnimatePresence initial={false}>
            {aprEnabled && (
              <motion.div
                key="apr-nav"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-1 overflow-hidden"
              >
                {!collapsed && (
                  <p className="px-3 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-text-faint">
                    Módulo APR
                  </p>
                )}
                <NavItems items={aprNav} collapsed={collapsed} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activación del módulo APR */}
          <div className="mt-4 border-t border-border pt-3">
            <div
              className={cn(
                'flex items-center rounded-md px-3 py-2',
                collapsed ? 'justify-center' : 'justify-between gap-3',
              )}
              title="Módulo Nxord APR"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Puzzle className="h-4 w-4 shrink-0 text-text-faint" strokeWidth={1.75} />
                {!collapsed && (
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-text-muted">Módulo APR</span>
                    <span className="block text-[11px] leading-snug text-text-faint">
                      Cobro y tarificación para APR
                    </span>
                  </span>
                )}
              </span>
              {!collapsed && (
                <button
                  role="switch"
                  aria-checked={aprEnabled}
                  aria-label="Activar módulo APR"
                  onClick={toggleApr}
                  className={cn(
                    'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                    aprEnabled ? 'bg-accent' : 'bg-bg-raised',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-text transition-transform',
                      aprEnabled ? 'translate-x-4 bg-bg' : 'translate-x-0.5 bg-text-faint',
                    )}
                  />
                </button>
              )}
            </div>
            {collapsed && (
              <button
                onClick={toggleApr}
                aria-label={aprEnabled ? 'Desactivar módulo APR' : 'Activar módulo APR'}
                className={cn(
                  'mt-1 h-1.5 w-full rounded-full transition-colors',
                  aprEnabled ? 'bg-accent' : 'bg-bg-raised',
                )}
              />
            )}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          {!collapsed && <ApiStatus />}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-text-faint transition-colors hover:bg-bg-raised hover:text-text-muted"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg px-6">
          <BranchSelector />
          <div className="text-xs text-text-faint">
            {aprEnabled ? 'Gestión hídrica · Telemetría + APR' : 'Gestión hídrica · Telemetría'}
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-[1440px] p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
