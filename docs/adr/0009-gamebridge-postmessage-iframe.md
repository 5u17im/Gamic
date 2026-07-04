# ADR-0009 — Comunicación juegos-plataforma: GameBridge con postMessage + iframe

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

La plataforma Matkii Games aloja juegos que se desarrollan de forma independiente, cada uno con sus propias dependencias, estilos, variables globales y lógica de renderizado. Si todos los juegos compartieran el mismo contexto de JavaScript y DOM que la plataforma, existirían varios riesgos:

- **Colisiones de estilos:** los estilos globales de un juego (reset, clases, animaciones) podrían filtrarse a la UI de la plataforma o viceversa.
- **Colisiones de JavaScript:** variables globales, prototipos modificados, polyfills o `window` API podrían interferir entre la plataforma y el juego.
- **Seguridad:** un juego con código malicioso (o con una vulnerabilidad XSS) podría acceder a los datos de la plataforma (sesión del usuario, tokens, etc.) si comparte el mismo contexto.
- **Aislamiento de errores:** un error fatal en un juego (bucle infinito, stack overflow, `console.error` masivo) no debe derribar la plataforma.

Además, los juegos deben poder comunicarse con la plataforma para notificar eventos (puntuación, game over, pausa, solicitud de guardado) y la plataforma debe poder controlar el juego (iniciar, pausar, reiniciar, cambiar nivel).

La solución debe ser ligera, estándar (sin librerías externas), compatible con Capacitor (ADR-008) y suficientemente rápida para juegos en tiempo real (la latencia de comunicación debe ser <5 ms para no afectar la jugabilidad).

## Decisión

Cada juego se ejecuta en un **iframe con sandbox** que lo aísla completamente de la plataforma. La comunicación bidireccional se realiza mediante **postMessage** con un protocolo tipado llamado **GameBridgeMessage**.

```
┌──────────────────────┐     postMessage      ┌──────────────────────┐
│                      │ ◄──────────────────► │                      │
│  Plataforma (padre)  │   GameBridgeMessage   │   Juego (iframe)     │
│  Next.js / App       │                       │   Canvas 2D / TS     │
│                      │                       │                      │
└──────────────────────┘                       └──────────────────────┘
```

### Protocolo GameBridgeMessage

```typescript
// src/features/games/types/game-bridge.ts

// Mensajes de la plataforma → juego
export type PlatformToGame =
  | { type: 'START'; payload: { level?: number; difficulty?: string } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'SET_VOLUME'; payload: { volume: number } }
  | { type: 'SET_DIFFICULTY'; payload: { difficulty: string } }
  | { type: 'NAVIGATE_AWAY' }

// Mensajes del juego → plataforma
export type GameToPlatform =
  | { type: 'GAME_READY' }
  | { type: 'SCORE_UPDATE'; payload: { score: number } }
  | { type: 'GAME_OVER'; payload: { finalScore: number; reason?: string } }
  | { type: 'LEVEL_COMPLETE'; payload: { level: number; score: number } }
  | { type: 'PAUSED' }
  | { type: 'RESUMED' }
  | { type: 'ERROR'; payload: { message: string; code?: string } }
  | { type: 'REQUEST_FULLSCREEN' }

export type GameBridgeMessage = PlatformToGame | GameToPlatform
```

### Implementación del lado de la plataforma

```typescript
// src/features/games/lib/game-bridge.ts
import { useCallback, useEffect, useRef } from 'react'
import type { GameBridgeMessage, GameToPlatform } from '../types/game-bridge'

interface UseGameBridgeOptions {
  gameSlug: string
  onScoreUpdate?: (score: number) => void
  onGameOver?: (score: number, reason?: string) => void
  onError?: (message: string) => void
}

export function useGameBridge(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  options: UseGameBridgeOptions
) {
  const { gameSlug, onScoreUpdate, onGameOver, onError } = options
  const handlersRef = useRef({ onScoreUpdate, onGameOver, onError })
  handlersRef.current = { onScoreUpdate, onGameOver, onError }

  useEffect(() => {
    function handleMessage(event: MessageEvent<GameToPlatform>) {
      // Validar origen (solo mensajes de nuestro iframe)
      if (!iframeRef.current?.contentWindow) return
      if (event.source !== iframeRef.current.contentWindow) return

      const msg = event.data

      switch (msg.type) {
        case 'SCORE_UPDATE':
          handlersRef.current.onScoreUpdate?.(msg.payload.score)
          break
        case 'GAME_OVER':
          handlersRef.current.onGameOver?.(
            msg.payload.finalScore,
            msg.payload.reason
          )
          break
        case 'ERROR':
          handlersRef.current.onError?.(msg.payload.message)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [iframeRef])

  const send = useCallback((message: PlatformToGame) => {
    iframeRef.current?.contentWindow?.postMessage(message, '*')
  }, [iframeRef])

  return { send }
}
```

### Implementación del lado del juego

```typescript
// Cada juego incluye este script en su build
// Se comunica con la plataforma padre

interface GameBridge {
  onMessage: (handler: (msg: PlatformToGame) => void) => void
  send: (msg: GameToPlatform) => void
}

const bridge: GameBridge = {
  onMessage(handler) {
    window.addEventListener('message', (event) => {
      const msg = event.data as PlatformToGame
      handler(msg)
    })
  },
  send(msg) {
    window.parent.postMessage(msg, '*')
  },
}
```

### Iframe sandbox

