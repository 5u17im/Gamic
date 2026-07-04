# Plan de Ejecución — Gamic v2.0

## Resumen de Auditoría

| Métrica | Valor |
|---------|-------|
| Archivos totales | ~120 |
| Tests | 101 (19 archivos) |
| Juegos | 5 funcionales |
| Hallazgos críticos | 5 |
| Hallazgos altos | 13 |
| Hallazgos medios | 18 |
| Hallazgos bajos | 12 |
| Features ERS implementadas | ~40% |
| Cobertura de tests en APIs | 0% |

---

## Fase A — Seguridad (CRÍTICO, 2-3 días)

### A1. RBAC: Campo `role` en User + guard en admin APIs
**Problema:** Cualquier usuario autenticado puede CRUD juegos/categorías.
**Solución:**
- Migrar schema: `User.role String @default("user")`
- Seed: marcar primer usuario registrado como "admin"
- Crear helper `requireAdmin()` en `lib/auth.ts`
- Agregar a todas las rutas `/api/admin/*`
- Actualizar `proxy.ts` para redirigir no-admin a home

### A2. Rate limiting en POST /api/scores
**Problema:** Atacante puede spamear miles de scores.
**Solución:**
- Implementar rate limiter en memoria (Map<userId, count> con TTL de 60s)
- Máximo 5 submissions por minuto por usuario
- Devolver 429 Too Many Requests

### A3. AUTH_SECRET seguro
**Problema:** Secret hardcodeado en `.env` y commiteado.
**Solución:**
- Regenerar secret con `npx auth secret`
- Agregar `*.db` y `.env` a `.gitignore` (ya está `.env*`)
- Documentar en `.env.example`

### A4. Origin validation en GameBridge
**Problema:** `targetOrigin = "*"` permite cualquier origen.
**Solución:**
- Determinar parent origin desde URL del iframe
- Pasar `allowedOrigin` como query param al juego
- Validar en todos los `postMessage` y `onmessage`

### A5. Try/catch en todas las API routes
**Problema:** Cualquier runtime error = 500 sin mensaje.
**Solución:**
- Envolver handlers en try/catch
- Loggear errores (a console en dev, a AuditLog en prod)
- Devolver `{ error: "Internal server error" }`

### A6. Soft delete para juegos
**Problema:** DELETE en `/api/admin/games/[id]` elimina scores en cascada.
**Solución:**
- DELETE → cambia `game.status` a `"archived"` en vez de borrar
- Filtrar juegos archivados de catálogo público
- Mantener scores para historial

---

## Fase B — Arquitectura (ALTO, 3-4 días)

### B1. Fuente única de verdad para juegos
**Problema:** Misma metadata de juegos duplicada en 6+ archivos.
**Solución:**
- Migrar catálogo a DB vía seed (ya existe)
- Crear API `/api/games` (pública, con caché)
- Refactorizar todas las páginas para consultar DB en vez de arrays hardcodeados
- Eliminar todas las constantes GAMES duplicadas

### B2. GameEngine abstraction
**Problema:** 5 juegos con código duplicado (resize, DPR, bridge, particles).
**Solución:**
- Crear `public/games/engine.js` con:
  - `createCanvas(width, height)` + DPR handling
  - `createBridge(origin)` con validación de origen
  - `createParticleSystem(maxParticles)`
  - `createGameLoop(update, render, fps)` con deltaTime clamping
- Refactorizar los 5 juegos para usar engine.js
- Eliminar ~80 líneas duplicadas por juego

### B3. GameSession tracking real
**Problema:** Modelo `GameSession` existe pero no se usa.
**Solución:**
- GamePlayer crea sesión via API al hacer start
- Envía `gameover` → API actualiza endTime, score, completed
- Mostrar duración real en historial de perfil

### B4. Limpieza de dependencias
**Problema:** `framer-motion` (32KB) instalado pero no usado.
**Solución:**
- Remover de `package.json`
- Eliminar `prisma/seed.ts` (duplicado de `seed.js`)
- Unificar naming de exports

---

## Fase C — Testing (CRÍTICO, 3-4 días)

### C1. API route tests con MSW
**Objetivo:** Probar TODAS las rutas HTTP reales.
- GET/POST `/api/scores` con autenticación real
- CRUD `/api/admin/games` con y sin admin role
- PUT `/api/profile` con datos válidos/inválidos
- Rate limiting (enviar 6 requests en 1 minuto)

### C2. Auth guard tests
- Verificar que rutas protegidas rechazan 401
- Verificar que admin routes rechazan 403 para usuarios normales
- Verificar que proxy.ts redirige correctamente

### C3. Expandir tests de hooks
- `useGame`: score event, gameover, error, pause, resume, restart, cleanup
- `useLocalStorage`: ya tiene cobertura adecuada

### C4. Tests de componentes
- `GameCard`: hover, focus, link navigation
- `GamePlayer`: error state, score submission UI
- `Header`: mobile menu toggle, search form submit, auth state

### C5. E2E Playwright expandidos
- Flujo completo: registro → login → jugar → score en ranking
- Admin: login como admin → crear juego → ver en catálogo
- Error: 404, 500, invalid slugs

---

## Fase D — UX/UI (ALTO, 2-3 días)

### D1. Loading states con skeletons
- `loading.tsx` para: `/profile`, `/admin/*`, `/categories`, `/ranking`
- Skeleton components reutilizables (card, table, stat card)

### D2. Admin mobile navigation
- Bottom sheet o drawer para admin sidebar en mobile
- Mismas opciones que sidebar desktop

