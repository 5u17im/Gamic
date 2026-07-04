# ADR-0010 — Carga bajo demanda: lazy loading + dynamic imports

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

El catálogo de Matkii Games Platform crecerá desde 5 juegos en el MVP hasta 20+ juegos en el primer año. Cada juego incluye componentes React (página de detalle, toolbar, overlay de puntuación) y, aunque el motor del juego se carga en un iframe desde R2 (ADR-009), la plataforma necesita cargar el código de la interfaz asociada a cada juego.

Si todo el código de la plataforma —páginas, componentes, stores, utilidades— se cargara en un único bundle de JavaScript, el tamaño inicial sería excesivo. Un análisis estimado:

| Componente | Tamaño aprox. |
| --- | --- |
| Plataforma base (Next.js, React, Zustand, UI) | ~80 KB |
| Por cada juego (componentes + estilos + helpers) | ~10-30 KB |
| Total 20 juegos | ~200-600 KB adicionales |

Cargar 600 KB de JavaScript en la carga inicial degrada el Time to Interactive (TTI) y el First Contentful Paint (FCP), especialmente en dispositivos móviles con conexiones lentas (3G). Next.js App Router ya realiza code splitting automático por páginas, pero los componentes específicos de cada juego (vista de detalle, toolbar de juego, overlay de fin de partida) deben cargarse bajo demanda, solo cuando el usuario navega a un juego.

Además, los juegos individuales se renderizan en iframes (ADR-009), pero la plataforma aún necesita cargar el componente envolvente (GamePage, GameToolbar, ScoreOverlay). Este código envolvente es el candidato principal para lazy loading.

## Decisión

Se adopta una estrategia de **carga bajo demanda en tres niveles**:

### Nivel 1: next/dynamic para componentes de juego

Los componentes específicos de cada juego se cargan con `next/dynamic` y `ssr: false` (no tienen sentido en SSR porque dependen del cliente para interactuar con el iframe):

```typescript
// src/app/juegos/[slug]/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const GameToolbar = dynamic(
  () => import('@/features/games/components/game-toolbar'),
  {
    ssr: false,
    loading: () => <div className="h-12 animate-pulse bg-gray-800 rounded" />,
  }
)

const ScoreOverlay = dynamic(
  () => import('@/features/games/components/score-overlay'),
  {
    ssr: false,
    loading: () => null,
  }
)

const GameIframe = dynamic(
  () => import('@/features/games/components/game-iframe'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-gray-900 animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Cargando juego...</span>
      </div>
    ),
  }
)

export default function GamePage({ params }: { params: { slug: string } }) {
  return (
    <div className="game-page">
      <Suspense fallback={<div className="h-12 bg-gray-800 animate-pulse" />}>
        <GameToolbar gameSlug={params.slug} />
      </Suspense>
      <Suspense fallback={<div className="aspect-video bg-gray-900 animate-pulse" />}>
        <GameIframe gameSlug={params.slug} />
      </Suspense>
      <Suspense fallback={null}>
        <ScoreOverlay gameSlug={params.slug} />
      </Suspense>
    </div>
  )
}
```

### Nivel 2: Prefetch en hover

Cuando el usuario pasa el ratón sobre una tarjeta de juego en el catálogo, se precarga el componente dinámico para que la navegación sea instantánea:

```typescript
// src/features/games/components/game-card.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useRef, useCallback } from 'react'

interface GameCardProps {
  slug: string
  title: string
  thumbnail: string
}

export function GameCard({ slug, title, thumbnail }: GameCardProps) {
  const router = useRouter()
  const prefetched = useRef(false)

  const handleMouseEnter = useCallback(() => {
    if (!prefetched.current) {
      prefetched.current = true
      // Precargar el chunk del componente dinámico
      import('@/features/games/components/game-iframe')
      import('@/features/games/components/game-toolbar')
      // Precargar la ruta (Next.js prefetch)
      router.prefetch(`/juegos/${slug}`)
    }
  }, [router, slug])

  return (
    <a
      href={`/juegos/${slug}`}
      onMouseEnter={handleMouseEnter}
      className="game-card"
    >
      <img src={thumbnail} alt={title} />
      <h3>{title}</h3>
    </a>
  )
}
```

### Nivel 3: Assets desde R2 con cacheo CDN

Los builds de juegos (iframe content) se sirven desde Cloudflare R2 con cabeceras de cacheo agresivo:

```
Cache-Control: public, max-age=31536000, immutable
```

