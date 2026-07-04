# Plan Maestro de Diseño — Gamic Games Platform

---

## 1. Formato de UI y Design System

### 1.1 Inspiración e Identidad

Gamic toma inspiración funcional de **Friv.com** (acceso inmediato, grid sin fricción), **CoolMathGames** (personalidad, nicho claro) y **Kongregate** (persistencia de perfil, logros). La identidad visual propia se basa en:

- **Personalidad:** amigable, juguetona pero madura — sin infantilizar, sin ciberpunk genérico.
- **Tono visual:** colores cálidos con acentos vibrantes controlados. Fondos claros con detalles sutiles. Tarjetas con contenido como protagonista.
- **Diferenciador:** bordes redondeados generosos, sombras suaves, microinteracciones con bounce leve.

### 1.2 Paleta de Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `color-primary` | `#6C5CE7` | Acciones principales, links, botón primario |
| `color-primary-hover` | `#5A4BD1` | Hover de primary |
| `color-secondary` | `#FD7E14` | Badges, acentos cálidos, estrellas, highlight |
| `color-accent` | `#00CEC9` | Confirmaciones, éxito, green del scoreboard |
| `color-bg` | `#F8F9FA` | Fondo principal de página |
| `color-surface` | `#FFFFFF` | Cards, modales, paneles |
| `color-surface-hover` | `#F1F3F5` | Hover sobre superficie |
| `color-surface-alt` | `#E9ECEF` | Superficies secundarias (sidebar, inputs) |
| `color-text-primary` | `#1A1A2E` | Títulos y cuerpo principal |
| `color-text-secondary` | `#6C757D` | Metadatos, descripciones, etiquetas |
| `color-text-on-primary` | `#FFFFFF` | Texto sobre fondo primary |
| `color-border` | `#DEE2E6` | Bordes de componentes |
| `color-border-focus` | `#6C5CE7` | Borde en estado focus-visible |
| `color-danger` | `#E74C3C` | Errores, eliminación |
| `color-warning` | `#F39C12` | Advertencias |
| `color-score-gold` | `#FFD700` | Score alto |
| `color-score-silver` | `#C0C0C0` | Score medio |
| `color-score-bronze` | `#CD7F32` | Score bajo |

### 1.3 Tipografía

| Propiedad | Valor |
|-----------|-------|
| Font familia headings | `"Plus Jakarta Sans", system-ui, sans-serif` |
| Font familia body | `"Inter", system-ui, sans-serif` |
| Font familia mono (scores) | `"JetBrains Mono", monospace` |
| Base size | `16px` (1rem) |
| Scale | `1.25` (Major Third) |

| Nivel | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `text-xs` | 0.75rem (12px) | 400 | 1.5 |
| `text-sm` | 0.875rem (14px) | 400 | 1.5 |
| `text-base` | 1rem (16px) | 400 | 1.6 |
| `text-lg` | 1.125rem (18px) | 500 | 1.5 |
| `text-xl` | 1.25rem (20px) | 600 | 1.4 |
| `text-2xl` | 1.5rem (24px) | 700 | 1.3 |
| `text-3xl` | 2rem (32px) | 800 | 1.2 |

### 1.4 Sistema de Espaciados (4px base)

| Token | Rem | Px |
|-------|-----|----|
| `space-0` | 0 | 0 |
| `space-1` | 0.25rem | 4 |
| `space-2` | 0.5rem | 8 |
| `space-3` | 0.75rem | 12 |
| `space-4` | 1rem | 16 |
| `space-5` | 1.25rem | 20 |
| `space-6` | 1.5rem | 24 |
| `space-8` | 2rem | 32 |
| `space-10` | 2.5rem | 40 |
| `space-12` | 3rem | 48 |
| `space-16` | 4rem | 64 |
| `space-20` | 5rem | 80 |

### 1.5 Bordes y Sombras

