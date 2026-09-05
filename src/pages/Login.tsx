import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Droplets, ReceiptText, ShieldCheck, ChevronDown } from 'lucide-react';
import { API_BASE, BRANCH_KEY, TOKEN_KEY, login } from '@/lib/api/client';

const BRANCHES = [
  { id: '1', label: 'APR Los Alerces — Pucón' },
  { id: '2', label: 'APR Río Frío — Lanco' },
  { id: '3', label: 'Comité de Agua Traful — Villarrica' },
];

const bullets = [
  { icon: Droplets, label: 'Telemetría en vivo' },
  { icon: ReceiptText, label: 'Tarificación APR' },
  { icon: ShieldCheck, label: 'Cumplimiento DGA' },
];

type ConnState = 'checking' | 'online' | 'demo';

function startDemoSession(branchId: string) {
  localStorage.setItem(TOKEN_KEY, 'demo-token');
  localStorage.setItem(BRANCH_KEY, branchId);
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [conn, setConn] = useState<ConnState>('checking');
  const [toast, setToast] = useState<string | null>(null);

  // Estado de conexión con la API
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetch(`${API_BASE.replace(/\/$/, '')}/`, { signal: controller.signal })
      .then(() => { if (!cancelled) setConn('online'); })
      .catch(() => { if (!cancelled) setConn('demo'); })
      .finally(() => clearTimeout(timer));
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, []);

  // Sesión ya iniciada → /app
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) navigate('/app', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const fail = (msg: string) => {
      setError(msg);
      setShake((s) => s + 1);
      setLoading(false);
    };

    try {
      const res = await login(email, password);
      const token = res?.token;
      if (!token) {
        fail('Respuesta inesperada del servidor. Intenta nuevamente.');
        return;
      }
      if (!remember) {
        // sesión solo en memoria de pestaña: guardamos igual, pero se limpia al cerrar
        sessionStorage.setItem('nxord.session_only', '1');
      }
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(BRANCH_KEY, branchId);
      navigate('/app', { replace: true });
    } catch (err) {
      const status = (err as { status?: number }).status;
      // Error de red / API no alcanzable → modo demo
      if (status === undefined) {
        startDemoSession(branchId);
        setConn('demo');
        setToast('Sesión demo iniciada');
        setTimeout(() => navigate('/app', { replace: true }), 600);
        return;
      }
      if (status === 400 || status === 401) {
        fail('Credenciales inválidas. Revisa tu usuario y contraseña.');
      } else {
        fail(`No pudimos iniciar sesión (error ${status}). Intenta más tarde.`);
      }
    }
  };

  const inputCls =
    'h-11 w-full rounded-lg border border-border bg-bg px-3.5 text-sm text-text placeholder:text-text-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim';
  const labelCls = 'mb-1.5 block text-[13px] font-medium text-text-muted';

  return (
    <div className="grid min-h-[100dvh] bg-bg lg:grid-cols-2">
      {/* Panel de marca */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex"
      >
        <img
          src="/hero-texture.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0C0E10_100%)]" />

        <motion.div
          initial={{ scale: 0.9, filter: 'blur(8px)', opacity: 0 }}
          animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <Link to="/" className="flex items-center gap-3">
            <img src="/rune.svg" alt="Nxord" className="h-16 w-16" />
            <span className="text-2xl font-semibold tracking-[-0.02em] text-text">Nxord</span>
          </Link>
        </motion.div>

        <div className="relative">
          <p className="max-w-sm text-xl font-medium leading-snug tracking-[-0.02em] text-text">
            Gestión hídrica de precisión — del medidor a la boleta.
          </p>
          <ul className="mt-10 space-y-4">
            {bullets.map((b) => (
              <li key={b.label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-raised">
                  <b.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
                </span>
                <span className="text-sm text-text-muted">{b.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.aside>

      {/* Panel de acceso */}
      <main className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="w-full max-w-[400px]"
        >
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/rune.svg" alt="Nxord" className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-[-0.02em] text-text">Nxord</span>
          </Link>

          <motion.div
            key={shake}
            animate={shake > 0 ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
            transition={{ duration: 0.35 }}
            className="rounded-lg border border-border bg-bg-raised p-10"
          >
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-text">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-text-muted">Usa tus credenciales de la operación.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className={labelCls}>Correo o usuario</label>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="demo@nxord.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelCls}>Contraseña</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint transition-colors hover:text-text-muted"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="branch" className={labelCls}>Sucursal</label>
                <div className="relative">
                  <select
                    id="branch"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-bg accent-[#7FB6A4]"
                  />
                  <span className="text-[13px] text-text-muted">Recordar sesión</span>
                </label>
                <a
                  href="mailto:contacto@nxord.cl?subject=Recuperar%20contrase%C3%B1a"
                  className="text-[13px] text-accent hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <div className="rounded-lg border border-danger/50 bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-accent text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <img src="/rune.svg" alt="" className="h-5 w-5 animate-spin [animation-duration:1.4s]" />
                    Conectando…
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center gap-2">
                <span
                  className={
                    conn === 'online'
                      ? 'h-1.5 w-1.5 rounded-full bg-accent'
                      : conn === 'demo'
                        ? 'h-1.5 w-1.5 rounded-full bg-warn'
                        : 'h-1.5 w-1.5 animate-pulse rounded-full bg-text-faint'
                  }
                />
                <span className="text-xs text-text-muted">
                  {conn === 'online'
                    ? 'Conectado a la API'
                    : conn === 'demo'
                      ? 'Modo demo — API no alcanzable'
                      : 'Verificando conexión…'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-faint">
                Credenciales demo: <span className="tabular text-text-muted">demo@nxord.cl / demo1234</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-border border-l-2 border-l-accent bg-bg-raised px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-sm text-text">{toast}</span>
        </motion.div>
      )}
    </div>
  );
}
