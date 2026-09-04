import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout de la landing (children pattern — App envuelve <Routes> con <Layout>).
 * Navbar es sticky (flujo normal): las páginas no compensan altura.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
