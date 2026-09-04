import { Link } from 'react-router';

const modules = [
  { label: 'Telemetría en vivo', href: '/#modulos' },
  { label: 'Variables y graficación', href: '/#modulos' },
  { label: 'Alertas inteligentes', href: '/#modulos' },
  { label: 'Módulo APR (adicional)', href: '/#apr' },
  { label: 'Cumplimiento DGA', href: '/#cumplimiento' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-sunken">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/rune.svg" alt="" className="h-7 w-7" />
            <span className="text-lg font-semibold tracking-[-0.02em] text-text">Nxord</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            El agua, medida. La operación, en orden.
          </p>
        </div>

        <div>
          <p className="eyebrow">Módulos</p>
          <ul className="mt-4 space-y-2.5">
            {modules.map((m) => (
              <li key={m.label}>
                <a href={m.href} className="text-sm text-text-muted transition-colors hover:text-text">
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Producto</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/login" className="text-sm text-text-muted transition-colors hover:text-text">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <a href="mailto:contacto@nxord.cl?subject=Demo%20Nxord" className="text-sm text-text-muted transition-colors hover:text-text">
                Solicitar demo
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contacto</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="mailto:contacto@nxord.cl" className="text-sm text-text-muted transition-colors hover:text-text">
                contacto@nxord.cl
              </a>
            </li>
            <li className="text-sm text-text-faint">Hecho en Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 text-xs text-text-faint">
          <span>© 2025 Nxord</span>
          <span>Tema oscuro permanente</span>
        </div>
      </div>
    </footer>
  );
}
