# ADR-0004 — Estado global: Zustand con slices

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

La plataforma Matkii Games necesita gestionar estado global compartido entre múltiples componentes y páginas: sesión de usuario (autenticación, perfil), juego activo (estado de la partida, puntuación, configuración), interfaz de usuario (tema, sidebar, notificaciones, modal actual) y preferencias (volumen, controles, accesibilidad).

Next.js App Router con Server Components reduce la necesidad de estado global para datos que pueden obtenerse del servidor, pero ciertos estados son inherentemente del lado cliente: el estado del juego activo, el estado de la UI (modales, toasts, sidebar) y las preferencias del usuario.

Se descartó Redux Toolkit por su boilerplate (actions, reducers, slices, dispatch, connect/mapState). Context API de React se consideró pero causa re-renderizados en todo el árbol cuando cualquier valor cambia. Jotai y Recoil ofrecen una aproximación atómica pero fragmentan el estado en múltiples piezas pequeñas que pueden ser difíciles de rastrear.

Zustand ofrece una API minimalista (sin providers, sin actions explícitas) con soporte para slices (organizar el store por dominios), middleware de persistencia (localStorage/sessionStorage) y un tamaño de ~1 KB.

## Decisión

Se adopta **Zustand** como librería de estado global, organizado en **slices** por dominio lógico. Cada slice se define en su propio archivo dentro de `src/stores/`.

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'matkii-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

```typescript
// src/stores/game-store.ts
import { create } from 'zustand'

interface GameState {
  activeGameId: string | null
  score: number
  isPlaying: boolean
  isPaused: boolean
  setActiveGame: (id: string | null) => void
  setScore: (score: number) => void
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  activeGameId: null,
  score: 0,
  isPlaying: false,
  isPaused: false,
  setActiveGame: (id) => set({ activeGameId: id, score: 0, isPlaying: false }),
  setScore: (score) => set({ score }),
  start: () => set({ isPlaying: true, isPaused: false }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  reset: () => set({ score: 0, isPlaying: false, isPaused: false }),
}))
```

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toasts: Toast[]
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
```

Los stores se consumen directamente desde cualquier componente sin providers:

```tsx
function GameOverScreen() {
  const score = useGameStore((s) => s.score)
  const user = useAuthStore((s) => s.user)
  const { addToast } = useUIStore()

  return <div>Game Over — Score: {score}</div>
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Zustand con slices** (elegida) | API minimalista (no requiere providers, actions, dispatch); ~1 KB; persist middleware built-in; selectors con re-renderizados precisos (sin renderizar todo el árbol); TypeScript first-class. | Ecosistema de middlewares más pequeño que Redux (no hay saga, thunk, observable oficial); las slices no están tan estandarizadas como en Redux Toolkit. |
| Redux Toolkit | Estandarizado; herramientas de desarrollo maduras (Redux DevTools); middlewares para efectos secundarios (RTK Query, createAsyncThunk); amplio ecosistema. | Boilerplate significativo aunque menor que Redux clásico; ~12 KB; requiere configurar store, providers, slices, dispatch; los selectors requieren hooks personalizados o `useSelector`. |
| Context API (React nativo) | Sin dependencias externas; API nativa de React. | Re-renderizados en toda la rama del árbol cuando cualquier valor cambia; difícil de optimizar sin `useMemo` excesivo; no tiene persistencia integrada; requiere múltiples providers anidados. |
| Jotai / Recoil | Enfoque atómico; re-renderizados precisos; sin providers (en Jotai). | Fragmentación del estado en cientos de átomos; difícil de rastrear el flujo; ecosistema más pequeño; menos adoptado en proyectos grandes. |

## Consecuencias

### Positivas

- **Cero providers:** a diferencia de Context API o Redux, Zustand no requiere envolver el árbol en `<Provider>`. Los stores son módulos independientes que se importan donde se necesitan. Esto simplifica las Server Components y el testing unitario de componentes.
- **Re-renderizados precisos:** Zustand usa comparación de referencias por defecto. Un componente que solo lee `isPlaying` del game store no se re-renderiza cuando cambia `score`, incluso si ambos están en el mismo store.
- **Persistencia sencilla:** el middleware `persist` serializa automáticamente el estado a `localStorage`/`sessionStorage` con un par de líneas. No hay que escribir un custom hook de persistencia.
- **Testing unitario:** los stores se pueden instanciar y manipular directamente sin providers mockeados. Para pruebas de componentes, se puede inyectar estado inicial en el store.
- **Bundle mínimo:** ~1 KB minificado + gzip, frente a ~12 KB de Redux Toolkit + React-Redux.

### Negativas / riesgos

- **Ecosistema limitado:** Zustand no tiene equivalentes oficiales de Redux-Saga, Redux-Observable o RTK Query.
  - *Mitigación:* los efectos secundarios se manejan con React hooks (`useEffect`) combinados con `set` calls. Para data fetching, Next.js Server Components y Server Actions reducen la necesidad de estado global de cache. Si se necesita cache client-side, usar `react-query`/`@tanstack/react-query` junto con Zustand para el estado de UI.
- **Falta de estandarización de slices:** a diferencia de Redux Toolkit donde los slices tienen una estructura fija (name, initialState, reducers), en Zustand las slices son objetos planos sin convención forzada.
  - *Mitigación:* definir una guía de estilo interna: cada store en su propio archivo, exportar hooks con prefijo `use`, mantener los métodos como funciones flecha, documentar la interfaz del estado con tipos.
- **Persistencia de datos sensibles:** el middleware `persist` guarda en `localStorage`, que es accesible desde JavaScript.
  - *Mitigación:* usar `partialize` para excluir datos sensibles (tokens de sesión, contraseñas) de la persistencia. Los tokens deben almacenarse en cookies `httpOnly` manejadas por NextAuth.js, no en el store.

**Requisitos relacionados:** RNF-013 (control de acceso — estado de sesión), RNF-015 (mantenibilidad — stores independientes), RNF-017 (usabilidad — UI store para tema, sidebar, toasts), RNF-004 (tiempo de carga — bundle mínimo).
