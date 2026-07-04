# ADR-0002 — Motor de juegos: Canvas 2D API + TypeScript

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

La plataforma Matkii Games debe soportar juegos MVP con mecánicas 2D simples: plataformas, puzzles, disparos top-down y carreras. No se requieren físicas complejas (gravedad, detección de colisiones avanzada, simulación de cuerpos rígidos), al menos en la versión inicial. El objetivo es mantener el bundle de cada juego por debajo de 50 KB para garantizar carga rápida incluso en conexiones lentas.

Incluir un motor de juegos completo como Phaser (~1 MB minificado) o PixiJS (~500 KB) supondría un coste de descarga desproporcionado para la simplicidad de los juegos previstos. Además, la mayoría de los motores existentes están diseñados para juegos independientes con su propio pipeline de assets, y no están pensados para integrarse dentro de una plataforma más grande que ya usa React/Next.js.

Una interfaz común (`GameInterface`) permite que la plataforma cargue, inicialice, pause y destruya cualquier juego de forma homogénea, independientemente de su implementación interna. Esto es clave para el sistema de iframes (ADR-009) y para que desarrolladores externos puedan crear juegos para la plataforma en el futuro.

## Decisión

Se adopta **Canvas 2D API nativa** del navegador como motor de renderizado, con **TypeScript** para tipado estricto. Cada juego implementa la interfaz `GameInterface` que define los métodos `init()`, `update(deltaTime)`, `render(ctx: CanvasRenderingContext2D)`, `pause()`, `resume()` y `destroy()`.

No se incluye ninguna librería de terceros para el núcleo del motor. Cada juego se desarrolla como un módulo TypeScript independiente dentro de `src/features/games/implementations/`.

```typescript
// src/features/games/types/game-interface.ts
export interface GameInterface {
  id: string
  name: string
  version: string
  init(canvas: HTMLCanvasElement, assets: GameAssets): Promise<void>
  update(deltaTime: number): void
  render(ctx: CanvasRenderingContext2D): void
  pause(): void
  resume(): void
  destroy(): void
  getScore?(): number
  getState?(): GameState
}
```

Las utilidades compartidas (game loop con `requestAnimationFrame`, detección de colisiones AABB, entrada de teclado/táctil, gestor de assets) residen en `src/features/games/engine/` y se reutilizan entre juegos.

```typescript
// src/features/games/engine/game-loop.ts
export class GameLoop {
  private lastTime = 0
  private animFrameId = 0
  private running = false

  constructor(
    private update: (dt: number) => void,
    private render: () => void
  ) {}

  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  private loop = (now: number): void => {
    if (!this.running) return
    const dt = Math.min((now - this.lastTime) / 1000, 0.05) // cap a 50ms
    this.lastTime = now
    this.update(dt)
    this.render()
    this.animFrameId = requestAnimationFrame(this.loop)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.animFrameId)
  }
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Canvas 2D API + TypeScript** (elegida) | Bundle por juego < 50 KB; control total del render loop; sin dependencias externas que actualizar; curva de aprendizaje baja (API estándar del navegador); compatible con Web Workers para offscreen canvas en el futuro. | Sin editor visual; todo el contenido se crea mediante código; requiere implementar manualmente físicas básicas (gravedad, colisiones AABB). |
| Phaser 3 | Motor completo con físicas Arcade/Matter, cámaras, animaciones, audio; gran comunidad y documentación. | ~1 MB minificado por juego; diseñado para juegos independientes, no para integración en plataforma; sobrecarga de features no utilizadas (partículas, tilemaps, etc.); conflicto potencial con el sistema de módulos de Next.js. |
| PixiJS | Renderizador WebGL con fallback Canvas; alto rendimiento; ampliamente usado. | ~500 KB minificado; orientado a visualización más que a juegos (no trae físicas, ni game loop, ni input manager); WebGL es excesivo para juegos 2D simples y añade complejidad de contexto. |
| Kaplay (ex Kaboom) | API expresiva y declarativa; componentes y game objects; fácil de prototipar. | ~300 KB; ecosistema pequeño; menos control sobre el render loop; no diseñado para integración en plataforma; documentación limitada. |

## Consecuencias

### Positivas

- **Bundle mínimo:** cada juego pesa menos de 50 KB (típicamente 15-30 KB), lo que permite carga instantánea incluso en 3G. Esto es crítico para la experiencia de juego en dispositivos móviles.
- **Cero dependencias externas:** no hay librerías de terceros que actualizar, auditar por vulnerabilidades o que rompan con cambios semánticos. El motor es el navegador.
- **Control total:** cada aspecto del renderizado, la física y la entrada está bajo control del equipo. No hay sorpresas por comportamiento de librerías externas.
- **Portabilidad:** cualquier juego implementa `GameInterface`, lo que permite ejecutarlo tanto en el iframe de la plataforma como en un entorno de testing headless (Node.js con `node-canvas`).
- **Extensibilidad futura:** si se requiere WebGL en el futuro (efectos de shader, juegos 3D), se puede incorporar sin cambiar la interfaz — `render()` recibiría tanto el contexto 2D como el WebGL.

### Negativas / riesgos

- **Sin editor visual:** todo el contenido (sprites, animaciones, niveles, mapas de tiles) se define en código TypeScript. No hay arrastrar y soltar.
  - *Mitigación:* crear herramientas internas de apoyo: un *level editor* basado en JSON que los juegos carguen al iniciar, y un *spritesheet packer* que genere el atlas de texturas. Para el MVP, los niveles se codifican a mano y se cargan desde JSON.
- **Físicas básicas manuales:** gravedad, colisiones y detección de solapamiento deben implementarse a mano para cada juego.
  - *Mitigación:* proporcionar utilidades reutilizables en `engine/`: `AABB`, `circleCollision`, `gravity`, `tileMapCollision`. Estas funciones son < 1 KB y se comparten entre juegos.
- **Curva de aprendizaje para nuevos desarrolladores:** los programadores acostumbrados a motores comerciales (Unity, Godot) pueden encontrar más lento el desarrollo sin herramientas visuales.
  - *Mitigación:* documentar el flujo de trabajo de creación de un juego con una guía paso a paso, incluyendo la estructura de carpetas, el `GameInterface` y un juego de ejemplo completo (Pong).

**Requisitos relacionados:** RF-020 a RF-024 (juegos MVP), RNF-004 (tiempo de carga < 2 segundos), RNF-014 (seguridad, al ser código propio no hay vectores de ataque de librerías), RNF-015 (mantenibilidad de juegos independientes).
