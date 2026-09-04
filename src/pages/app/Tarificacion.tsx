// Nxord — App · Tarificación (/app/tarificacion)
import { useState } from 'react';
import type { TaxDocument } from '@/lib/api/types';
import Stepper from '@/components/tarificacion/Stepper';
import type { EtapaId } from '@/components/tarificacion/Stepper';
import Simulador from '@/components/tarificacion/Simulador';
import Cargos, { useCargos } from '@/components/tarificacion/Cargos';
import Documentos from '@/components/tarificacion/Documentos';
import Pagos from '@/components/tarificacion/Pagos';
import { ToastHost, useToast } from '@/components/apr/ui';

export default function Tarificacion() {
  const [etapa, setEtapa] = useState<EtapaId>('cargo');
  const [cargos, setCargos] = useCargos();
  const { toasts, push } = useToast();

  const generarCargo = (c: { consumoM3: number; total: number }) => {
    setCargos((prev) => [
      ...prev,
      {
        id: 9000 + prev.length,
        cliente: 'Cargo simulado — cliente demo',
        rut: '77.777.777-7',
        consumoM3: c.consumoM3,
        monto: c.total,
        estado: 'calculado',
        flash: true,
      },
    ]);
    push(`Cargo generado por ${c.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}`);
  };

  const emitirDte = (id: number) => {
    setCargos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: 'emitido', flash: true } : c)),
    );
    push('DTE emitido y enviado al SII (simulado)');
    setTimeout(() => {
      setCargos((prev) => prev.map((c) => (c.id === id ? { ...c, flash: false } : c)));
    }, 1200);
  };

  const pagarDocumento = (d: TaxDocument) => {
    push(`Pago registrado para ${d.client_name} — ${folioSafe(d.folio)} (simulado)`);
  };

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-text">Tarificación</h1>
      <p className="mt-2 text-[15px] text-text-muted">
        Consumo medido → cargo calculado → documento tributario (DTE SII) → pago.
      </p>

      <div className="mt-8">
        <Stepper activa={etapa} onSelect={setEtapa} />
      </div>

      <div className="mt-8">
        <Simulador onGenerar={generarCargo} />
      </div>

      <div className="mt-10">
        <Cargos cargos={cargos} onEmitir={emitirDte} />
      </div>

      <div className="mt-10">
        <Documentos onPagar={pagarDocumento} onGenerarCargos={() => setEtapa('medicion')} />
      </div>

      <div className="mt-10">
        <Pagos />
      </div>

      <ToastHost toasts={toasts} />
    </div>
  );
}

function folioSafe(n: number): string {
  return `N° ${String(n).padStart(6, '0')}`;
}