| Token | Valor |
|-------|-------|
| `radius-sm` | 4px |
| `radius-md` | 8px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-round` | 9999px |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 8px 30px rgba(0,0,0,0.12)` |
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` |
| `shadow-card-hover` | `0 8px 24px rgba(0,0,0,0.12)` |
| `shadow-float` | `0 12px 40px rgba(108,92,231,0.15)` |

### 1.6 Componentes Reutilizables

#### GameCard

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │    Thumbnail (16:9)  │ │  ← lazy load, skeleton mientras carga
│ │    con overlay play   │ │  ← overlay semi-transparente en hover
│ └──────────────────────┘ │
│ Título del juego         │  ← text-base, weight 600
│ Categoría · ⭐ 4.5       │  ← text-sm, color-text-secondary
│ ⏱ 15 min                │
│ [▶ Jugar rápido]         │  ← botón ghost, visible siempre
└──────────────────────────┘
```

**Estados:**
- **Default:** shadow-card, border 1px solid color-border, bg color-surface
- **Hover:** shadow-card-hover, translateY(-4px), overlay de thumbnail se vuelve opaco al 40%
- **Focus-visible:** outline 2px solid color-primary, outline-offset 2px
- **Loading:** skeleton animado (gradiente shimmer en thumbnail + placeholders de texto)
- **Disabled:** opacidad 0.5, no interactivo (juego no disponible en esta región)

#### GameGrid

Grid responsivo con CSS Grid. Anchos mínimos de columna controlados por `auto-fill, minmax`.

| Breakpoint | Columnas | Gutter |
|------------|----------|--------|
| < 480px (mobile) | 1 | 16px |
| 480px–768px (tablet) | 2 | 16px |
| 768px–1024px (tablet landscape) | 3 | 20px |
| 1024px–1440px (desktop) | 4 | 24px |
| > 1440px | 5 | 24px |

#### Header / Nav

```
┌──────────────────────────────────────────────┐
│ 🎮 Gamic  [Buscar… 🔍]  [Categorías ▼] [ 👤 ]│
└──────────────────────────────────────────────┘
```

- Mobile: hamburger menu + search collapse
- Sticky top, z-50, backdrop-filter blur
- Logo tipográfico en bold, con icono de dado/d20

#### CategoryFilter

Pills horizontal scrolleable (overflow-x auto en mobile):
```
[Todos] [Acción] [Puzzles] [Estrategia] [Carreras] [Deportes] ...
```

- Active pill: bg color-primary, text-on-primary
- Inactive: bg surface-alt, text-secondary
- Hover inactive: bg surface-hover
- Scroll horizontal con scrollbar oculta (pero funcional)

#### SearchBar

- Input con icono de lupa a la izquierda
- Focus: border-color-focus, ring 3px color-primary con 20% opacidad
- Autocompletado inline con debounce 300ms
- En mobile: full-width expandable desde ícono de lupa

#### Scoreboard

Tabla con:
| # | Jugador | Puntuación | Tiempo |
|---|---------|-----------|--------|
| 1 | PlayerOne 🥇 | 12,450 | 3:20 |
| 2 | ProGamer 🥈 | 11,200 | 3:45 |
| 3 | GamicDev 🥉 | 9,800 | 4:10 |

- Filas alternadas con color-surface-alt para legibilidad
- El jugador actual (si está en top) con bg highlight primario al 10%
- Virtual scroll si > 50 entries

#### UserMenu

```
┌─── Avatar ──────────────────────────────────┐
│ Nivel 12 · 3,450 XP                         │
├─────────────────────────────────────────────┤
│ 👤 Mi Perfil                                │
│ 🏆 Logros (8/30)                            │
│ ❤️ Favoritos                                │
│ ⚙️ Configuración                            │
│ 🚪 Cerrar sesión                            │
└─────────────────────────────────────────────┘
```

- Desktop: dropdown onClick
- Mobile: slide-in panel desde la derecha

### 1.7 Animaciones

| Tipo | CSS / Framer | Detalle |
|------|-------------|---------|
| Hover card | `transform: translateY(-4px)` + shadow transition 200ms ease-out |
| Page transition | Framer `AnimatePresence` — fade + slideY 8px, 300ms |
| Loading skeleton | Shimmer gradient animation, 1200ms loop |
| Stagger grid items | `staggerChildren: 0.05` — fadeIn + slideUp 20px |
| Like/fav | Icono escala 1→1.2→1 con spring |
| Notification badge | escala de 0 a 1 con bounce spring |
| Progress bar XP | animación width con ease-out 600ms |
| Modal open | backdrop fade 150ms + modal scale 0.95→1 con spring |

