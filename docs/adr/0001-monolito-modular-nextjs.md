# ADR-0001 — Estilo arquitectónico: monolito modular con Next.js App Router

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

El equipo de desarrollo es pequeño (3 personas) y no cuenta con un rol de DevOps dedicado. La plataforma debe gestionar múltiples dominios funcionales: landing, catálogo de juegos, ejecución de juegos, autenticación, perfiles de usuario, panel de administración y leaderboards. La estrategia de lanzamiento es gradual y el presupuesto inicial es cero, por lo que se necesita una solución que minimice la carga operativa y unifique el desarrollo.

Se evaluó el enfoque de separar frontend (SPA en React) y backend (API REST con Express/Fastify), pero esto implicaría mantener dos repositorios, dos despliegues, dos pipelines de CI/CD y gestionar CORS entre ambos, aumentando la complejidad para un equipo pequeño.

Next.js 14+ ofrece App Router con Server Components, API Routes integradas y despliegue nativo en Vercel, lo que permite construir frontend y backend en un mismo proyecto con un único despliegue. La arquitectura de monolitos modulares permite mantener la separación por dominios (features) dentro del mismo proyecto, evitando el acoplamiento sin añadir la sobrecarga operativa de microservicios.

## Decisión

Se adopta **Next.js 14+ con App Router** como framework único, estructurado como un **monolito modular** usando *package-by-feature* dentro de `src/`. La aplicación se despliega como una unidad en Vercel.

La estructura de directorios sigue este patrón:

```
src/
  app/                   # App Router pages y layouts
    (marketing)/         # Landing, about, contact
    (platform)/          # Dashboard, perfil, admin
      dashboard/
      perfil/
      admin/
    juegos/              # Catálogo y ejecución
      [slug]/            # Página individual + iframe
  components/            # Componentes compartidos (UI)
    ui/                  # Primitivos (Button, Card, Modal)
    layout/              # Header, Footer, Sidebar
  features/              # Módulos por feature
    auth/                # Store, hooks, componentes de auth
    games/               # Bridge, loader, registry
    leaderboard/         # Tabla de puntuaciones
    payments/            # (futuro)
  lib/                   # Utilidades, config, helpers
  server/                # Lógica de servidor (API)
    services/            # Servicios de negocio
    repositories/        # Acceso a datos (Prisma)
  stores/                # Zustand stores
  types/                 # Tipos compartidos
```

Cada carpeta dentro de `features/` encapsula su propia lógica: store de Zustand, hooks, componentes específicos y tipos. Las dependencias entre features se resuelven mediante interfaces y servicios, no mediante acceso directo a stores ajenas.

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Next.js App Router (monolito modular)** (elegida) | Un solo proyecto, un solo despliegue; Server Components para reducir JS del lado cliente; API Routes integradas; despliegue nativo en Vercel; estructura modular por features que facilita mantenibilidad. | Migrar a microservicios requeriría separar el monolito; el tamaño del bundle puede crecer si no se controlan las importaciones. |
| Next.js Pages Router | Probado y maduro; gran cantidad de ejemplos. | Legacy; no soporta Server Components; el sistema de layouts es menos flexible; el equipo prefiere la dirección futura de App Router. |
| Remix | Server-side rendering excelente; nested routes; formularios progresivos. | Ecosistema más pequeño que Next.js; menor integración con Vercel; menos familiaridad del equipo. |
| SPA (React/Vite) + API separada (Express) | Separación total de responsabilidades; frontend y backend escalan independientemente. | Dos repositorios, dos despliegues, dos pipelines; gestión de CORS; mayor complejidad operativa para un equipo pequeño; más costoso en hosting gratuito. |

## Consecuencias

### Positivas

- **Despliegue unitario:** un solo `git push` despliega frontend y API simultáneamente en Vercel, eliminando la coordinación entre equipos.
- **Server Components:** el 90 % de las páginas (landing, catálogo, dashboard) renderizan en servidor, reduciendo el JS enviado al cliente y mejorando el Largest Contentful Paint (LCP).
- **API Routes integradas:** las rutas de API (auth, juegos, leaderboard) viven en `src/app/api/` y comparten tipos con el frontend, eliminando la duplicación de interfaces.
- **Modularidad por features:** los límites entre dominios (auth, juegos, admin) están explícitos en la estructura de carpetas, facilitando que distintos miembros del equipo trabajen en paralelo sin pisarse.
- **Escalado horizontal:** Vercel replica la aplicación globalmente sin configuración adicional, alineado con el requisito de escalabilidad.
- **Zero DevOps:** no se gestionan servidores, balanceadores ni contenedores; Vercel maneja el escalado, los certificados TLS y los despliegues.

### Negativas / riesgos

- **Riesgo de acoplamiento interno:** con el tiempo los features pueden depender unos de otros directamente, erosionando la modularidad.
  - *Mitigación:* reglas de lint personalizadas (`import/no-restricted-paths`) que impidan que un feature importe directamente de otro; toda comunicación entre features debe pasar por servicios o stores tipadas.
- **Migración a microservicios difícil:** si en el futuro el feature de juegos requiere un escalado independiente (por ejemplo, WebSockets para juegos multijugador), habría que extraerlo.
  - *Mitigación:* mantener el feature de juegos auto-contenido con su propia store, hooks y tipos; la extracción a un servicio separado sería cuestión de mover la carpeta y crear un API Gateway.
- **Cold starts en Serverless Functions:** las API Routes en Vercel son funciones serverless; tras periodos de inactividad pueden tardar ~1 segundo en responder.
  - *Mitigación:* mantener una función *warm* con invocaciones programadas (cron) para rutas críticas; para juegos, el iframe carga estáticamente desde R2, no depende de serverless.

**Requisitos relacionados:** RNF-015 (mantenibilidad), RNF-016 (portabilidad), RNF-019 (escalabilidad), RNF-010 (disponibilidad), RNF-001 (tiempo de respuesta).
