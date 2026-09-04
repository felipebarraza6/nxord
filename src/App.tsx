import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import AppShell from './components/app/AppShell';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/app/Dashboard';
import Dispositivos from './pages/app/Dispositivos';
import Alertas from './pages/app/Alertas';
import Apr from './pages/app/Apr';
import Tarificacion from './pages/app/Tarificacion';
import RequireAprModule from './components/app/RequireAprModule';

export default function App() {
  return (
    <Routes>
      {/* Landing: Layout en patrón children */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />

      {/* App: AppShell en patrón rutas anidadas (Outlet) */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="dispositivos" element={<Dispositivos />} />
        <Route path="alertas" element={<Alertas />} />
        <Route
          path="apr"
          element={
            <RequireAprModule>
              <Apr />
            </RequireAprModule>
          }
        />
        <Route
          path="tarificacion"
          element={
            <RequireAprModule>
              <Tarificacion />
            </RequireAprModule>
          }
        />
      </Route>
    </Routes>
  );
}