### 1.8 Accesibilidad WCAG 2.1 AA

| Requisito | Implementación |
|-----------|---------------|
| Contraste mínimo 4.5:1 | Paleta verificada: text-primary #1A1A2E sobre bg #F8F9FA = 15.8:1. Text-secondary #6C757D solo para metadatos no críticos. |
| Tamaño táctil mínimo 48x48px | Todos los botones, píldoras de categoría, iconos de nav tienen padding suficiente para cumplir. |
| Focus-visible visible | Outline 2px solid primary + offset 2px en todos los elementos interactivos. |
| Skip to content | Primer elemento focusable del DOM. |
| ARIA labels | En iconos sin texto, botones de icono, input de búsqueda. |
| Reducción de movimiento | `prefers-reduced-motion: reduce` desactiva animaciones de transición, shimmer, bounce. |
| Modo oscuro | Soporte vía `prefers-color-scheme: dark` — invertir bg/surface y ajustar sombras. |

---

## 2. Pantallas Principales

### 2.1 Landing / Home

```
┌──────────────────────────────────────────────────┐
│ 🎮 Gamic     [Buscar juegos…]   [Categorías] [👤]│
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐   │
│ │          Hero / Banner Destacado           │   │
│ │  "NUEVO: Space Drift 2 — ya disponible"    │   │
│ │        [📺 Ver trailer] [▶ Jugar]          │   │
│ └────────────────────────────────────────────┘   │
│                                                  │
│ Categorías ── [Todos] [Acción] [Puzzles] ... →   │
│                                                  │
│ ⭐ Destacados ──────────── [Ver todos →]         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │Card  │ │Card  │ │Card  │ │Card  │             │
│ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                  │
│ 🆕 Recién agregados ─────── [Ver todos →]       │
│ ┌──────┐ ┌──────┐ ┌──────┐                       │
│ │Card  │ │Card  │ │Card  │                       │
│ └──────┘ └──────┘ └──────┘                       │
│                                                  │
│ 🔥 Más jugados ────────── [Ver todos →]          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Card  │ │Card  │ │Card  │ │Card  │ │Card  │    │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                  │
│ Footer: links, redes, copyright                   │
└──────────────────────────────────────────────────┘
```

- Hero banner rotatorio (3–4 slots destacados) con auto-play y controles manuales
- Categorías como pills scrolleables horizontalmente
- Secciones de grid con título + "Ver todos" link
- Lazy loading de thumbnails con Intersection Observer
- Infinite scroll opcional para "Todos los juegos"

### 2.2 Página de Categorías

```
┌──────────────────────────────────────────────────┐
│ Header                                              │
├──────────────────────────────────────────────────┤
│ 🏷️ Categorías                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │ 🎯   │ │ 🧩   │ │ 🧠   │ │ 🏎️   │ │ ⚽   │   │
│ │Acción│ │Puzzle│ │Estra │ │Carrer│ │Depor │   │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│                                                    │
│ Filtros: [Popularidad ▼] [Todos los tiempos ▼]     │
│                                                    │
│ Resultados: 24 juegos                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │Card  │ │Card  │ │Card  │ │Card  │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │Card  │ │Card  │ │Card  │ │Card  │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                    │
│ [ < 1 2 3 ... 6 > ]                               │
└──────────────────────────────────────────────────┘
```

- Categorías display como icon cards 120x120px (grandes, táctiles)
- Al seleccionar una categoría, se resalta con borde primary y el grid se filtra
- Sort dropdown: Popularidad, Nombre A-Z, Fecha, Calificación
- Paginación numérica clásica + "cargar más" en mobile

### 2.3 Página de Juego Individual

