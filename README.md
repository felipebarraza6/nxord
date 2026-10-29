# Nxord

## Qué es

Nxord es el cliente de telemetría hídrica y automatización de Ginnung. Muestra equipos, variables, gráficos y alertas en tiempo casi real, con un módulo opcional de APR (mediciones, tarifa, documentos y cumplimiento). No tiene backend propio: habla con la API Yggdra y, si no hay sesión o la API no responde, entra en modo demo.

## A quién sirve

Operadores de sistemas de agua que miran pozos, caudales y alertas, y comités APR que además cobran el consumo. El módulo APR se enciende desde la barra lateral y queda en `localStorage`. En producción puede salir del catálogo de módulos del plan de la sucursal.

## Stack

React 19, TypeScript, Vite 7, Tailwind CSS 3, shadcn/ui, TanStack Query, Framer Motion, GSAP, Recharts. No hay `package-lock.json` ni otro lockfile en la rama por defecto.

## Cómo correr en local

```bash
npm install
cp .env.example .env
npm run dev
```

Vite sirve el dev server local. `npm run build` deja el estático en `dist/`. `npx tsc -b` chequea tipos; no hay script `typecheck` en `package.json`.


## Variables de entorno

Solo nombres. Copia el ejemplo a un archivo local y completa los valores ahí. No los commitees ni los pegues en un issue.

| Nombre | Uso |
|--------|-----|
| `VITE_YGGDRA_API_BASE` | Base de la API, con `/api`. El ejemplo local apunta a `http://localhost:8000/api` |

Si la variable no está o la API no responde, la app usa datos demo (no llama a producción por defecto del código de demo).


## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Vite |
| `npm run build` | `tsc -b` y build de Vite |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualiza `dist/` |


## Deploy (como está hoy)

No hay workflow de deploy en `.github/workflows`. `docs/CONSUMERS.yaml` de la API marca el deploy de Nxord como `unknown` y el estado del consumidor como activo. Publicar un build es un paso manual fuera de este repo. Este documento no inventa un destino.


Este PR de documentación no cambia workflows, secretos ni el destino del deploy.

## Relación con la API Ginnung

Auth `Authorization: Token` y header `X-Branch-ID`.

Endpoints que usa el cliente, bajo `/api/`: `accounts/users/login_complete/`, `iot-telemetry/` (devices, variables, readings, stats, alert-rules, alert-triggers), `customers/clients/`, `finance/` (tax-documents, payments) y `branches/`.

El consumo es fetch manual (`style: manual` en el inventario). No hay `sync-contract` ni tipos generados desde OpenAPI. Para enganchar el chequeo de contrato haría falta el archivo de sha, el comando de sync y un `contract.yml`, como describe el documento del backend. Hoy no están.

La API tiene que permitir el origen de Nxord en `CORS_ALLOWED_ORIGINS` y el header `X-Branch-ID`.

Id de consumidor y etiqueta de issues de backend: `front:nxord`.


El chequeo reutilizable está en [docs/CONTRACT_CHECK.md](https://github.com/felipebarraza6/yggdra_infra/blob/main/docs/CONTRACT_CHECK.md) y en `.github/workflows/contract-check.yml` de `yggdra_infra`. Corre en el runner del VPS, compara el `schema_sha256` de `https://api.yggdra.cl/api/schema/contract/` con el sha commiteado en el front, regenera tipos desde el freeze de `api/schema/openapi.yaml` y exige `tsc --noEmit`.

En la rama por defecto de este repo **no hay** un workflow `contract.yml` que llame ese chequeo. El inventario `docs/CONSUMERS.yaml` del backend describe el estilo de consumo de cada app.

## Enlaces

- Arquitectura: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)
- Ejemplo de entorno: [.env.example](.env.example)
- API Ginnung: https://github.com/felipebarraza6/yggdra_infra
- Chequeo de contrato: https://github.com/felipebarraza6/yggdra_infra/blob/main/docs/CONTRACT_CHECK.md
- Inventario IoT del backend: https://github.com/felipebarraza6/yggdra_infra/blob/main/docs/iot_telemetry_front_inventory.md
