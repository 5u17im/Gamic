# Registro de Decisiones de Arquitectura (ADR)

## Gamic Games Platform

| Campo | Detalle |
| --- | --- |
| **Documento** | Registro de Decisiones de Arquitectura (Architecture Decision Records) |
| **Versión** | 1.0 |
| **Fecha** | Julio 2026 |
| **Empresa** | Nothing Sense |
| **Autor / CTO** | Steven Ricardo Quiñones |
| **Formato** | MADR (Markdown Architectural Decision Records) |

## Resumen del stack tecnológico

| Capa / Aspecto | Tecnología / Herramienta | ADR |
| --- | --- | --- |
| Framework principal | Next.js 14+ App Router (monolito modular) | ADR-001 |
| Motor de juegos | Canvas 2D API + TypeScript | ADR-002 |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM | ADR-003 |
| Estado global | Zustand con slices | ADR-004 |
| Almacenamiento assets | Cloudflare R2 (compatible S3) | ADR-005 |
| Infraestructura | Vercel + Supabase + Cloudflare R2 | ADR-006 |
| Autenticación | NextAuth.js v5 (Auth.js) + Prisma adapter | ADR-007 |
| Empaquetado móvil | Capacitor 6 | ADR-008 |
| Comunicación juegos | postMessage + iframe (GameBridge) | ADR-009 |
| Carga bajo demanda | next/dynamic + lazy loading + prefetch | ADR-010 |

## Índice de decisiones

| ID | Decisión | Estado |
| --- | --- | --- |
| [ADR-001](0001-monolito-modular-nextjs.md) | Estilo arquitectónico: monolito modular con Next.js App Router | Aceptada |
| [ADR-002](0002-canvas-api-typescript.md) | Motor de juegos: Canvas 2D API + TypeScript | Aceptada |
| [ADR-003](0003-postgresql-prisma-orm.md) | Base de datos: PostgreSQL + Prisma ORM | Aceptada |
| [ADR-004](0004-zustand-estado-global.md) | Estado global: Zustand con slices | Aceptada |
| [ADR-005](0005-cloudflare-r2-assets.md) | Almacenamiento de assets: Cloudflare R2 | Aceptada |
| [ADR-006](0006-vercel-supabase-r2-infra.md) | Infraestructura: Vercel + Supabase + Cloudflare R2 | Aceptada |
| [ADR-007](0007-nextauth-autenticacion.md) | Autenticación: NextAuth.js v5 | Aceptada |
| [ADR-008](0008-capacitor-empaquetado-movil.md) | Empaquetado móvil: Capacitor 6 | Aceptada |
| [ADR-009](0009-gamebridge-postmessage-iframe.md) | Comunicación juegos: postMessage + iframe | Aceptada |
| [ADR-010](0010-lazy-loading-dynamic-imports.md) | Carga bajo demanda: lazy loading + dynamic imports | Aceptada |

## Leyenda de estados

| Estado | Significado |
| --- | --- |
| **Aceptada** | Decisión vigente y en aplicación |
| **Propuesta** | En discusión, aún no adoptada |
| **Rechazada** | Evaluada y descartada |
| **Obsoleta** | Ya no aplica |
| **Reemplazada** | Sustituida por otra ADR |

## Convención

Este documento es la **fuente de verdad** del stack tecnológico de Gamic Games Platform. Cualquier cambio futuro se registra como una nueva ADR; las decisiones anteriores no se borran, sino que se marcan como *Obsoleta* o *Reemplazada*.