```
┌──────────────────────────────────────────────────┐
│ Header con breadcrumb: Home > Acción > Space Drift │
├──────────────────────────────────────────────────┤
│ ┌──── Columna Principal (flex: 1) ──────────────┐│
│ │ ┌─────────────────────────────────────────┐    ││
│ │ │ Canvas / Área de juego                  │    ││
│ │ │ (ratio 16:9 responsivo, máx 960px)      │    ││
│ │ │ + overlay "Press SPACE to start"        │    ││
│ │ └─────────────────────────────────────────┘    ││
│ │                                                 ││
│ │ Toolbar: [↺ Reiniciar] [🔊 Vol] [⏸ Pausa]      ││
│ │          [🖥 Pantalla completa] [❤️ Favorito]   ││
│ │                                                 ││
│ │ Descripción del juego...                        ││
│ │ Controles: WASD + Espacio                        ││
│ │ Tags: #acción #naves #multijugador              ││
│ └─────────────────────────────────────────────────┘│
│ ┌──── Columna Sidebar (280px) ───────────────────┐│
│ │ ⭐ Tu puntuación: 12,450                        ││
│ │ 🏆 High score: 15,200                          ││
│ │                                                 ││
│ │ ⏱ Progreso: ████████░░ 80% (nivel 4/5)         ││
│ │                                                 ││
│ │ ─── Top 10 ───                                 ││
│ │ #1  PlayerOne    15,200                         ││
│ │ #2  ProGamer     14,800                         ││
│ │ #3  GamicDev    12,450 ← TÚ                   ││
│ │ ...                                             ││
│ │                                                 ││
│ │ 🎮 Juegos relacionados                          ││
│ │ ┌──────┐ ┌──────┐                              ││
│ │ │Card  │ │Card  │                              ││
│ │ └──────┘ └──────┘                              ││
│ └─────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

- Canvas embebido con iframe o WebGL directo
- Sidebar collapsible en mobile (toggle button)
- Toolbar sticky dentro del contenedor del juego
- Progreso guardado automáticamente cada 30s vía localStorage
- Panel de controles desplegable (tooltip o modal pequeño)

### 2.4 Perfil de Jugador

```
┌──────────────────────────────────────────────────┐
│ Header                                              │
├──────────────────────────────────────────────────┤
│ ┌─── Hero del Perfil ──────────────────────────┐  │
│ │ [Avatar 96px]  PlayerOne                     │  │
│ │                Miembro desde Jun 2025         │  │
│ │                Nivel 12 · 3,450 / 5,000 XP   │  │
│ │                ████████░░░░░░░░ 69%          │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Tabs: [📊 Estadísticas] [🏆 Logros] [🎮 Juegos]    │
│                                                    │
│ ─── Estadísticas ───                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │🕐 48h │ │🏆 23 │ │⭐ 4.5│ │🎯 67%│              │
│ │Total  │ │Logros│ │Prom. │ │Compl.│              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                    │
│ ─── Últimos juegos jugados ───                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │Card  │ │Card  │ │Card  │ │Card  │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
└──────────────────────────────────────────────────┘
```

- Hero con progreso XP y barra de nivel
- Stats en grid de 4 cards (total time, achievements, avg score, completion rate)
- Tabs para cambiar entre estadísticas, logros (grid con iconos bloqueados/desbloqueados) y juegos
- Gráfico de actividad semanal (opcional v1, nice-to-have)

### 2.5 Panel de Administración (CRUD)

```
┌──────────────────────────────────────────────────┐
│ Admin Header — [🎮 Juegos] [🏷️ Categorías] [👥 Usuarios]│
├──────────────────────────────────────────────────┤
│ ─── Gestión de Juegos ───                       │
│ [➕ Añadir juego]  [Buscar…]                     │
│                                                    │
│ ┌─────┬──────────┬──────────┬──────┬───────────┐ │
│ │ ID  │ Título   │ Categoría│ Status│ Acciones  │ │
│ ├─────┼──────────┼──────────┼──────┼───────────┤ │
│ │ 12  │Space Drift│ Acción   │ ✅   │ [✏️][🗑] │ │
│ │ 13  │ PuzzleBox│ Puzzles  │ 🕐   │ [✏️][🗑] │ │
│ │ 14  │ BrainRun │ Estrateg │ ⏳   │ [✏️][🗑] │ │
│ └─────┴──────────┴──────────┴──────┴───────────┘ │
│                                                    │
│ Status legend: ✅ Publicado | 🕐 Borrador | ⏳ Rev.│
│                                                    │
│ Modal de edición:                                 │
│ ┌────────────────────────────────────────────┐   │
│ │ ✏️ Editar: Space Drift                     │   │
│ │ Título: [______________]                    │   │
│ │ Slug: [space-drift_________]  auto-generar │   │
│ │ Categoría: [Acción ▼]                      │   │
│ │ Descripción: [textarea...]                  │   │
│ │ URL del juego: [______________]            │   │
│ │ Thumbnail: [📁 Subir imagen]  (preview)    │   │
│ │ Status: [● Publicado] [○ Borrador]         │   │
│ │ Tags: [acción] [naves] [space] [➕]        │   │
│ │                                            │   │
│ │ [💾 Guardar] [✕ Cancelar]                  │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

