# ADR-0005 — Almacenamiento de assets: Cloudflare R2

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

Matkii Games Platform necesita almacenar y distribuir assets de juegos: sprites, tilesets, fondos, efectos de sonido, música, fuentes, configuraciones JSON de niveles y builds compilados de juegos. Estos assets deben servirse con baja latencia a jugadores en todo el mundo, especialmente en Latinoamérica donde se espera la mayoría de la audiencia inicial.

Los assets son mayoritariamente estáticos y no requieren procesamiento server-side. El volumen esperado es de varios gigabytes (sprites optimizados, audio comprimido, builds de juegos). El equipo busca una solución de almacenamiento de objetos que no cobre por egreso (ancho de salida), ya que cada partida cargará assets del juego activo, y el tráfico de salida será el principal costo.

AWS S3 cobra por egreso (~$0.09/GB), lo que para una plataforma de juegos con tráfico medio puede generar costos significativos. Supabase Storage ofrece solo 1 GB gratuito y el egreso comparte cuota con la base de datos. Vercel Blob es relativamente nuevo y tiene menos madurez.

Cloudflare R2 ofrece 10 GB de almacenamiento gratuito, egreso ilimitado sin cargo (a diferencia de S3), y se sirve a través de la red CDN global de Cloudflare con baja latencia. Es compatible con la API S3, por lo que cualquier cliente S3 funciona sin cambios.

## Decisión

Se adopta **Cloudflare R2** como almacenamiento de objetos para todos los assets de juegos. Los archivos se organizan bajo la estructura `games/{slug}/{version}/{tipo}/`. Los builds de juegos (para iframe) se almacenan como `games/{slug}/{version}/build/` con un `index.html` como punto de entrada.

```
games/
  platformer-demo/
    1.0.0/
      build/
        index.html
        game.js
        game.wasm
      sprites/
        player.png
        tileset.png
        enemies.png
      audio/
        bgm.mp3
        jump.wav
        death.wav
      config/
        levels.json
        settings.json
  puzzle-2048/
    1.0.0/
      build/
        index.html
        game.js
      sprites/
        tiles.png
```

Los metadatos (título, descripción, categoría, versión actual) se almacenan en PostgreSQL a través de Prisma. Solo los archivos binarios y el build residen en R2. Las URLs de acceso se generan como URLs prefirmadas o públicas según el tipo de asset:

- **Builds (iframe):** URL pública (lectura anónima) para que el iframe pueda cargar el juego.
- **Sprites/sonidos:** URL pública con cacheo CDN (cabecera `Cache-Control: public, max-age=31536000, immutable`).
- **Assets subidos por usuarios (avatar, capturas):** URL prefirmada con expiración, firmada desde el backend.

```typescript
// src/server/services/storage-service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!

export async function getAssetUrl(gameSlug: string, version: string, path: string): Promise<string> {
  const key = `games/${gameSlug}/${version}/${path}`
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn: 3600 })
}

export async function uploadBuild(gameSlug: string, version: string, files: Map<string, Buffer>): Promise<void> {
  for (const [filePath, content] of files) {
    const key = `games/${gameSlug}/${version}/build/${filePath}`
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: getMimeType(filePath),
      CacheControl: 'public, max-age=31536000, immutable',
    }))
  }
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **Cloudflare R2** (elegida) | 10 GB gratis permanentes; egreso ilimitado sin costo; CDN global con baja latencia; compatible con API S3; sin lock-in (se puede migrar a S3 cambiando el endpoint). | Un proveedor adicional que gestionar (credenciales, dashboard); límite de 10 GB gratis (para una plataforma de juegos puede quedarse corto a largo plazo); no tiene procesamiento de imágenes server-side (resize, formato) sin Cloudflare Images aparte. |
| AWS S3 | Servicio más maduro; features avanzados (Lifecycle, Replication, Object Lock, S3 Select); amplio ecosistema de herramientas. | Cobra por egreso (~$0.09/GB); el costo se dispara con tráfico de juegos; configuración más compleja para CDN (hay que añadir CloudFront). |
| Supabase Storage | Integrado con Supabase (un solo proveedor ya usado para DB); políticas de acceso (RLS) basadas en autenticación. | Solo 1 GB gratis; el egreso comparte cuota con la base de datos; no está diseñado para alta throughput de archivos estáticos; límites de tasa restrictivos en plan gratuito. |
| Vercel Blob | Integración nativa con Next.js/Vercel; API simplificada; edge storage. | Producto relativamente nuevo; menos madurez; precio por egreso; sin CDN propia (usa la de Vercel); límites en plan gratuito (1 GB). |

## Consecuencias

### Positivas

- **Egreso gratuito:** no hay costo por ancho de salida, que es el principal factor de costo en una plataforma de juegos. Cada partida descarga assets sin generar factura.
- **CDN global:** los assets se cachean en los 330+ edge locations de Cloudflare, proporcionando baja latencia incluso en Latinoamérica. La primera solicitud puede ir al origen (R2), pero las siguientes se sirven desde el edge.
- **API S3 compatible:** se usa el SDK estándar de AWS (`@aws-sdk/client-s3`). Si en el futuro se decide migrar a S3 o a cualquier proveedor compatible (MinIO, Backblaze B2), solo cambia el endpoint y las credenciales.
- **Cacheo agresivo:** los assets inmutables (identificados por versión) se cachean por un año con `immutable`, eliminando solicitudes repetidas al origen.
- **Separación de responsabilidades:** los metadatos están en PostgreSQL (ADB-003), los archivos en R2. Cada sistema maneja lo que mejor sabe hacer.

### Negativas / riesgos

- **10 GB de límite gratuito:** aunque es generoso, una plataforma de juegos con múltiples títulos y versiones puede superarlo.
  - *Mitigación:* comprimir assets (sprites optimizados en WebP/AVIF, audio en Opus, builds minificados). Monitorear el uso y planificar la transición a plan pago ($0.015/GB/mes almacenado, sin cargo egreso) cuando se acerque al límite.
- **Sin procesamiento de imágenes server-side:** Cloudflare R2 no redimensiona, recorta o convierte formatos automáticamente (a diferencia de Cloudflare Images o AWS S3 + Lambda).
  - *Mitigación:* pre-procesar las imágenes durante el build del juego (generar múltiples tamaños y formatos) usando un script local y subir versiones ya optimizadas. Para avatares de usuario, procesar en el backend antes de subir a R2.
- **Gestión de credenciales:** un proveedor adicional con sus propias claves de API.
  - *Mitigación:* almacenar las credenciales como variables de entorno en Vercel (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`). No incluir en el repositorio.

**Requisitos relacionados:** RNF-004 (tiempo de carga mediante CDN), RNF-022 (retención de versiones de juegos en R2), RNF-024 (almacenamiento escalable), RNF-016 (portabilidad — API S3 estándar).