Cada versión de juego tiene una URL única (`games/{slug}/{version}/build/index.html`), por lo que el cacheo inmutable es seguro. El navegador solo descarga el build la primera vez; las visitas posteriores usan la caché local.

### Webpack chunk splitting

Además, se configura `next.config.js` para separar los chunks de cada feature:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    // Separar chunks por carpeta de features
    optimizePackageImports: ['@/features/games', '@/features/leaderboard'],
  },
  // Personalizar split chunks (opcional)
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        games: {
          test: /[\\/]features[\\/]games[\\/]/,
          name: 'games',
          chunks: 'async',
        },
      },
    }
    return config
  },
}

export default config
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **next/dynamic + prefetch + R2 caching** (elegida) | Bundle inicial < 150 KB; cada juego se carga bajo demanda; prefetch en hover reduce latencia percibida a ~0; cacheo CDN evita descargas repetidas; integración nativa con Next.js. | Pequeña latencia al hacer clic si el usuario no ha hecho hover (~200-500 ms para cargar el chunk); los chunks de juego no se benefician del prefetch en móvil (no hay hover). |
| Carga diferida manual (IntersectionObserver + import()) | Control granular sobre cuándo y cómo se cargan los componentes. | Mucho código boilerplate; no hay integración con el sistema de prefetch de Next.js; hay que gestionar estados de carga manualmente. |
| Bundles comunes compartidos (single bundle para todos los juegos) | Un solo chunk para todos los juegos después del primero. | No hay carga bajo demanda real — el usuario paga el costo de todos los juegos aunque solo juegue a uno; desperdicio de ancho de banda. |
| import() nativo sin next/dynamic | Funciona con cualquier framework o vanilla JS. | No hay soporte de SSR (error en servidor); no hay estados de loading automáticos (hay que manejar Suspense manualmente); no hay integración con el sistema de chunks de Next.js. |

## Consecuencias

### Positivas

- **Bundle inicial mínimo:** la página principal (catálogo) carga solo ~80-100 KB de JavaScript. Los chunks de juegos se cargan bajo demanda, resultando en un Time to Interactive (TTI) < 2 segundos en 4G y < 4 segundos en 3G.
- **Prefetch inteligente:** en desktop, el hover sobre una tarjeta de juego dispara la precarga del chunk, haciendo que la navegación sea instantánea. En la práctica, el usuario no percibe latencia al hacer clic.
- **Cacheo inmutable en CDN:** los builds de juegos se cachean por un año. La primera visita a un juego descarga el build; las siguientes son instantáneas (desde caché del navegador).
- **Aislamiento de versiones:** cada versión de juego tiene una URL única. Si se publica una nueva versión, los usuarios obtienen el nuevo build inmediatamente, mientras que la versión anterior sigue en caché para quienes aún no han cerrado la pestaña.
- **Skeleton loading:** los estados de `loading` en `next/dynamic` muestran un skeleton animado que mejora la percepción de velocidad, incluso si el chunk tarda en cargarse.

### Negativas / riesgos

- **Latencia en primera visita sin hover:** en dispositivos móviles (sin hover), el usuario debe esperar a que se cargue el chunk del juego al hacer clic (~200-500 ms en 4G, más en 3G).
  - *Mitigación:*
    - En móvil, precargar los primeros 3 juegos del catálogo al hacer scroll (usando IntersectionObserver).
    - Mostrar un skeleton loading inmediato (el estado `loading` de `next/dynamic`) para que el usuario perciba respuesta instantánea aunque el contenido tarde un momento.
    - Para juegos muy populares, incluir su chunk en el bundle principal si el análisis de uso lo justifica.
- **Múltiples chunks para un solo juego:** si `next/dynamic` no agrupa correctamente los componentes, un juego puede generar 3-4 chunks separados (toolbar, iframe, overlay).
  - *Mitigación:* verificar con `next build --analyze` (usando `@next/bundle-analyzer`) que los chunks se agrupan correctamente. Si es necesario, forzar la agrupación en `webpack.splitChunks.cacheGroups`.
- **Mantenimiento de prefetch:** el prefetch manual en `onMouseEnter` requiere que cada `GameCard` implemente la lógica de precarga.
  - *Mitigación:* crear un hook `usePrefetchGame` que centralice la lógica y pueda reutilizarse. El hook también puede integrarse con analíticas para medir la tasa de acierto del prefetch.

**Requisitos relacionados:** RNF-004 (tiempo de carga < 2 segundos), RNF-001 (tiempo de respuesta de navegación), RNF-019 (escalabilidad del catálogo), RNF-017 (usabilidad — skeleton loading mejora percepción).
