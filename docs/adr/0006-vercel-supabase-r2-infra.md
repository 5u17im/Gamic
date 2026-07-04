# ADR-0006 — Infraestructura de despliegue: Vercel + Supabase + Cloudflare R2

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

El equipo es pequeño (3 personas) sin DevOps dedicado, y la empresa opera con presupuesto inicial cero. La plataforma Gamic Games tiene tres componentes principales que deben desplegarse:

1. **Frontend + API:** Next.js App Router (ADR-001) con Server Components, API Routes y Server Actions.
2. **Base de datos:** PostgreSQL con Prisma ORM (ADR-003).
3. **Almacenamiento de assets:** Cloudflare R2 (ADR-005) para sprites, sonidos y builds de juegos.

Cada componente tiene requisitos de infraestructura diferentes: el frontend/API necesita una plataforma serverless optimizada para Next.js; la base de datos requiere PostgreSQL gestionado con backups automáticos; los assets necesitan almacenamiento de objetos con CDN global y egreso gratuito.

Se evaluaron opciones integradas (todo en Vercel, todo en Render, todo en Railway) y opciones separadas por capa. La decisión busca minimizar la complejidad operativa, mantener un tier gratuito funcional para el MVP y evitar el lock-in tecnológico.

## Decisión

Se adopta una estrategia **multi-proveedor por capa**:

| Capa | Proveedor | Servicio | Plan |
| --- | --- | --- | --- |
| Frontend + API | **Vercel** | Next.js hosting (Serverless Functions, Edge, ISR) | Hobby (gratuito) |
| Base de datos | **Supabase** | PostgreSQL gestionado | Free (500 MB, 2 conexiones activas) |
| Assets estáticos | **Cloudflare R2** | Almacenamiento de objetos + CDN | Free (10 GB, egreso ilimitado) |

```
Usuarios → Vercel (CDN + SSR)
              │
              ├── API Routes → Supabase (PostgreSQL)
              │
              └── Assets redirect → Cloudflare R2 (CDN)
```

El flujo de datos es:
1. El usuario accede a `matkii.vercel.app` — Vercel sirve el HTML/JS desde su edge network.
2. Las API Routes (`/api/*`) se ejecutan como Serverless Functions en Vercel y consultan Supabase.
3. Los assets de juegos se sirven directamente desde Cloudflare R2 mediante URLs públicas o prefirmadas.
4. Los builds de juegos se cargan en el iframe desde R2.

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Vercel + Supabase + R2** (elegida) | Cada capa en el proveedor óptimo: Vercel es la plataforma oficial de Next.js (despliegue optimizado, preview deployments, analytics); Supabase ofrece PostgreSQL gestionado con 500 MB gratis; R2 ofrece egreso ilimitado para assets. | Latencia entre proveedores si las regiones no están alineadas; gestión de tres paneles/dashboards distintos; cold starts en Vercel (serverless). |
| Todo en Vercel (Vercel + Neon DB) | Un solo proveedor, una sola factura; despliegue integrado; preview deployments que incluyen DB branch. | Neon DB en plan gratuito tiene limitaciones (7 días de historial, branch limitados); Vercel Blob para assets cobra egreso; menos flexible para escalar almacenamiento. |
| Todo en Render | Web service, PostgreSQL y Redis en un solo panel; plan gratuito con 750 horas/mes. | Render no está especializado en Next.js (no tiene optimizaciones serverless); el plan gratuito duerme el servicio tras 15 min de inactividad (cold starts más largos); no tiene CDN integrada; menos rendimiento frontend. |
| Railway | Despliegue simple; planes gratuitos generosos; PostgreSQL gestionado. | Menos probado para producción; menos documentación; el plan gratuito tiene 500 MB de RAM compartida; no tiene CDN propia. |

## Consecuencias

### Positivas

- **Cero costo operativo inicial:** los tres proveedores tienen tiers gratuitos funcionales que cubren el MVP. Vercel Hobby incluye 100 GB de ancho de banda, 6000 minutos de ejecución serverless y 100 preview deployments. Supabase Free ofrece 500 MB de PostgreSQL. R2 ofrece 10 GB de almacenamiento y egreso ilimitado.
- **Despliegue por git push:** los tres proveedores se integran con GitHub. `git push main` despliega automáticamente frontend/API en Vercel. No hay pipelines de CI/CD que mantener.
- **Cada capa es óptima:** Vercel para Next.js (Server Components, ISR, Edge Functions), Supabase para PostgreSQL (backups, dashboard SQL, autoscaling), R2 para assets (CDN, egreso gratis, API S3).
- **Portabilidad:** si un proveedor falla o cambia sus precios, se puede reemplazar sin afectar a los demás. Prisma es agnóstico al proveedor (misma URL de conexión), R2 usa API S3 (migrable a cualquier S3), Next.js se despliega en cualquier plataforma Node.
- **Preview deployments de Vercel:** cada PR genera una URL de preview con su propio entorno, facilitando las revisiones antes de fusionar.

### Negativas / riesgos

- **Latencia entre proveedores:** si Vercel sirve desde `us-east`, Supabase está en `us-east` y R2 usa la red global de Cloudflare, la latencia es aceptable (~5-15 ms). Pero si los data centers de los proveedores no coinciden, las consultas API → DB pueden tardar ~50-100 ms más.
  - *Mitigación:* desplegar Vercel y Supabase en la misma región (us-east). Cloudflare R2 no tiene concepto de región (es global), por lo que los assets se sirven desde el edge más cercano al usuario.
- **Cold starts en Vercel:** las Serverless Functions de Vercel pueden tardar ~1 segundo en responder si no han sido invocadas recientemente (el plan gratuito no mantiene instancias calientes).
  - *Mitigación:*
    - Las API Routes críticas (auth, carga de juegos) se mantienen calientes con un cron job que las invoca cada 5 minutos (usando Vercel Cron Jobs o un servicio externo como cron-job.org).
    - El build HTML del juego se sirve desde R2 como archivo estático, no depende de serverless.
    - Para producción, considerar el plan Pro ($20/mes) que elimina cold starts con funciones siempre activas.
- **Gestión de tres proveedores:** cada uno tiene su propio dashboard, sistema de autenticación, facturación y soporte.
  - *Mitigación:* documentar los procedimientos de cada proveedor (deployment, variables de entorno, monitoreo) en un único `ops/` manual. Mantener las variables de entorno centralizadas en `.env.local` para desarrollo y en Vercel Environment Variables para producción.
- **Límite de conexiones Supabase Free:** máximo 2 conexiones simultáneas a la base de datos, lo que puede causar errores con Prisma (que usa un pool de conexiones).
  - *Mitigación:* configurar `connection_limit=1` en la URL de conexión y usar Prisma con patrón Singleton. Para producción, actualizar a plan Pro ($25/mes) que ofrece 120 conexiones.

**Requisitos relacionados:** RNF-016 (portabilidad), RNF-010 (disponibilidad), RNF-001 (tiempo de respuesta), RNF-004 (tiempo de carga de assets), RNF-019 (escalabilidad).
