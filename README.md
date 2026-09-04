# Nxord

> Plataforma de gestión hídrica — telemetría en tiempo real, con módulo opcional para APR (Agua Potable Rural).

**Nxord** (del nórdico *Njord*, dios del mar y las aguas) es una aplicación frontend que se conecta a una API de operación existente (ERP multi-sucursal con vertical hídrico) y la enriquece con una experiencia dedicada a telemetría: equipos, variables, graficación y alertas. No requiere backend propio.

## Mundos del producto

| | **Nxord** (core) | **Nxord + Módulo APR** |
|---|---|---|
| Qué es | Telemetría pura | Core + gestión de cobro para APR |
| Incluye | Dashboard en vivo, dispositivos, variables y graficación, alertas con acuse, multi-sucursal | Mediciones, tarificación (consumo → cargo → DTE → pago), documentos tributarios SII (39/33/61/56), cumplimiento DGA |
| Se vende | Por sí mismo | Como add-on activable sobre Nxord |

El módulo APR se activa desde la barra lateral de la app (persistido en `localStorage`); en producción puede derivarse del catálogo de módulos del plan de la sucursal.

## Stack

- **React 19 + TypeScript + Vite 7**
- **Tailwind CSS v3** + shadcn/ui
- TanStack Query · Framer Motion · GSAP (solo animaciones de entrada) · Recharts
- Sin backend: capa de datos propia (`src/lib/api/`) con fallback a datos demo

## Conexión a la API

La app consume una API externa tipo DRF con autenticación por token y contexto de sucursal por header:

```
Authorization: Token <key>
X-Branch-ID: <branch_id>
```

Configuración por variable de entorno:

```bash
# .env
VITE_YGGDRA_API_BASE=https://tu-api.ejemplo.cl/api
```

Si la API no está alcanzable (o no hay token), la app entra en **modo demo** con datos realistas (APR "Los Alerces", pozos, caudales, boletas SII, etc.) — útil para desarrollo y presentaciones.

Endpoints consumidos (prefijo `/api/`):

- `accounts/users/login_complete/` — login público
- `iot-telemetry/` — `devices/`, `variables/`, `readings/`, `readings/stats/`, `alert-rules/`, `alert-triggers/`
- `customers/clients/` — clientes APR
- `finance/` — `tax-documents/`, `payments/`
- `branches/` — sucursales

> Nota: el backend debe permitir el origen de Nxord en CORS (`CORS_ALLOWED_ORIGINS`) y el header `x-branch-id`.

## Desarrollo

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción (dist/)
npx tsc -b       # chequeo de tipos
```

## Estructura

```
src/
├── pages/
│   ├── Home.tsx            # Landing (Nxord core + Módulo APR)
│   ├── Login.tsx           # Acceso (Token auth, selector de sucursal, modo demo)
│   └── app/                # App: Dashboard, Dispositivos, Alertas, Apr, Tarificacion
├── components/
│   ├── app/                # AppShell, StatCard, StatusBadge, BranchSelector, RequireAprModule…
│   ├── dashboard/ dispositivos/ alertas/ apr/ tarificacion/
│   └── ui/                 # shadcn/ui
└── lib/
    ├── api/                # client.ts, types.ts, hooks.ts, demo.ts
    └── modules.ts          # Activación de módulos (APR on/off)
```

## Diseño

Identidad "runa del agua": sobriedad nórdica, function-first. Tema oscuro único, paleta neutra con acento verde-mar `#7FB6A4`, tipografía Inter con numerales tabulares para lecturas y montos. Scroll 100% nativo.

---

© Nxord — Hecho en Chile.
