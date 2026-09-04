import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState';
import { useModules } from '@/lib/modules';

interface RequireAprModuleProps {
  children: ReactNode;
}

/**
 * Guard del módulo Nxord APR. Si el módulo está desactivado,
 * muestra una vista de activación en lugar del contenido.
 */
export default function RequireAprModule({ children }: RequireAprModuleProps) {
  const { aprEnabled, toggleApr } = useModules();

  if (!aprEnabled) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <EmptyState
          title="Módulo APR no activado"
          description="Nxord APR agrega la gestión de cobro y tarificación a tu telemetría: mediciones, tarificación, DTE, pagos y cumplimiento DGA. Actívalo para usar esta sección."
          ctaLabel="Activar módulo"
          onCta={toggleApr}
        />
      </motion.div>
    );
  }

  return <>{children}</>;
}
