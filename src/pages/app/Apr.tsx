// Nxord — App · APR / Mediciones (/app/apr)
import { useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from '@/components/app/StatCard';
import { Pill, CountUp } from '@/components/apr/ui';
import ClientesTab from '@/components/apr/ClientesTab';
import MedicionesTab from '@/components/apr/MedicionesTab';
import DgaTab from '@/components/apr/DgaTab';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'mediciones', label: 'Mediciones' },
  { id: 'dga', label: 'Cumplimiento DGA' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const kpiContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const kpiItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export default function Apr() {
  const [tab, setTab] = useState<TabId>('clientes');

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-text">APR / Mediciones</h1>
          <p className="mt-2 text-[15px] text-text-muted">
            Clientes, medidores, consumos mensuales y cumplimiento ante la DGA.
          </p>
        </div>
        <Pill tone="accent" className="shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          APR Los Alerces
        </Pill>
      </div>

      {/* KPIs */}
      <motion.div variants={kpiContainer} initial="hidden" animate="show" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={kpiItem}>
          <div className="rounded-lg border border-border bg-bg-raised p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong">
            <p className="eyebrow">Clientes activos</p>
            <div className="mt-3">
              <CountUp value={214} duration={0.8} format={(n) => String(Math.round(n))} className="text-[32px] font-medium leading-none text-text" />
              <div className="tabular mt-2 text-[13px] font-medium text-accent">▲ +6 este mes</div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={kpiItem}>
          <StatCard label="Consumo del mes" value="3.842 m³" delta="+4,1 % vs. mes anterior" deltaDirection="up" sparkline={[2840, 3020, 3180, 3350, 3520, 3690, 3842]} />
        </motion.div>
        <motion.div variants={kpiItem}>
          <StatCard label="Medidores con lectura" value="96 %" delta="205 de 214 medidores" deltaDirection="flat" />
        </motion.div>
        <motion.div variants={kpiItem}>
          <StatCard label="Cumplimiento DGA" value="Al día" delta="Último envío aceptado ayer" deltaDirection="flat" />
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.id ? 'text-text' : 'text-text-muted hover:text-text',
            )}
          >
            {t.label}
            {tab === t.id && (
              <motion.span layoutId="apr-tab-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mt-6"
      >
        {tab === 'clientes' && <ClientesTab />}
        {tab === 'mediciones' && <MedicionesTab />}
        {tab === 'dga' && <DgaTab />}
      </motion.div>
    </div>
  );
}