- Tabla responsiva con scroll horizontal en mobile
- Modal/formulario para crear/editar con preview de thumbnail
- Status badges con colores distintivos
- Paginación de tabla

### 2.6 Próximamente

```
┌──────────────────────────────────────────────────┐
│ Header                                              │
├──────────────────────────────────────────────────┤
│ 🚀 Próximamente                                    │
│ Nuevos juegos en desarrollo para Gamic           │
│                                                    │
│ ┌──────────────┐  ┌──────────────┐               │
│ │ ┌──────────┐ │  │ ┌──────────┐ │               │
│ │ │ Artwork  │ │  │ │ Artwork  │ │               │
│ │ │ (16:9)   │ │  │ │ (16:9)   │ │               │
│ │ │  ████████ │ │  │ │  ██████░ │ │               │
│ │ │  75% done │ │  │ │  45% done│ │               │
│ │ └──────────┘ │  │ └──────────┘ │               │
│ │ Cyber Heist  │  │ Farm Tycoon  │               │
│ │ Acción ·     │  │ Simulación · │               │
│ │ ETA: Jul 2026│  │ ETA: Sep 2026│               │
│ │ [🔔 Avisarme]│  │ [🔔 Avisarme]│               │
│ └──────────────┘  └──────────────┘               │
│                                                    │
│ ┌──────────────┐  ┌──────────────┐               │
│ │ ┌──────────┐ │  │ ┌──────────┐ │               │
│ │ │ Artwork  │ │  │ │ Artwork  │ │               │
│ │ │ ████░░░░ │ │  │ │ ██░░░░░░ │ │               │
│ │ │  35% done│ │  │ │  15% done│ │               │
│ │ └──────────┘ │  │ └──────────┘ │               │
│ │ Neon Racer   │  │ Dungeon Run  │               │
│ │ Carreras ·   │  │ RPG ·        │               │
│ │ ETA: Nov 2026│  │ ETA: TBD     │               │
│ │ [🔔 Avisarme]│  │ [🔔 Avisarme]│               │
│ └──────────────┘  └──────────────┘               │
│                                                    │
│ ─── Suscríbete al newsletter ───                  │
│ [________________________] [📩 Notificarme]      │
└──────────────────────────────────────────────────┘
```

- Cards con artwork placeholder + barra de progreso de desarrollo
- Botón "Avisarme" que guarda notificación push (o localStorage para v1)
- Newsletter signup al final
- Diseño tipo "coming soon" con countdown opcional por juego

---

## 3. Experiencia de Usuario

### 3.1 Navegación y Transiciones

| Interacción | Comportamiento |
|-------------|---------------|
| Navegación entre páginas | Framer Motion `AnimatePresence` con fade (300ms) + slide vertical 8px. Desactivado si `prefers-reduced-motion`. |
| Click "Jugar rápido" en card | Transición directa a página de juego. Preload del iframe/WebGL en segundo plano. |
| Volver desde juego | Estado preservado (modal de confirmación si hay progreso sin guardar). |
| Cambio de categoría | Grid animado con layout animation (Framer `layout` prop) — las cards se reposicionan suavemente. |
| Búsqueda | Resultados en vivo con debounce 300ms. Si no hay resultados, empty state ilustrado. |

