import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import {
  Radio,
  BellRing,
  Droplets,
  ReceiptText,
  ShieldCheck,
  Building2,
  ArrowDown,
  LineChart,
  Puzzle,
  UploadCloud,
  FileCheck2,
  Archive,
  Check,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------------- Hero: runa con entrada simple (sin efectos de scroll) ---------------- */
function HeroRune() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.from(el, { opacity: 0, scale: 0.92, duration: 0.9, ease: 'power2.out' });
    return () => {
      tween.kill();
    };
  }, []);
  return (
    <div ref={ref} className="relative">
      <div
        className="absolute inset-0 -m-16 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,182,164,0.05) 0%, transparent 70%)' }}
      />
      <img src="/rune.svg" alt="" className="relative h-[320px] w-[320px] opacity-90" />
    </div>
  );
}

/* ---------------- Contadores GSAP (aislado) ---------------- */
const metrics = [
  { value: 1.2, suffix: ' M', label: 'lecturas procesadas/mes', decimals: 1 },
  { value: 99.2, suffix: ' %', label: 'disponibilidad de telemetría', decimals: 1 },
  { value: 480, suffix: ' +', label: 'dispositivos monitoreados', decimals: 0 },
  { value: 37, suffix: '', label: 'sucursales operando', decimals: 0 },
];