### D3. Breadcrumbs y navegación
- Breadcrumb en `/play/[slug]` (Home > Categorías > Hex Merge)
- Botón "Volver al juego" desde ranking al juego

### D4. Fullscreen API
- Botón de pantalla completa en GamePlayer
- landscape hint en mobile (orientación)

### D5. Empty/Error states robustos
- Estados vacíos con ilustración + CTA
- Errores de red con retry automático
- Toast/notificaciones para feedback de acciones

---

## Fase E — Features pendientes (MEDIO, 4-5 días)

### E1. Achievements (logros)
**Modelos listos:** `Achievement`, `UserAchievement`
- Seed con 10+ logros (primera partida, 1000 puntos, racha de 5, etc.)
- Servicio de desbloqueo: check en gameover
- UI en perfil: lista de logros con iconos
- Notificación toast al desbloquear

### E2. Daily Streak (rachas diarias)
**Modelo listo:** `DailyStreak`
- Servicio que registra `lastPlayedDate` al enviar score
- Compara con fecha anterior → incrementa o resetea streak
- UI en perfil: streak actual + longest + bonus indicator

### E3. Admin: User management
- Lista de usuarios en `/admin/users`
- Ver scores totales por usuario
- Suspender/activar cuenta
- Ver info de sesión

### E4. AuditLog recording
**Modelo listo:** `AuditLog`
- Registrar cada acción admin (crear/editar/eliminar juego/categoría)
- Registrar cambios de contraseña, perfil
- Vista en admin (últimos 100 eventos)

### E5. Password recovery
- Ruta `/forgot-password` con formulario email
- Token de reset (expira 1h)
- Email simulando envío (console.log en dev)
- Ruta `/reset-password/[token]`

### E6. Game rating
- Estrellas 1-5 debajo del game player
- `PUT /api/games/[slug]/rating`
- Promedio mostrado en tarjeta del juego

---

## Fase F — Juegos (MEDIO, 2-3 días)

### F1. Fixes de gameplay
| Juego | Issue | Fix |
|-------|-------|-----|
| Asteroid Sweep | Touch sólo dispara, no controla ángulo | Touch horizontal → rotar nave |
| Pivot | Array de obstáculos sin límite | Cap en 50 + cleanup agresivo |
| Pivot | Ball clip through platform | Continuous collision detection |
| Hex Merge | `placedAnim`/`mergeAnim` declarados no usados | Implementar o remover |
| Quick Math | `generateOptions()` llamado 2x por frame | Cachear resultado |
| Quick Math | Falta operador ÷ | Agregar división |
| Flip Tactics | `setTimeout` race condition | State machine + cancel previous |
| Todos | DeltaTime no clampado | `Math.min(dt, 1/30)` |

### F2. Dificultad progresiva
- Asteroid Sweep: velocidad + tasa de spawn incrementan con tiempo
- Quick Math: números más grandes, operadores más complejos
- Pivot: obstáculos más rápidos, gaps más angostos

### F3. Pantalla Game Over en el juego
- Botón "Jugar de nuevo" dentro del canvas
- Score final con animación de conteo
- High score indicator

### F4. Efectos de sonido (opcional)
- Web Audio API para efectos simples
- Sin dependencias externas
- Toggle de sonido en GamePlayer

---

## Fase G — Performance & Producción (BAJO, 2 días)

### G1. Bundle optimization
- `next/dynamic` para GamePlayer (carga bajo demanda)
- `next/dynamic` para admin pages
- Bundle analyzer script

### G2. Caching
- `Cache-Control: public, max-age=300` en GET /api/games (catálogo)
- `stale-while-revalidate` en ranking
- ISR para páginas estáticas

### G3. Service Worker
- Cachear game assets (HTML/JS de juegos)
- Offline fallback page
- Precache de categorías

### G4. Lighthouse audit
- Performance target: 90+
- Accessibility target: 95+
- SEO: 100

---

## Timeline estimado

```
Fase A (Seguridad)     ████████░░░░░░░░░░░░  2-3 días
Fase B (Arquitectura)  ████████████░░░░░░░░  3-4 días
Fase C (Testing)       ████████████░░░░░░░░  3-4 días
Fase D (UX/UI)         ████████░░░░░░░░░░░░  2-3 días
Fase E (Features)      ████████████████░░░░  4-5 días
Fase F (Juegos)        ████████░░░░░░░░░░░░  2-3 días
Fase G (Performance)   ██████░░░░░░░░░░░░░░  2 días
                     ───────────────────────
Total estimado: 18-24 días
```

## Dependencias entre fases

```
A (Seguridad) ──┬──> B (Arquitectura) ──> C (Testing avanzado)
                │
                └──> D (UX/UI) ──────────────────┐
                                                 ├──> G (Performance)
                ┌────────────────────────────────┘
E (Features) ───┼──> depende de A (seguridad admin)
                │
F (Juegos) ─────┘──> independiente, puede correr en paralelo
```

## Orden recomendado

1. **A1, A3, A5** — Seguridad base (2 días)
2. **C1, C2** — Tests de seguridad + APIs (2 días)
3. **F1** — Fixes críticos de juegos (1 día)
4. **A2, A4** — Rate limiting + bridge validation (1 día)
5. **B1, B2** — Refactor arquitectura (3 días)
6. **D1-D4** — UX/UI (2 días)
7. **E1-E3** — Features principales (3 días)
8. **C3-C5** — Tests expandidos + E2E (2 días)
9. **E4-E6, F2-F4** — Features restantes + polish (3 días)
10. **B3, G1-G4** — Performance + GameSessions (2 días)

**Total días-hombre: ~21 días**
