import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const links = [
  { label: 'Telemetría', href: '#modulos' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Módulo APR', href: '#apr' },
  { label: 'Cumplimiento DGA', href: '#cumplimiento' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: scrolled ? '#0C0E10E6' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : undefined,
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/rune.svg" alt="Nxord" className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-[-0.02em] text-text">Nxord</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => goAnchor(e, l.href)}
              className="group relative text-sm text-text-muted transition-colors hover:text-text"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition-all hover:-translate-y-px hover:border-border-strong"
          >
            Iniciar sesión
          </Link>
          <a
            href="mailto:contacto@nxord.cl?subject=Demo%20Nxord"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
          >
            Solicitar demo
          </a>
        </div>
      </div>
    </motion.header>
  );
}
