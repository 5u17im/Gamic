# ADR-0008 — Empaquetado móvil: Capacitor 6

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

Matkii Games Platform debe estar disponible como aplicación móvil sin requerir que los usuarios accedan exclusivamente a través del navegador. Una app móvil nativa permite acceder a APIs del dispositivo que mejoran la experiencia de juego: retroalimentación háptica (vibración), orientación de pantalla (bloquear landscape en juegos), notificaciones locales (récords, desafíos) y pantalla completa sin la barra de direcciones del navegador.

Sin embargo, el equipo no tiene recursos para desarrollar y mantener dos aplicaciones nativas independientes (Swift para iOS, Kotlin para Android). El core de la plataforma es una aplicación web Next.js (ADR-001), y se desea reutilizar el máximo código posible.

Las soluciones de empaquetado híbrido (WebView nativo que carga la app web) han madurado: Capacitor 6 permite envolver una aplicación web Next.js en una WebView nativa con acceso a plugins que exponen APIs nativas (cámara, geolocalización, sensores, notificaciones, háptica). Además, la misma app web se despliega en Vercel para acceso por navegador y se empaqueta con Capacitor para las tiendas de aplicaciones.

## Decisión

Se adopta **Capacitor 6** para empaquetar la aplicación Next.js como app móvil nativa para iOS y Android. Se utiliza un flujo de build donde primero se compila Next.js (`next build`), luego Capacitor copia el output estático y genera los proyectos nativos (`npx cap sync`).

```json
// package.json (extracto)
{
  "scripts": {
    "build:web": "next build",
    "build:ios": "npm run build:web && npx cap sync ios",
    "build:android": "npm run build:web && npx cap sync android",
    "dev:mobile": "next build && npx cap copy && npx cap open"
  }
}
```

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.matkii.games',
  appName: 'Matkii Games',
  webDir: '.next',        // Directorio de salida de next build (o custom output)
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: false,
    },
    ScreenOrientation: {
      // Se bloquea/bloquea por juego dinámicamente
    },
  },
}

export default config
```

Plugins previstos para el MVP:

| Plugin | Uso | Prioridad |
| --- | --- | --- |
| `@capacitor/haptics` | Retroalimentación táctil en juegos (colisiones, aciertos) | Alta |
| `@capacitor/status-bar` | Controlar la barra de estado (ocultar en juegos) | Alta |
| `@capacitor/screen-orientation` | Bloquear orientación por juego (landscape para shooters, portrait para puzzles) | Alta |
| `@capacitor/local-notifications` | Notificaciones de récords, desafíos y recordatorios | Media |

Para detectar si la app se ejecuta en Capacitor (vs navegador), se usa una función auxiliar:

```typescript
// src/lib/capacitor.ts
import { Capacitor } from '@capacitor/core'

export const isNativePlatform = Capacitor.isNativePlatform()

export const getPlatform = (): 'web' | 'ios' | 'android' => {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() as 'ios' | 'android'
  }
  return 'web'
}
```

Los juegos que requieren orientación fija (por ejemplo, shooter en landscape) la solicitan mediante un hook:

```typescript
// src/features/games/hooks/use-screen-orientation.ts
import { useEffect } from 'react'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { isNativePlatform } from '@/lib/capacitor'

export function useScreenOrientation(orientation: 'portrait' | 'landscape') {
  useEffect(() => {
    if (!isNativePlatform) return

    const lock = async () => {
      await ScreenOrientation.lock({ orientation })
    }

    lock()

    return () => {
      ScreenOrientation.unlock()
    }
  }, [orientation])
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Capacitor 6** (elegida) | Mismo código web Next.js; acceso a APIs nativas mediante plugins; actualizaciones OTA (AppFlow) sin pasar por tiendas; despliegue en App Store y Google Play con el mismo código base. | Rendimiento inferior a nativo (WebView); la experiencia de juego no es tan fluida como una app nativa; algunos plugins pueden no cubrir todas las necesidades. |
| React Native (Expo) | Rendimiento nativo; animaciones más fluidas; acceso completo a APIs nativas. | Reescribir toda la plataforma desde cero; no reutiliza el código Next.js; dos bases de código que mantener; mayor complejidad de desarrollo. |
| Tauri | App nativa con WebView (similar a Capacitor); bundle más pequeño; renderizado más rápido. | Solo desktop (Windows, macOS, Linux) en Tauri v1; Tauri v2 tiene soporte móvil alpha pero inmaduro; no apto para MVP. |
| WebView manual (Android WebView + WKWebView) | Control total sobre la WebView; sin dependencias de terceros. | Mucho trabajo manual (configuración, bridging, plugins); duplicación entre iOS y Android; no hay comunidad ni plugins pre-construidos. |

## Consecuencias

### Positivas

- **Reutilización del 100 % del código web:** el mismo Next.js que se despliega en Vercel se empaqueta con Capacitor. No hay que escribir componentes separados para móvil. Los cambios se reflejan en ambas plataformas simultáneamente.
- **APIs nativas via plugins:** los plugins de Capacitor exponen háptica, orientación, notificaciones y barra de estado sin escribir código nativo. Cada plugin es un `npm install` y configuración mínima.
- **Actualizaciones OTA:** Capacitor AppFlow (o servicios como CodePush/Microsoft) permite actualizar el contenido de la WebView sin pasar por la revisión de las tiendas, ideal para corregir bugs de juegos rápidamente.
- **Publicación en tiendas:** el mismo proyecto se empaqueta para iOS (Xcode, App Store) y Android (Android Studio, Google Play). El flujo `npx cap sync` genera los proyectos nativos que se abren en los IDEs correspondientes.

### Negativas / riesgos

- **Rendimiento de WebView:** los juegos renderizan sobre Canvas dentro de una WebView, que no tiene acceso directo al GPU. Para juegos 2D simples es aceptable, pero juegos con muchos sprites o partículas pueden experimentar bajada de frames.
  - *Mitigación:* optimizar los juegos para 60 FPS en dispositivos mid-range (reducir número de sprites simultáneos, usar `requestAnimationFrame`, mantener el canvas pequeño y escalar con CSS). Si se detectan problemas de rendimiento, evaluar la posibilidad de mover el renderizado a un plugin nativo de Canvas (no planificado para MVP).
- **Permisos nativos:** cada API nativa requiere permisos en Android (`AndroidManifest.xml`) y descripciones en iOS (`Info.plist`). El usuario debe aceptar el permiso la primera vez que se solicita, lo que puede causar fricción.
  - *Mitigación:* solicitar permisos solo cuando sean necesarios (ej. orientación al cargar un juego que la requiere), no al abrir la app. Mostrar un mensaje explicativo antes de solicitar el permiso.
- **Mantenimiento de proyectos nativos:** Xcode y Android Studio deben actualizarse periódicamente, y las configuraciones de build pueden romperse con nuevas versiones de Capacitor o del sistema operativo.
  - *Mitigación:* mantener un pipeline de CI/CD (GitHub Actions) que compile y firme los builds automáticamente, detectando errores de compilación antes de fusionar.

**Requisitos relacionados:** RNF-005 (aplicación responsiva — la app web se empaqueta para móvil), RNF-017 (usabilidad — APIs nativas mejoran UX), IU-01 a IU-14 (todas las pantallas web se empaquetan).
