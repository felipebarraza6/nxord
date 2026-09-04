// Nxord — Tarificación · Simulador de cargo por consumo
import { useEffect, useState } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';
import { Calculator, Zap } from 'lucide-react';

const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface CargoSimulado {
  consumoM3: number;
  total: number;
}

export default function Simulador({ onGenerar }: { onGenerar: (c: CargoSimulado) => void }) {
  const [consumo, setConsumo] = useState(18);
  const [tarifaBase, setTarifaBase] = useState(6500);
  const [tramoVar, setTramoVar] = useState(420);
  const [cargoFijo, setCargoFijo] = useState(1500);
  const limite = 15; // m³ incluidos en tarifa base

  const variable = Math.max(0, consumo - limite) * tramoVar;
  const neto = tarifaBase + variable + cargoFijo;
  const iva = Math.round(neto * 0.19);
  const total = neto + iva;

  // Spring numérico para el total
  const totalMv = useMotionValue(total);
  const totalTxt = useTransform(totalMv, (v) => `$ ${nf.format(Math.round(v))}`);
  const [totalStr, setTotalStr] = useState(totalTxt.get());
  useEffect(() => {
    const controls = animate(totalMv, total, { type: 'spring', damping: 26, stiffness: 220 });
    const unsub = totalTxt.on('change', setTotalStr);
    return () => {
      controls.stop();
      unsub();
    };
  }, [total, totalMv, totalTxt]);

  return (
    <section className="rounded-lg border border-border bg-bg-raised p-8">
      <div className="flex items-center gap-3">
        <Calculator className="h-5 w-5 text-accent" strokeWidth={1.75} />
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-text">Calcular cargo por consumo</h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="eyebrow">Consumo</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={120}
                  step={0.5}
                  value={consumo}
                  onChange={(e) => setConsumo(Math.max(0, Math.min(120, Number(e.target.value) || 0)))}
                  className="tabular w-20 rounded-md border border-border bg-bg px-2 py-1 text-right text-sm text-text focus:border-border-strong focus:outline-none"
                />
                <span className="text-xs text-text-faint">m³</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={0.5}
              value={consumo}
              onChange={(e) => setConsumo(Number(e.target.value))}
              className="mt-3 w-full accent-[#7FB6A4]"
            />
            <p className="mt-1 text-xs text-text-faint">Tramo variable aplica sobre {limite} m³</p>
          </div>

          {(
            [
              ['Tarifa base', tarifaBase, setTarifaBase, '$'],
              ['Tramo variable', tramoVar, setTramoVar, '$/m³'],
              ['Cargo fijo', cargoFijo, setCargoFijo, '$'],
            ] as const
          ).map(([label, value, setter, unit]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <label className="eyebrow">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => setter(Math.max(0, Number(e.target.value) || 0))}
                  className="tabular w-28 rounded-md border border-border bg-bg px-2 py-1.5 text-right text-sm text-text focus:border-border-strong focus:outline-none"
                />
                <span className="w-8 text-xs text-text-faint">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-bg p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Neto</span>
              <span className="tabular text-text">$ {nf.format(neto)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">IVA 19 %</span>
              <span className="tabular text-text">$ {nf.format(iva)}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-text-muted">Total a cobrar</span>
                <motion.span className="tabular text-[32px] font-medium leading-none text-accent">{totalStr}</motion.span>
              </div>
              <p className="tabular mt-2 text-xs text-text-faint">
                {nf1.format(consumo)} m³ · base {nf.format(tarifaBase)} + variable {nf.format(variable)} + fijo {nf.format(cargoFijo)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onGenerar({ consumoM3: consumo, total })}
            className="mt-6 flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
          >
            <Zap className="h-4 w-4" /> Generar cargo
          </button>
        </div>
      </div>
    </section>
  );
}