```tsx
// src/app/juegos/[slug]/page.tsx
export default function GamePage({ params }: { params: { slug: string } }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const scoreRef = useRef(0)

  const { send } = useGameBridge(iframeRef, {
    gameSlug: params.slug,
    onScoreUpdate: (score) => { scoreRef.current = score },
    onGameOver: async (score) => {
      // Guardar puntuación via API
      await fetch('/api/scores', {
        method: 'POST',
        body: JSON.stringify({ gameId: params.slug, score }),
      })
    },
  })

  return (
    <div className="game-container">
      <GameToolbar onPause={() => send({ type: 'PAUSE' })} />
      <iframe
        ref={iframeRef}
        src={`https://assets.matkii.com/games/${params.slug}/latest/build/index.html`}
        sandbox="allow-scripts allow-same-origin"
        className="game-iframe"
        title={params.slug}
      />
    </div>
  )
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Iframe sandbox + postMessage** (elegida) | Aislamiento total de estilos y JS; seguridad (sandbox restringe acceso a `parent`, cookies, localStorage); protocolo tipado; compatible con Capacitor; estándar web sin librerías. | Latencia de ~1 ms por mensaje (despreciable para juegos 2D); no se puede compartir contexto WebGL entre iframes; el iframe debe cargarse desde una URL distinta al padre para evitar vulnerabilidades de same-origin. |
| Mismo contexto JS (React + juego en el mismo bundle) | Sin latencia de comunicación; acceso directo al estado global (Zustand); renderizado en el mismo canvas. | Colisiones de estilos y JS garantizadas; sin aislamiento de errores (un crash del juego derriba la UI); imposible que terceros desarrollen juegos independientes. |
| Web Workers | Aislamiento total (hilo separado); sin bloqueo del hilo principal. | Sin acceso a DOM ni Canvas (no se puede renderizar); la comunicación es asíncrona (postMessage igual que iframe); no es una opción viable para juegos que necesitan renderizado Canvas. |
| Module Federation (Webpack 5) / Micro-frontends | Carga dinámica de juegos como módulos remotos; compartición de dependencias. | Complejidad de configuración muy alta; sigue compartiendo el mismo contexto DOM y JS; no hay aislamiento real; overkill para juegos independientes. |

## Consecuencias

### Positivas

- **Aislamiento total:** cada juego se ejecuta en su propio contexto de JavaScript y DOM. Los estilos CSS no se filtran, las variables globales no colisionan y un error fatal en el juego no afecta a la plataforma.
- **Seguridad:** el atributo `sandbox` del iframe restringe lo que el juego puede hacer (no puede acceder a `window.parent`, no puede hacer `top.navigation`, no puede ejecutar scripts en el contexto del padre). Incluso si un juego tiene una vulnerabilidad XSS, no compromete los datos de la plataforma.
- **Juegos independientes:** cada juego es un proyecto autónomo con su propio `package.json`, sus propias dependencias y su propio pipeline de build. El equipo de juegos puede trabajar sin conocer los detalles de la plataforma.
- **Protocolo tipado:** los mensajes `GameBridgeMessage` están completamente tipados en TypeScript. Errores como enviar `SCORE_UPDATE` con un `score` string en lugar de número se detectan en compilación.
- **Extensible para terceros:** desarrolladores externos pueden crear juegos para la plataforma siguiendo el protocolo GameBridge y subiendo el build a R2. El sandbox garantiza que no puedan acceder a datos de la plataforma.

### Negativas / riesgos

- **Latencia de postMessage:** cada mensaje entre la plataforma y el juego tiene una latencia de ~1 ms (postMessage es síncrono dentro del mismo proceso, pero atraviesa el límite del iframe). Para juegos que necesitan comunicación en cada frame (60 FPS → 16 ms por frame), 1 ms es aceptable pero no despreciable.
  - *Mitigación:* minimizar la cantidad de mensajes por frame. En lugar de enviar `SCORE_UPDATE` en cada frame, enviarlo cada 100 ms o cuando el score cambia significativamente. Para comandos de control (PAUSE, RESUME), no hay problema de latencia.
- **Carga del iframe desde URL diferente:** por seguridad, el iframe debe cargar el juego desde un dominio diferente al de la plataforma (por ejemplo, `assets.matkii.com`) para que `sandbox="allow-same-origin"` no comprometa la seguridad. Esto implica dos dominios.
  - *Mitigación:* usar un subdominio (`assets.matkii.com`) apuntando a Cloudflare R2. Esto ya está alineado con ADR-005 y ADR-006.
- **No WebGL compartido:** si dos juegos usan WebGL, cada iframe crea su propio contexto WebGL. No se puede compartir la GPU context entre juegos, pero esto no es un problema para juegos 2D simples (Canvas 2D).
  - *Mitigación:* para juegos WebGL en el futuro, cada iframe tendrá su propio contexto; el límite de contextos WebGL simultáneos en Chrome es ~16, suficiente para la mayoría de los casos.
- **Dificultad de debugging:** cuando el juego está dentro de un iframe, las herramientas de desarrollo de Chrome requieren cambiar el contexto de debugging al iframe.
  - *Mitigación:* documentar el flujo de debugging (abrir DevTools → Sources → Page → seleccionar el iframe). En desarrollo, se puede cargar el juego directamente (sin iframe) para debugging más fácil.

**Requisitos relacionados:** RNF-014 (seguridad — sandbox aisla el juego), RF-020 a RF-024 (ejecución de juegos), RNF-004 (carga bajo demanda del iframe), RNF-015 (mantenibilidad — juegos independientes).
