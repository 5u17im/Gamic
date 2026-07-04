# Plan Maestro — Gamic Games Platform

> Plataforma de minijuegos tipo Friv con juegos originales y completos
>
> **Versión:** 1.0 | **Fecha:** Julio 2026
> **Empresa:** Nothing Sense (En formación)
> **Proyecto raíz:** Gamingweb

---

## Índice

1. [Visión General del Producto](#1-visión-general-del-producto)
2. [Formato de UI y Design System](#2-formato-de-ui-y-design-system)
3. [Categorías y Tipos de Juegos](#3-categorías-y-tipos-de-juegos)
4. [Stack Técnico y Arquitectura Base](#4-stack-técnico-y-arquitectura-base)
5. [Plan de Creación del ERS](#5-plan-de-creación-del-ers)
6. [Plan de Creación del ADR](#6-plan-de-creación-del-adr)
7. [Roadmap de Sprints y Asignación de Roles](#7-roadmap-de-sprints-y-asignación-de-roles)

---

## 1. Visión General del Producto

### 1.1 ¿Qué es Gamic Games?

Una plataforma web de minijuegos tipo **Friv**, **CoolMathGames** y **Kongregate**, pero con juegos **completos y originales** desarrollados internamente. Cada juego es un título con entidad propia: mecánicas pulidas, progresión, puntuaciones y rejugabilidad.

### 1.2 Propósito

Ofrecer un catálogo creciente de juegos casuales de calidad, accesibles desde cualquier navegador (web) y como app móvil (Capacitor), con un sistema de perfiles, logros, rachas y rankings que fidelice a los jugadores.

### 1.3 Diferenciadores clave

| Aspecto | Gamic | Friv |
|---|---|---|
| Juegos | Originales, desarrollados internamente | Embed de terceros |
| Calidad | Controlada, mismo estándar | Variable |
| Persistencia | Perfiles, logros, rachas, rankings globales | Sin persistencia |
| Monetización | No invasiva (sin pay-to-win) | Publicidad externa |
| Mobile | App nativa con Capacitor | Solo web |

---

## 2. Formato de UI y Design System

### 2.1 Identidad Visual

- **Personalidad:** Amigable, juguetona pero madura — sin infantilizar, sin ciberpunk genérico.
- **Tono visual:** Colores cálidos con acentos vibrantes controlados. Fondos claros con detalles sutiles. Tarjetas con contenido como protagonista.
- **Diferenciador:** Bordes redondeados generosos (12px), sombras suaves, microinteracciones con bounce leve.

### 2.2 Paleta de Colores

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#6C5CE7` | Acciones principales, links, botón primario |
| `--color-primary-hover` | `#5A4BD1` | Hover de primary |
| `--color-secondary` | `#FD7E14` | Badges, acentos cálidos, estrellas |
| `--color-accent` | `#00CEC9` | Confirmaciones, score verde |
| `--color-bg` | `#F8F9FA` | Fondo principal de página |
| `--color-surface` | `#FFFFFF` | Cards, modales, paneles |
| `--color-text-primary` | `#1A1A2E` | Títulos y cuerpo principal |
| `--color-text-secondary` | `#6C757D` | Metadatos, descripciones |
| `--color-border` | `#DEE2E6` | Bordes de componentes |
| `--color-danger` | `#E74C3C` | Errores, eliminación |
| `--color-score-gold` | `#FFD700` | Score alto |

### 2.3 Tipografía

| Propiedad | Valor |
|---|---|
| Font headings | `"Plus Jakarta Sans", system-ui, sans-serif` |
| Font body | `"Inter", system-ui, sans-serif` |
| Font mono (scores) | `"JetBrains Mono", monospace` |
| Base size | `16px` (1rem) |
| Scale | `1.25` (Major Third) |

### 2.4 Componentes Reutilizables

#### GameCard
```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │  Thumbnail (16:9)    │ │ ← lazy load, overlay play en hover
│ └──────────────────────┘ │
│ Título del juego         │ ← text-base, weight 600
│ Categoría · ⭐ 4.5       │ ← text-sm, color-text-secondary
│ [▶ Jugar rápido]         │ ← botón ghost, visible siempre
└──────────────────────────┘
```

**Estados:** default (shadow-card), hover (translateY(-4px) + shadow-lg), focus-visible (outline primary), loading (skeleton shimmer), disabled (opacity 0.5).

#### GameGrid
Grid responsivo con CSS Grid `auto-fill, minmax(280px, 1fr)`:
- Mobile < 480px: 1 columna
- Tablet 480-768px: 2 columnas
- Desktop 768-1024px: 3 columnas
- Desktop 1024-1440px: 4 columnas
- > 1440px: 5 columnas

#### Otros componentes
- **Header/Nav:** Sticky con backdrop-filter blur, logo + search + categorías + user menu. Mobile: hamburguesa.
- **CategoryFilter:** Pills horizontales scrolleables, active con bg primary.
- **SearchBar:** Input con icono de lupa, debounce 300ms, dropdown resultados en vivo.
- **Scoreboard:** Tabla con #, jugador, puntuación, tiempo. Highlight al usuario actual.
- **UserMenu:** Dropdown (desktop) o slide-in panel (mobile) con perfil, logros, favoritos, cerrar sesión.

### 2.5 Pantallas Principales

| Código | Pantalla | Descripción |
|---|---|---|
| **IU-01** | Landing / Home | Hero + categorías pills + secciones (destacados, nuevos, populares) |
| **IU-02** | Categorías | Grid de iconos de categoría + filtros + resultados paginados |
| **IU-03** | Juego individual | Canvas + toolbar + sidebar scoreboard + descripción |
| **IU-04** | Perfil de jugador | Avatar, XP, estadísticas, logros, historial |
| **IU-05** | Ranking global | Tabla combinada todos los juegos, paginada |
| **IU-06** | Administración | CRUD juegos, categorías, usuarios |
| **IU-07** | Login / Registro | Formularios con OAuth (Google, GitHub) |
| **IU-08** | Próximamente | Juegos en desarrollo con barra de progreso |

### 2.6 Accesibilidad (WCAG 2.1 AA)

- Contraste mínimo 4.5:1 (verificado en paleta)
- Tamaño táctil mínimo 48x48px en todos los elementos interactivos
- Focus-visible visible con outline 2px solid primary
- Skip to content link
- ARIA labels en iconos sin texto
- `prefers-reduced-motion: reduce` desactiva animaciones
- Soporte `prefers-color-scheme: dark`

---

## 3. Categorías y Tipos de Juegos

### 3.1 Categorías

| Categoría | Icono | Descripción |
|---|---|---|
| **Arcade / Acción** | 🎯 | Reflejos rápidos, puntuaciones altas, partidas cortas |
| **Puzzle / Lógica** | 🧩 | Resolución de problemas, patrones, pensamiento lateral |
| **Estrategia** | 🧠 | Planeación, gestión de recursos, decisiones tácticas |
| **Habilidad / Precisión** | 🎮 | Coordinación ojo-mano, timing, puntería |
| **Aventura / Plataformas** | 🗺️ | Exploración, saltos, niveles progresivos |
| **Deportes / Competición** | ⚽ | VS CPU, récords, torneos locales |
| **Cartas / Tablero** | 🃏 | Juegos de mesa clásicos adaptados, memory, solitario |
| **Educativos / Matemáticos** | 📐 | Cálculo mental, trivia, aprendizaje lúdico |

### 3.2 Juegos Priorizados para MVP (5 juegos)

| # | Juego | Categoría | Mecánica Principal | Complejidad |
|---|---|---|---|---|
| 1 | **Hex Merge** | Puzzle | Tablero hexagonal, fusionar 3+ fichas del mismo color | Baja |
| 2 | **Asteroid Sweep** | Arcade | Nave que rota/dispara, esquivar y destruir asteroides | Media |
| 3 | **Pivot** | Habilidad | Plataforma giratoria, bola que cae, esquivar obstáculos | Baja |
| 4 | **Quick Math** | Educativo | Operaciones matemáticas contra reloj, dificultad progresiva | Baja |
| 5 | **Flip Tactics** | Cartas | Memory con habilidades especiales al acertar pares | Media |

### 3.3 Juegos Post-MVP (Roadmap a 12 meses)

| Juego | Categoría | Complejidad | ETA estimado |
|---|---|---|---|
| Space Drift 2 | Arcade | Alta | Mes 4 |
| Farm Tycoon | Estrategia | Media | Mes 5 |
| Word Storm | Puzzle | Baja | Mes 5 |
| Cyber Heist | Aventura | Alta | Mes 7 |
| Match Arena | Puzzle | Baja | Mes 7 |
| Tower Rush | Estrategia | Media | Mes 9 |
| Rhythm Taps | Habilidad | Media | Mes 10 |
| Paint Clash | Puzzle | Baja | Mes 11 |
| Mini Golf Pro | Deportes | Alta | Mes 12 |

### 3.4 Sistema de Progresión

- **Puntuaciones altas:** Locales (no registrados) y globales (registrados)
- **Logros:** Desbloqueables por hitos (puntuación, racha, partidas jugadas)
- **Rachas diarias:** Bonus acumulativo (5%-25%) por jugar días consecutivos
- **Sin pay-to-win:** Sin compras que den ventaja competitiva
- **Publicidad:** Solo entre partidas, nunca durante

---

## 4. Stack Técnico y Arquitectura Base

### 4.1 Stack Técnico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion | SSR/SSG híbrido, SEO, tipado fuerte, animaciones |
| **Backend** | Next.js API Routes | Código compartido frontend/backend, despliegue unificado |
| **Base de datos** | PostgreSQL + Prisma ORM | ACID, migraciones type-safe, DX superior |
| **Almacenamiento** | Cloudflare R2 | S3-compatible, egreso gratuito, CDN edge |
| **Autenticación** | NextAuth.js (Auth.js) | Integración nativa Next.js, múltiples providers |
| **Estado global** | Zustand | Minimalista, persist middleware, ~1 KB |
| **Mobile** | Capacitor 6 | Mismo código web, acceso a APIs nativas |
| **Testing** | Vitest + Playwright | Rápido, compatible con Vite/Next.js |
| **Despliegue** | Vercel + Supabase + Cloudflare R2 | Optimizado, gratuito para MVP |

### 4.2 Estructura de Carpetas

```
matkii/
├── src/
│   ├── app/                    # App Router (rutas)
│   │   ├── (auth)/             # login, register
│   │   ├── (dashboard)/        # home, perfil
│   │   ├── game/[slug]/        # página individual de juego
│   │   ├── categories/         # listado de categorías
│   │   └── admin/              # panel de administración
│   ├── components/
│   │   ├── ui/                 # primitivos (Button, Card, Input, Modal)
│   │   ├── games/              # GameCard, GameGrid, GameIframe
│   │   └── layout/             # Header, Footer, Sidebar, Navbar
│   ├── games/                  # MOTOR DE JUEGOS
│   │   ├── engine/             # GameBridge, GameLoop, InputManager
│   │   └── [game-id]/          # cada juego es un paquete independiente
│   │       ├── index.ts        # punto de entrada (init/update/render/cleanup)
│   │       ├── game.ts         # lógica principal
│   │       ├── assets/         # sprites, audios
│   │       └── types.ts
│   ├── lib/
│   │   ├── db.ts               # cliente Prisma singleton
│   │   ├── auth.ts             # configuración NextAuth.js
│   │   ├── game-bridge.ts      # API comunicación plataforma ↔ juego
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useGame.ts          # carga lazy vía dynamic import
│   │   ├── useScore.ts         # envío/recepción de puntuaciones
│   │   └── useLocalStorage.ts
│   └── types/
│       ├── game.ts             # tipos compartidos
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── public/games/               # assets estáticos (CDN)
```

### 4.3 Motor de Juegos (Game Engine)

**Interfaz común:**
```typescript
interface GameEngine {
  init(config: GameConfig): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  cleanup(): void;
}
```

**GameBridge (comunicación plataforma ↔ juego):**
```typescript
interface GameBridge {
  postScore(score: number): Promise<void>;
  gameOver(finalScore: number): void;
  pause(): void;
  resume(): void;
  getConfig(): GameConfig;
  onAchievement(achievementId: string): void;
}
```

**Flujo de carga:**
1. Usuario navega a `/game/[slug]`
2. `useGame(slug)` ejecuta `dynamic(() => import('@/games/[slug]'))`
3. El módulo exporta `{ init, update, render, cleanup }`; GameBridge se inyecta en `init(config)`
4. Se inicia `requestAnimationFrame` loop aislado
5. Al desmontar: `cleanup()` + cancelar loop

**Aislamiento:**
- Por defecto: Canvas 2D dentro del mismo contexto con GameBridge
- Opcional: iframe sandboxed con postMessage para juegos que requieran aislamiento total

### 4.4 Base de Datos — Schema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  image     String?
  nickname  String   @unique
  createdAt DateTime @default(now())
  scores        Score[]
  gameSessions  GameSession[]
  achievements  UserAchievement[]
  dailyStreaks  DailyStreak[]
}

model Category {
  id           String  @id @default(cuid())
  name         String  @unique
  slug         String  @unique
  description  String?
  icon         String?
  displayOrder Int     @default(0)
  games Game[]
}

model Game {
  id           String    @id @default(cuid())
  slug         String    @unique
  title        String
  description  String?
  categoryId   String
  thumbnail    String?
  complexity   Int       @default(1)
  instructions String?
  status       String    @default("draft") // draft | published | hidden
  createdAt    DateTime  @default(now())
  category     Category  @relation(fields: [categoryId], references: [id])
  scores       Score[]
  gameSessions GameSession[]
}

model Score {
  id        String   @id @default(cuid())
  userId    String
  gameId    String
  score     Int
  duration  Int?
  timestamp DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  game Game @relation(fields: [gameId], references: [id])
  @@index([gameId, score(sort: Desc)])
  @@index([userId, gameId])
}

model GameSession {
  id        String    @id @default(cuid())
  userId    String
  gameId    String
  startTime DateTime
  endTime   DateTime?
  score     Int?
  completed Boolean   @default(false)
  user User @relation(fields: [userId], references: [id])
  game Game @relation(fields: [gameId], references: [id])
  @@index([userId, startTime(sort: Desc)])
}

model Achievement {
  id          String @id @default(cuid())
  slug        String @unique
  title       String
  description String?
  icon        String?
  criteria    Json   // { type: "score", threshold: 1000, gameId: "..." }
  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  user        User        @relation(fields: [userId], references: [id])
  achievement Achievement @relation(fields: [achievementId], references: [id])
  @@unique([userId, achievementId])
}

model DailyStreak {
  id             String   @id @default(cuid())
  userId         String   @unique
  currentStreak  Int      @default(0)
  longestStreak  Int      @default(0)
  lastPlayedDate DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
}
```

---

## 5. Plan de Creación del ERS

### 5.1 Formato y Estructura

Documento basado en **IEEE 830-1998** (como el ERS del proyecto NAP). Se creará un archivo consolidado en `docs/ers/ERS_MATKII.md`.

### 5.2 Estructura del ERS

| Sección | Contenido |
|---|---|
| **1. Introducción** | Propósito, alcance, definiciones, acrónimos, referencias (IEEE 830, OWASP, ISO 25010) |
| **2. Descripción general** | Perspectiva del producto, funciones, tipos de usuario, restricciones, suposiciones |
| **3. Requisitos específicos** | |
| 3.1 Interfaces externas | UI (14 pantallas), APIs (R2, NextAuth, Supabase), Capacitor plugins |
| 3.2 RF por módulo | Módulos: Autenticación (RF-001 a RF-008), Juegos (RF-009 a RF-015), Puntuaciones (RF-016 a RF-020), Categorías/Navegación (RF-021 a RF-025), Administración (RF-026 a RF-030), Mobile (RF-031 a RF-034) |
| 3.3 RNF | Rendimiento (<500ms, 1000 concurrentes), Seguridad (OWASP), Disponibilidad (99.5%), Performance (Lighthouse ≥85) |
| 3.4 Reglas de negocio | RN-001 a RN-012 (publicación de juegos, registro de scores, autenticación para scores globales, rachas) |
| 3.5 Criterios de aceptación | Formato Dado/Cuando/Entonces para cada RF de prioridad Alta |
| **4. Modelos de análisis** | Casos de uso (CU-01 a CU-05), modelo ER, diagramas de estados (juego, partida, racha) |
| **5. Matrices de trazabilidad** | CU ↔ RF, RF ↔ RNF, RF ↔ RN, Objetivos ↔ RF |

### 5.3 Módulos Funcionales y RFs Clave

| Módulo | ID | Prioridad |
|---|---|---|
| **Autenticación** | RF-001 a RF-008 | Alta: registro, login, roles, sesión JWT |
| **Juegos** | RF-009 a RF-015 | Alta: catálogo, carga en iframe, GameBridge, ejecución/pausa |
| **Puntuaciones** | RF-016 a RF-020 | Alta: registro scores, ranking global, historial |
| **Categorías/Navegación** | RF-021 a RF-025 | Alta: navegación, búsqueda, filtros |
| **Administración** | RF-026 a RF-030 | Alta: CRUD juegos, gestión usuarios |
| **Mobile** | RF-031 a RF-034 | Media: responsive, touch, offline, push |

### 5.4 Reglas de Negocio Esenciales

| ID | Regla |
|---|---|
| RN-001 | Un juego solo se muestra si su estado es "published" |
| RN-002 | La puntuación se registra globalmente solo si el usuario está autenticado |
| RN-003 | Un usuario no registrado puede jugar; su score se guarda solo localmente |
| RN-004 | El ranking global usa la mejor puntuación de cada usuario por juego |
| RN-005 | La racha diaria se pierde si no se juega en 24h |
| RN-008 | Los juegos se cargan en iframes con sandbox estricto |
| RN-009 | Una partida enviada desde GameBridge debe incluir token de sesión firmado |

### 5.5 Responsable y Tiempo

- **Responsable:** CEO/Scrum Master + Tech Lead (revisión)
- **Tiempo estimado:** 5 días hábiles
- **Formato:** Markdown, un archivo único `docs/ers/ERS_MATKII.md`

---

## 6. Plan de Creación del ADR

### 6.1 Formato MADR

Cada ADR en su propio archivo dentro de `docs/adr/`. Formato:
- Título, Estado, Fecha, Decisor
- Contexto (problema, restricciones)
- Decisión (qué se eligió y por qué)
- Opciones consideradas (tabla comparativa)
- Consecuencias positivas y negativas
- Requisitos relacionados

### 6.2 Decisiones a Documentar

| ID | Decisión | Estado propuesto |
|---|---|---|
| **ADR-001** | Monolito modular con Next.js App Router | Aceptada |
| **ADR-002** | Canvas API + TypeScript como motor de juegos (vs Phaser/PixiJS/Kaplay) | Aceptada |
| **ADR-003** | PostgreSQL + Prisma ORM | Aceptada |
| **ADR-004** | Zustand para estado global del frontend | Aceptada |
| **ADR-005** | Cloudflare R2 para assets estáticos de juegos | Aceptada |
| **ADR-006** | Vercel (Next.js) + Supabase (PostgreSQL) + R2 (assets) como infraestructura | Aceptada |
| **ADR-007** | NextAuth.js (Auth.js) para autenticación con Prisma adapter | Aceptada |
| **ADR-008** | Capacitor 6 para empaquetado móvil | Aceptada |
| **ADR-009** | GameBridge con postMessage + iframe sandboxed para aislamiento de juegos | Aceptada |
| **ADR-010** | Lazy loading + dynamic imports (`next/dynamic`) para bundles de juegos | Aceptada |

### 6.3 Resumen de Decisiones Críticas

| Decisión | Elegida | Alternativas | Razón principal |
|---|---|---|---|
| Motor de juegos | Canvas API nativa | Phaser (pesado), PixiJS (overkill) | Bundle <50 KB por juego |
| Aislamiento | iframe + postMessage | Mismo contexto (colisiones), Worker (sin DOM) | Aislamiento total de estilos/JS |
| Estado global | Zustand | Redux (boilerplate), Context (re-renders) | ~1 KB, persist middleware |
| Assets | Cloudflare R2 | S3 (cobro egreso), Supabase Storage (1GB) | 10 GB gratis, egreso ilimitado |

### 6.4 Responsable y Tiempo

- **Responsable:** Tech Lead
- **Tiempo estimado:** 3 días hábiles (paralelo al ERS)
- **Formato:** 10 archivos markdown en `docs/adr/` + `README.md` como índice

---

## 7. Roadmap de Sprints y Asignación de Roles

### 7.1 Metodología

- **Framework:** Scrum adaptado (sprints de 2 semanas)
- **Ceremonias:** Daily (15 min), Sprint Planning (1h), Review (30min), Retro (30min)
- **Definition of Done:**
  - Código mergeado a `develop` vía PR con ≥1 approval
  - Pruebas unitarias pasan (`npm test`)
  - Sin errores TypeScript (`npm run typecheck`)
  - Sin errores lint (`npm run lint`)
  - Preview en Vercel funcional

### 7.2 Roadmap de Sprints

```
Sprint 0 ─── Sprint 1 ─── Sprint 2 ─── Sprint 3 ─── Sprint 4 ─── Sprint 5 ─── Sprint 6 ─── Sprint 7
(Jul W1-2)   (Jul W3-4)   (Ago W1-2)   (Ago W3-4)   (Sep W1-2)   (Sep W3-4)   (Oct W1-2)   (Oct W3-4)

ERS + ADRs ── Auth ─────── Hex Merge ── Asteroid ─── Perfiles ──── Anim. ────── Capacitor ── E2E + Deploy
Setup repo   Layout       Quick Math   Pivot         Ranking       Skeletons    Touch         Perf. audit
CI/CD        Nav                        Flip Tactics Historial     Estados      Fullscreen    Lanzamiento
             GameCards                              Logros        SEO          Offline
             GameBridge                              Streaks                   Push
```

### 7.3 Detalle de Sprints

#### Sprint 0 — Fundación (Días 1-14)
**Artefactos:** ERS + 10 ADRs + Repo configurado + CI/CD + Prisma schema + Despliegue Vercel/Supabase/R2
**Roles:** CEO (ERS, visión), Tech Lead (ADRs, repo, infra)

#### Sprint 1 — Esqueleto (Días 15-28)
**Entregables:**
- Auth completo (NextAuth.js + login/register + OAuth)
- Layout responsive (Header, Footer, Nav, Sidebar)
- GameCard, GameGrid, CategoryFilter
- Página Home y Catálogo
- GameBridge minimal (hook + iframe de prueba)
**Roles:** Tech Lead, Frontend Lead, Backend Lead, Design Lead

#### Sprint 2 — MVP Juegos 1-2 (Días 29-42)
**Entregables:**
- **Hex Merge** (juego completo en Canvas)
- **Quick Math** (juego completo en Canvas)
- GameBridge funcional (start, pause, resume, restart, score, gameover)
- Score storage local (localStorage)
- Página de juego individual con iframe
**Roles:** Game Dev 1, Game Dev 2, Tech Lead (GameBridge), Frontend Lead

#### Sprint 3 — MVP Juegos 3-5 (Días 43-56)
**Entregables:**
- **Asteroid Sweep** (juego completo)
- **Pivot** (juego completo)
- **Flip Tactics** (juego completo)
- Score system global (API + DB)
- Leaderboard por juego (Top 10)
**Roles:** Game Dev 1, Game Dev 2, Backend Lead, Frontend Lead

#### Sprint 4 — Plataforma (Días 57-70)
**Entregables:**
- Perfiles de usuario con estadísticas
- Ranking global combinado
- Historial de partidas
- Logros (detección + notificación visual)
- Daily Streaks (rachas + bonus)
**Roles:** Frontend Lead, Backend Lead, Design Lead

#### Sprint 5 — Pulido (Días 71-84)
**Entregables:**
- Animaciones (Framer Motion, micro-interacciones)
- Loading skeletons en todas las páginas
- Estados vacío/error/loading
- SEO (metadata dinámica, sitemap, OG)
- Performance (Lighthouse ≥85)
- Página 404 + error boundary
**Roles:** Design Lead, Frontend Lead, Tech Lead

#### Sprint 6 — Mobile (Días 85-98)
**Entregables:**
- Capacitor configurado (Android + iOS)
- Touch events adaptados en juegos
- Pantalla completa + landscape
- Offline parcial (Service Worker + IndexedDB)
- Notificaciones push (rachas)
- Haptics + UI nativa
**Roles:** Tech Lead, Frontend Lead, Game Devs (adaptar juegos a touch)

#### Sprint 7 — QA + Lanzamiento (Días 99-112)
**Entregables:**
- Testing E2E (Playwright: flujos críticos)
- Performance audit (Lighthouse, WebPageTest)
- Security audit (OWASP ZAP, helmet, rate limiting)
- Bug bash grupal
- Documentación completa
- Deploy producción + dominio + SSL + monitoreo
- Release en GitHub con changelog
**Roles:** Todos (Tech Lead lidera, QA dedicado)

### 7.4 Asignación de Roles

| Sprint | CEO/Scrum | Tech Lead | Frontend | Backend | Design | GameDev1 | GameDev2 | QA |
|---|---|---|---|---|---|---|---|---|
| **Sprint 0** | ERS, backlog | ADRs, repo, infra | — | — | — | — | — | — |
| **Sprint 1** | Ceremonias | GameBridge, review | Auth UI, Layout | NextAuth, Prisma | Prototipos Figma | — | — | — |
| **Sprint 2** | Ceremonias | GameBridge integración | Página juego, score local | Score API | Assets | **Hex Merge** | **Quick Math** | — |
| **Sprint 3** | Ceremonias | Review técnico | Leaderboard UI | Score API completo | Assets | **Asteroid Sweep** | **Pivot** | — |
| **Sprint 4** | Ceremonias | Ranking global arq | Perfil, ranking UI | Logros, rachas APIs | Logros, perfiles | **Flip Tactics** | — | — |
| **Sprint 5** | Supervisión | SEO, perf. audit | Animaciones, skeletons | — | Micro-interacciones | — | — | — |
| **Sprint 6** | Ceremonias | Capacitor, SW, offline | Touch, fullscreen | — | UI mobile | Adaptar a touch | Adaptar a touch | — |
| **Sprint 7** | Lanzamiento | Security, monitoreo | Bug fixing | Bug fixing | Bug fixing | Bug fixing | Bug fixing | **E2E, perf** |

---

## Apéndice A: Resumen de Archivos a Crear

| Fase | Archivo | Ruta | Contenido |
|---|---|---|---|
| Fundación | ERS | `docs/ers/ERS_MATKII.md` | Especificación completa IEEE 830 |
| Fundación | ADR-001 a ADR-010 | `docs/adr/` | 10 decisiones de arquitectura |
| Fundación | Schema Prisma | `prisma/schema.prisma` | Modelo de datos |
| Fundación | CI/CD | `.github/workflows/ci.yml` | Lint, typecheck, test |
| Fundación | Config | `.env.example` | Variables de entorno |
| Diseño | Design tokens | `tailwind.config.ts` | Paleta, tipografía, espacios |
| Diseño | Componentes UI | `src/components/ui/` | Button, Card, Input, Modal |
| Diseño | Layouts | `src/components/layout/` | Header, Footer, Navbar |
| Juegos | Game Engine | `src/games/engine/` | GameBridge, GameLoop, InputManager |
| Juegos | Hex Merge | `src/games/hex-merge/` | Juego completo |
| Juegos | Quick Math | `src/games/quick-math/` | Juego completo |
| Juegos | Asteroid Sweep | `src/games/asteroid-sweep/` | Juego completo |
| Juegos | Pivot | `src/games/pivot/` | Juego completo |
| Juegos | Flip Tactics | `src/games/flip-tactics/` | Juego completo |
| Plataforma | API Routes | `src/app/api/` | Scores, auth, admin |
| Mobile | Capacitor | `capacitor.config.ts` | Config Android/iOS |

---

> **Siguiente paso:** Comenzar Sprint 0 — redactar ERS y ADRs, configurar el repositorio, CI/CD e infraestructura base.