function TrustBand() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nums = el.querySelectorAll<HTMLElement>('[data-count]');
    const ctx = gsap.context(() => {
      nums.forEach((n) => {
        const target = parseFloat(n.dataset.count ?? '0');
        const decimals = parseInt(n.dataset.decimals ?? '0', 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 70%', once: true },
          onUpdate: () => {
            n.textContent = obj.v.toFixed(decimals).replace('.', ',');
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="border-y border-border">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1200px] grid-cols-2 divide-x divide-border px-6 py-16 md:grid-cols-4"
      >
        {metrics.map((m, i) => (
          <div key={m.label} className={`px-8 ${i === 0 ? 'pl-0' : ''}`}>
            <div className="tabular text-[44px] font-medium leading-none text-text">
              <span data-count={m.value} data-decimals={m.decimals}>
                0
              </span>
              {m.suffix}
            </div>
            <p className="mt-2 text-[13px] text-text-muted">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Cómo funciona: sección pinned GSAP (aislado) ---------------- */
const steps = [
  { n: '01', title: 'Conecta', text: 'Nxord se enlaza a tu operación existente vía API; sin backend propio que mantener.' },
  { n: '02', title: 'Mide', text: 'Pozos, estanques y medidores reportan caudal, nivel y totalizadores.' },
  { n: '03', title: 'Visualiza', text: 'Cada variable se grafica en series históricas y en vivo, por equipo y sucursal.' },
  { n: '04', title: 'Alerta', text: 'Umbrales, desconexiones y tasas de cambio gatillan avisos con acuse de recibo.' },
];

function FlowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;
    const length = line.getTotalLength();
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);

    const ctx = gsap.context(() => {
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            nodeRefs.current.forEach((node, i) => {
              if (!node) return;
              gsap.to(node, { opacity: 1, scale: 1, duration: 0.5, delay: 0.35 * i, ease: 'power2.out' });
            });
          },
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="como-funciona" className="flex min-h-[100dvh] items-center py-32">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <p className="eyebrow">CÓMO FUNCIONA · NXORD CORE</p>
        <h2 className="mt-4 text-[44px] font-semibold leading-tight tracking-[-0.03em] text-text">
          Del terreno al tablero, en cuatro pasos.
        </h2>

        <div className="relative mt-24">
          <svg className="absolute left-0 top-3 w-full" height="2" aria-hidden>
            <path
              ref={lineRef}
              d="M 0 1 L 1148 1"
              stroke="var(--border-strong)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <div className="grid grid-cols-2 gap-y-16 md:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="relative px-4 transition-all duration-300"
                style={{ opacity: 0.3 }}
              >
                <div
                  className="absolute -top-[3px] left-4 h-2.5 w-2.5 rounded-full bg-accent"
                  style={{ boxShadow: '0 0 12px rgba(127,182,164,0.5)' }}
                />
                <p className="eyebrow mt-8">{s.n}</p>
                <h3 className="mt-2 text-xl font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Secciones con Framer Motion ---------------- */
const coreModules = [
  { icon: Radio, title: 'Telemetría en vivo', text: 'Dispositivos, variables, lecturas y estado online/offline en tiempo real.' },
  { icon: LineChart, title: 'Variables y graficación', text: 'Series históricas y en vivo por variable: caudal, nivel, presión y totalizadores.' },
  { icon: BellRing, title: 'Alertas inteligentes', text: 'Reglas por umbral, desconexión y tasa de cambio; severidades y acuse de recibo.' },
  { icon: Building2, title: 'Multi-sucursal', text: 'Cada cooperativa o comité opera en su propia sucursal, con datos aislados.' },
];

const aprModules = [
  { icon: Droplets, title: 'Mediciones APR', text: 'Clientes, medidores y consumos mensuales cruzados con la telemetría de la red.' },
  { icon: ReceiptText, title: 'Tarificación y cobro', text: 'Consumo medido → cargo calculado → documento tributario → pago. Cadena completa.' },
  { icon: FileCheck2, title: 'DTE al SII', text: 'Boletas 39, facturas 33, notas de crédito y débito emitidas electrónicamente.' },
  { icon: ShieldCheck, title: 'Cumplimiento DGA/SMA', text: 'Envío de mediciones, estándares MAYOR/MEDIO/MENOR y respaldos.' },
];

const heroWords = ['El', 'agua,', 'medida.', 'La', 'operación,', 'en', 'orden.'];

const heroStats = [
  { label: 'Caudal promedio', value: '12,4 L/s' },
  { label: 'Dispositivos online', value: '18/19' },
  { label: 'Alertas activas', value: '2' },
];

const chain = [
  { badge: 'Lectura', text: '18,3 m³', badgeColor: 'text-info border-border' },
  { badge: 'Cargo', text: '$ 14.820', badgeColor: 'text-warn border-border' },
  { badge: 'Boleta N° 000342', text: 'Emitida al SII', badgeColor: 'text-accent border-border' },
  { badge: 'Pagado', text: 'Transferencia · hoy', badgeColor: 'text-accent border-border', paid: true },
];

const compliance = [
  { icon: UploadCloud, title: 'Envío automático de mediciones DGA', text: 'Las lecturas se transmiten al regulador sin intervención manual.' },
  { icon: FileCheck2, title: 'Estándares MAYOR · MEDIO · MENOR', text: 'Soporta los tres niveles de exigencia según caudal autorizado.' },
  { icon: Archive, title: 'Respaldos y vouchers por envío', text: 'Cada transmisión queda con respaldo descargable y trazable.' },
];

export default function Home() {

  return (
    <div>
      {/* ============ HERO ============ */}
      <section id="hero" className="relative flex min-h-[100dvh] items-center overflow-hidden">
        <img
          src="/hero-texture.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(12,14,16,0.6)' }} />

        <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-12 items-center gap-8 px-6 py-32">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow">TELEMETRÍA HÍDRICA · TIEMPO REAL</p>
            <h1 className="mt-6 text-[64px] font-semibold leading-[1.05] tracking-[-0.03em] text-text">
              {heroWords.map((w, i) => (
                <motion.span
                  key={i}
                  className={`mr-[0.28em] inline-block ${w === 'medida.' ? 'text-accent' : ''}`}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mt-6 max-w-xl text-[17px] leading-relaxed text-text-muted"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            >
              Nxord es la plataforma de telemetría para redes hídricas: dispositivos, variables,
              lecturas graficadas y alertas, todo en un solo tablero en tiempo real. Y cuando tu
              APR lo necesite, activa el Módulo APR para tarificar y cobrar sobre esa misma data.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
            >
              <a
                href="mailto:contacto@nxord.cl?subject=Demo%20Nxord"
                className="rounded-md bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Solicitar demo
              </a>
              <a
                href="#modulos"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#modulos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-md border border-border px-6 py-3 text-[15px] font-medium text-text transition-all hover:-translate-y-0.5 hover:border-border-strong"
              >
                Ver módulos <ArrowDown className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          <div className="relative col-span-12 hidden justify-center lg:col-span-5 lg:flex">
            <HeroRune />
            {heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                className="absolute rounded-lg border border-border bg-bg-raised px-5 py-4"
                style={{
                  top: `${8 + i * 32}%`,
                  [i % 2 === 0 ? 'left' : 'right']: '-4%',
                } as React.CSSProperties}
                initial={{ y: 20, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.6 + i * 0.12 }}
              >
                <p className="eyebrow">{s.label}</p>
                <p className="tabular mt-1 text-2xl font-medium text-text">{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <svg width="2" height="48" aria-hidden>
            <line x1="1" y1="0" x2="1" y2="48" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="48" strokeDashoffset="48">
              <animate attributeName="stroke-dashoffset" values="48;0;48" dur="2s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>
      </section>

      {/* ============ BANDA DE CONFIANZA ============ */}
      <TrustBand />

      {/* ============ MÓDULOS ============ */}
      <section id="modulos" className="py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="eyebrow">NXORD · PLATAFORMA CORE</p>
          <h2 className="mt-4 max-w-2xl text-[44px] font-semibold leading-tight tracking-[-0.03em] text-text">
            Telemetría pura, vendible por sí misma.
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-text-muted">
            Nxord core entrega todo lo que una red hídrica necesita para medirse y gobernarse.
            Sin módulos extra, sin letra chica.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coreModules.map((m, i) => (
              <motion.div
                key={m.title}
                className="group rounded-lg border border-border bg-bg-raised p-8 transition-all duration-200 hover:-translate-y-1 hover:border-border-strong"
                initial={{ y: 32, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-25%' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              >
                <m.icon className="h-6 w-6 text-accent/70 transition-colors duration-200 group-hover:text-accent" strokeWidth={1.5} />
                <h3 className="mt-5 text-lg font-semibold text-text">{m.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{m.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Módulo APR — add-on destacado */}
          <motion.div
            className="relative mt-20 overflow-hidden rounded-lg border border-accent/40 bg-bg-sunken p-10 md:p-14"
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(127,182,164,0.06) 0%, transparent 60%)' }}
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent-dim px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  <Puzzle className="h-3.5 w-3.5" /> Módulo adicional
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-text-faint">
                  Se activa sobre Nxord · Nxord + APR
                </span>
              </div>
              <h3 className="mt-6 max-w-2xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-text">
                Módulo APR: tarificación y cobro para Agua Potable Rural.
              </h3>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted">
                Cuando tu comité o cooperativa necesita cobrar por el agua medida, el Módulo APR
                convierte las lecturas de Nxord en cargos, documentos tributarios y pagos — sin
                salir de la plataforma.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {aprModules.map((m, i) => (
                  <motion.div
                    key={m.title}
                    className="group rounded-lg border border-border bg-bg-raised p-6 transition-all duration-200 hover:-translate-y-1 hover:border-border-strong"
                    initial={{ y: 24, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: '-15%' }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  >
                    <m.icon className="h-5 w-5 text-accent/70 transition-colors duration-200 group-hover:text-accent" strokeWidth={1.5} />
                    <h4 className="mt-4 text-[15px] font-semibold text-text">{m.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{m.text}</p>
                  </motion.div>
                ))}
              </div>
              <a
                href="#apr"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#apr')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-10 inline-flex items-center gap-2 rounded-md border border-accent/50 px-5 py-2.5 text-sm font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent-dim"
              >
                Ver el Módulo APR en detalle <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <FlowSection />

      {/* ============ APR / TARIFICACIÓN ============ */}
      <section id="apr" className="bg-bg-sunken py-32">
        <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent-dim px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <Puzzle className="h-3.5 w-3.5" /> Módulo adicional
            </span>
            <p className="eyebrow mt-5">MÓDULO APR · TARIFICACIÓN</p>
            <h2 className="mt-4 text-[44px] font-semibold leading-tight tracking-[-0.03em] text-text">
              Del medidor a la boleta, sin planillas.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-text-muted">
              <p>
                El consumo medido (TOTAL mensual de cada medidor) se transforma en cargo según
                tramo y tarifa del comité. El Módulo APR emite el documento tributario electrónico
                correspondiente — boleta 39, factura 33, notas de crédito y débito — y registra
                el pago con su conciliación.
              </p>
              <p>
                Clientes con RUT, dirección y comuna; cobros recurrentes por contrato; historial
                completo por medidor. Todo cruzado con la telemetría de la red.
              </p>
            </div>
          </div>

          <div className="relative space-y-0">
            {chain.map((c, i) => (
              <motion.div
                key={c.badge}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-20%' }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
              >
                <div className="flex items-center justify-between rounded-lg border border-border bg-bg-raised px-6 py-5 transition-transform duration-200 hover:translate-x-1">
                  <div>
                    <p className="text-sm font-semibold text-text">{c.badge}</p>
                    <p className="tabular mt-0.5 text-[13px] text-text-muted">{c.text}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.badgeColor}`}>
                    {c.paid && <Check className="h-3 w-3" />}
                    {i === 0 ? 'Medido' : i === 1 ? 'Calculado' : i === 2 ? 'DTE' : 'Pagado'}
                  </span>
                </div>
                {i < chain.length - 1 && (
                  <motion.div
                    className="mx-auto h-8 w-px bg-border-strong"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.15 + 0.3 }}
                    style={{ transformOrigin: 'top' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CUMPLIMIENTO DGA ============ */}
      <section id="cumplimiento" className="border-y border-border py-24">
        <div className="mx-auto max-w-[1200px] px-6 pb-12">
          <p className="eyebrow">DENTRO DEL MÓDULO APR · CUMPLIMIENTO</p>
          <h2 className="mt-4 max-w-2xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-text">
            Cumplimiento DGA, integrado a la operación APR.
          </h2>
        </div>
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-3">
          {compliance.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-30%' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
            >
              <c.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h3 className="mt-4 text-[17px] font-semibold text-text">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ MANIFIESTO / NOMBRE ============ */}
      <section className="py-32">
        <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <img
              src="/fjord.jpg" loading="lazy" decoding="async"
              alt="Fiordo nórdico nocturno"
              className="w-full rounded-lg border border-border object-cover"
            />
          </motion.div>
          <div>
            <p className="eyebrow">EL NOMBRE</p>
            <h3 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-text">
              {'Njord, dios del mar y las aguas.'.split(' ').map((w, i) => (
                <motion.span
                  key={i}
                  className="mr-[0.28em] inline-block"
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                >
                  {w}
                </motion.span>
              ))}
            </h3>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-text-muted">
              Nxord toma su nombre de la deidad nórdica de los mares y la navegación. Porque el
              agua que se mide, se gobierna: cada litro contado es una decisión mejor tomada.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative overflow-hidden border-t border-border py-32">
        <img
          src="/hero-texture.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(12,14,16,0.7)' }} />
        <motion.div
          className="relative mx-auto max-w-[1200px] px-6 text-center"
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <motion.img
            src="/rune.svg"
            alt=""
            className="mx-auto h-16 w-16"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="mt-8 text-[56px] font-semibold leading-tight tracking-[-0.03em] text-text">
            Pon tu agua en orden.
          </h2>
          <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center rounded-lg border border-border bg-bg-raised p-8">
              <p className="eyebrow">NXORD</p>
              <h3 className="mt-3 text-xl font-semibold text-text">Telemetría</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Dispositivos, variables, graficación y alertas. La plataforma core, completa por
                sí misma.
              </p>
              <a
                href="mailto:contacto@nxord.cl?subject=Demo%20Nxord"
                className="mt-6 rounded-md bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Solicitar demo de Nxord
              </a>
            </div>
            <div className="relative flex flex-col items-center rounded-lg border border-accent/50 bg-bg-raised p-8">
              <span className="absolute -top-3 rounded-full border border-accent/50 bg-accent-dim px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Módulo adicional
              </span>
              <p className="eyebrow">NXORD + MÓDULO APR</p>
              <h3 className="mt-3 text-xl font-semibold text-text">Telemetría + cobro APR</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Todo Nxord, más mediciones cruzadas, tarificación, DTE al SII y cumplimiento DGA.
              </p>
              <a
                href="mailto:contacto@nxord.cl?subject=Demo%20Nxord%20%2B%20M%C3%B3dulo%20APR"
                className="mt-6 rounded-md border border-accent/50 px-6 py-3 text-[15px] font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent-dim"
              >
                Solicitar demo Nxord + APR
              </a>
            </div>
          </div>
          <div className="mt-10">
            <Link
              to="/login"
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              ¿Ya tienes cuenta? Iniciar sesión →
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
