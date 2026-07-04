# ADR-0003 — Base de datos: PostgreSQL + Prisma ORM

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

La plataforma Matkii Games necesita almacenar datos relacionales con integridad referencial: usuarios, perfiles, juegos, puntuaciones, partidas guardadas, logros, leaderboards y transacciones (suscrpciones, microtransacciones). Las consultas involucran relaciones entre varias tablas (usuario → partidas → puntuaciones → leaderboard), lo que exige un motor relacional con soporte ACID.

Además, el tipado estático es una prioridad: el equipo usa TypeScript en frontend y backend (Next.js API Routes), y se desea extender el tipado hasta la capa de base de datos para eliminar errores de discrepancia entre el esquema y el código. Las migraciones deben ser declarativas, versionadas y aplicables tanto en desarrollo como en producción sin intervención manual.

El equipo tiene experiencia previa con PostgreSQL y valora su madurez, su soporte de tipos avanzados (`jsonb`, `array`) y su rendimiento en consultas analíticas (window functions para leaderboards). La base de datos se alojará en Supabase (ver ADR-006), que ofrece PostgreSQL gestionado con 500 MB gratuitos.

## Decisión

Se adopta **PostgreSQL** como motor de base de datos relacional, con **Prisma ORM** como capa de acceso a datos y gestión de migraciones.

El esquema se define en `prisma/schema.prisma` y se genera el cliente TypeScript automáticamente. Las migraciones se versionan en `prisma/migrations/` y se aplican mediante `prisma migrate deploy` en producción.

```prisma
// prisma/schema.prisma (extracto representativo)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  image     String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  scores    Score[]
  games     Game[]
}

model Game {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String?
  category    Category @default(UNCATEGORIZED)
  version     String   @default("1.0.0")
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author   User    @relation(fields: [authorId], references: [id])
  authorId String
  scores   Score[]
}

model Score {
  id        String   @id @default(cuid())
  value     Int
  metadata  Json?    @default("{}")
  createdAt DateTime @default(now())

  game   Game   @relation(fields: [gameId], references: [id])
  gameId String
  user   User   @relation(fields: [userId], references: [id])
  userId String

  @@unique([gameId, userId, createdAt])
  @@index([gameId, value(sort: Desc)])
}

enum Role {
  USER
  ADMIN
}

enum Category {
  UNCATEGORIZED
  PLATFORM
  PUZZLE
  SHOOTER
  RACING
  ACTION
  STRATEGY
}
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **PostgreSQL + Prisma ORM** (elegida) | Tipado automático (generación de tipos TypeScript); migraciones declarativas con `prisma migrate`; integración nativa con Next.js via `@prisma/nextjs-monorepo-workaround-plugin`; studio visual (`prisma studio`); schema como fuente de verdad única. | Overhead en consultas complejas con `join` muy anidados (Prisma genera SQL genérico); el cliente añade ~3 MB al bundle serverless; las transacciones interactivas requieren sintaxis específica. |
| PostgreSQL + Drizzle ORM | Más ligero que Prisma (~0 KB runtime); SQL-like; tipado con inferencia. | Ecosistema más pequeño; menos maduro para migraciones; documentación limitada; el equipo no tiene experiencia previa. |
| MySQL + Prisma ORM | Similar a PostgreSQL en features; ampliamente soportado en hosting compartido. | Menor soporte de tipos avanzados (sin `jsonb` nativo, sin arrays); menor rendimiento en window functions; limitado en Supabase (no hay MySQL). |
| SQLite + Prisma ORM | Cero configuración; archivo local sin servidor; ideal para desarrollo. | No escala horizontalmente; sin concurrencia de escritura; no soportado en Supabase; límite de 1 GB y sin replicación. |

## Consecuencias

### Positivas

- **Tipado completo:** cualquier cambio en `schema.prisma` genera tipos TypeScript que se actualizan en toda la base de código. Una columna renombrada produce un error de compilación si no se actualiza el código que la usa.
- **Migraciones declarativas:** `prisma migrate dev` genera archivos SQL versionados automáticamente a partir del schema. En producción, `prisma migrate deploy` aplica solo las migraciones pendientes, sin riesgo de error humano.
- **Integración con Next.js:** Prisma se integra mediante patrón Singleton para evitar múltiples conexiones en desarrollo (hot reload). El cliente se instancia una vez y se reutiliza en todas las API Routes.
- **Studio integrado:** `prisma studio` proporciona una interfaz gráfica para inspeccionar y modificar datos durante desarrollo, acelerando la depuración.
- **PostgreSQL madurez:** ACID, índices parciales, `jsonb` para metadatos flexibles (por ejemplo, parámetros de juego, configuración de partida), window functions para leaderboards óptimos.

### Negativas / riesgos

- **Overhead en consultas complejas:** Prisma traduce las consultas a SQL genérico. Para `join` con muchas tablas, subconsultas anidadas o agregaciones complejas, el SQL generado puede ser subóptimo.
  - *Mitigación:* usar `prisma.$queryRaw` para consultas SQL nativas en operaciones críticas (leaderboards con window functions, reportes analíticos). Para el 95 % de las consultas CRUD, Prisma es suficientemente rápido.
- **Tamaño del cliente Prisma:** ~3 MB que se incluyen en el bundle de las funciones serverless de Vercel.
  - *Mitigación:* Prisma ya optimiza el bundle excluyendo el engine de C dependiendo del runtime. Usar `binaryTargets = ["native"]` en schema para reducir el tamaño. Además, Vercel permite funciones de hasta 50 MB, por lo que 3 MB es aceptable.
- **Conexiones simultáneas:** Prisma usa un pool de conexiones; en el plan gratuito de Supabase hay un límite de conexiones simultáneas.
  - *Mitigación:* configurar `connection_limit` en la URL de conexión y usar el patrón Singleton con lazy initialization. Para producción, actualizar a plan pago de Supabase.

**Requisitos relacionados:** RNF-009 (consistencia de datos), RNF-024 (capacidad de almacenamiento), RNF-015 (mantenibilidad del esquema), RN-012 (versionado de datos de juego), RN-013 (no eliminación de registros históricos).