### 3.2 Guardado de Progreso Local

| Dato | Storage | Key |
|------|---------|-----|
| Progreso de juego | localStorage | `matkii:game:<slug>:progress` |
| High scores | IndexedDB | `matkii:scores` |
| Preferencias de usuario | localStorage | `matkii:prefs` |
| Juegos favoritos | localStorage | `matkii:favorites` |
| Últimos jugados | localStorage | `matkii:recent` (máx 20) |
| Progreso XP / nivel | localStorage | `matkii:profile:xp` |

IndexedDB para scores porque permite queries (top 10 por juego, ordenar por fecha) sin traer todo el dataset.

### 3.3 Búsqueda y Filtros

```
Barra de búsqueda global (Header):
- Placeholder: "Buscar juegos..."
- Mínimo 2 chars para activar
- Debounce 300ms
- Resultados en dropdown tipo search-as-you-type
  - Máx 6 resultados
  - Cada resultado: thumbnail small + título + categoría
  - "Ver todos los resultados →" al final
  - Teclas flecha arriba/abajo + Enter seleccionan

Filtros en página de categorías:
- Sort: [Popularidad] [Nombre A-Z] [Nuevos] [Mejor calificados]
- Rango de filtro: [Hoy] [Esta semana] [Este mes] [Todos]
- Filtro persistente en URL params (?categoria=accion&sort=popular)
```

### 3.4 Modo "Juego Rápido"

- Cada GameCard tiene botón "▶ Jugar" visible
- Click → navega directamente a la página de juego
- No requiere registro para jugar (solo para guardar score y progreso)
- El juego se carga con preload inmediato al hover sobre la card (> 300ms de hover dispara precarga del asset)
- Al terminar partida: prompt opcional "Inicia sesión para guardar tu puntuación"

### 3.5 Responsive Breakpoints

| Rango | Columnas | Layout notas |
|-------|----------|-------------|
| < 480px | 1 | Nav colapsado en hamburguesa. Sidebar de juego abajo del canvas. Categories horizontal scroll. Hero banner simplificado (sin texto overlay). |
| 480–768px | 2 | Nav completo con íconos. Sidebar de juego sigue abajo. Categories como pills. |
| 768–1024px | 3 | Nav completo. Sidebar de juego a la derecha (collapsible). Hero con texto. |
| 1024–1440px | 4 | Layout completo. Sidebar visible siempre. |
| > 1440px | 5 | Layout completo con máximo de contenedor 1400px centrado. |

### 3.6 Flujos Clave

**Guest → Jugar:**
1. Usuario llega a Home → scroll/vista de categorías
2. Click en card o "Jugar rápido" → carga página de juego
3. Juega partida completa → score mostrado
4. Modal: "¡Grandiosa partida! ¿Quieres guardar tu puntuación? [Iniciar sesión] [Seguir sin cuenta]"
5. Si sigue sin cuenta: score se guarda en localStorage, visible solo localmente

**Usuario registrado → Jugar → Guardar progreso:**
1. Login → redirige a última página vista
2. Juega → progreso auto-guardado cada 30s
3. Al cerrar sesión o perder conexión → último checkpoint disponible al reconectar
4. Score enviado al backend al finalizar partida (con reintento si offline)

**Navegación entre juegos:**
1. Desde juego actual → recomendaciones en sidebar → click → confirmar salida (solo si hay progreso sin guardar)
2. Si no hay progreso → transición directa con fade

### 3.7 Estados Vacíos y Error

| Situación | UI |
|-----------|-----|
| Sin resultados de búsqueda | Ilustración de "no encontrado" + texto + botón "Explorar juegos" |
| Sin conexión | Banner no intrusivo arriba + modo offline (juegos cacheados en service worker) |
| Error al cargar thumbnail | Imagen placeholder con icono de juego + retry automático |
| Error al cargar juego | Pantalla de error con botón "Reintentar" + "Volver al inicio" |
| Lista de juegos vacía (admin) | Ilustración + "Agrega tu primer juego" CTA |
