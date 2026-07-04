# ADR-0007 — Autenticación: NextAuth.js v5 (Auth.js)

**Estado:** Aceptada
**Fecha:** Julio 2026
**Decisor:** Steven R. Quiñones (CTO)

## Contexto

Matkii Games Platform requiere un sistema de autenticación que soporte múltiples proveedores (credentials con email/contraseña, Google OAuth, GitHub OAuth), sesiones persistentes para usuarios registrados y modo invitado para jugadores que quieran probar juegos sin registrarse.

La plataforma necesita control de acceso basado en roles (RBAC) para distinguir entre usuarios normales, administradores y (en el futuro) desarrolladores de juegos. Las rutas protegidas incluyen el dashboard de perfil, el panel de administración y la subida de juegos.

Next.js App Router requiere integración con el sistema de middleware para proteger rutas y redirigir a páginas de login. Además, SSR y Server Components necesitan acceder a la sesión del usuario desde el servidor.

NextAuth.js v5 (rebautizado como Auth.js) es la solución de autenticación más adoptada en el ecosistema Next.js. Su v5 se ha reescrito para App Router, ofreciendo integración nativa con Server Components, Route Handlers y Edge Runtime. Incluye un adapter para Prisma que sincroniza usuarios y sesiones con la base de datos PostgreSQL.

## Decisión

Se adopta **NextAuth.js v5 (Auth.js)** como sistema de autenticación, con **Prisma adapter** para sincronizar con PostgreSQL. Se configuran tres proveedores: Credentials (email + contraseña), Google y GitHub.

```typescript
// src/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/server/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
})
```

```typescript
// src/middleware.ts
export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*'],
}
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **NextAuth.js v5 (Auth.js)** (elegida) | Integración nativa con App Router (Server Components, Route Handlers, middleware); adapter Prisma oficial; soporta múltiples proveedores; JWT o database sessions; gran comunidad y documentación. | Credentials provider requiere implementación manual de verificación (bcrypt, rate limiting); el adapter Prisma tiene comportamiento no obvio con sesiones en database. |
| Clerk | Autenticación como servicio (menos código); UI components pre-construidos (SignIn, SignUp, UserButton); MFA, passkeys, webhooks. | Lock-in significativo (el esquema de usuarios y organizaciones es propiedad de Clerk); difícil migrar a futuro; tier gratuito limitado (5000 MAU); no hay adapter Prisma oficial. |
| Supabase Auth | Integrado con Supabase (ya usado para DB); Row Level Security (RLS); autenticación social y magic links. | Las sesiones se gestionan en Supabase, no en el adapter de Prisma, duplicando la fuente de verdad de usuarios; sincronización manual entre auth.users y tabla pública users; mayor complejidad de setup con Next.js. |
| Firebase Authentication | Ampliamente usado; múltiples proveedores; SDK maduro. | Ecosistema diferente al stack (Google Cloud vs Vercel/Next.js); las sesiones se gestionan en Firebase, no en Prisma; mayor latencia (servidores en USA); no hay integración nativa con App Router. |

## Consecuencias

### Positivas

- **Integración completa con App Router:** las funciones `auth()`, `signIn()` y `signOut()` funcionan en Server Components, Route Handlers y middleware. No hay que construir endpoints de API para auth.
- **Middleware de protección:** una línea (`export { auth as middleware }`) protege todas las rutas del matcher. Las rutas no protegidas redirigen automáticamente a `/login`.
- **Prisma adapter nativo:** los usuarios, cuentas y sesiones se almacenan en las mismas tablas PostgreSQL que el resto de datos. La relación entre un usuario y sus puntuaciones/partidas es directa (foreign key).
- **Múltiples proveedores:** los usuarios pueden registrarse con email (+ verificación), Google o GitHub. El adapter Prisma gestiona la vinculación de cuentas (una persona puede tener email + Google asociados a la misma cuenta).
- **JWT sessions:** se usa JWT en lugar de sesiones en base de datos, evitando consultas adicionales a PostgreSQL en cada request. El token JWT incluye el rol del usuario, accesible en middleware y Server Components sin tocar la base de datos.

### Negativas / riesgos

- **Credentials provider manual:** a diferencia de OAuth, el provider de email/contraseña requiere implementar la verificación manual con bcrypt, rate limiting y, opcionalmente, verificación de email.
  - *Mitigación:* bcrypt es estándar y bien conocido. Implementar rate limiting con un middleware personalizado (por ejemplo, 5 intentos por minuto). Para verificación de email, usar el flujo de tokens de Auth.js o enviar un correo con un enlace de verificación que actualice `emailVerified` en la tabla User.
- **Adapter Prisma y sesiones en base de datos:** cuando se usa `strategy: 'database'`, el adapter Prisma crea una sesión por cada inicio de sesión, pero las sesiones no se limpian automáticamente.
  - *Mitigación:* usar `strategy: 'jwt'` (más rápido y sin sesiones huérfanas). Solo usar database sessions si se requiere revocación de sesión inmediata.
- **Edge Runtime incompatibilidades:** algunos providers y el adapter Prisma no son compatibles con Edge Runtime (middleware en edge).
  - *Mitigación:* el middleware de Auth.js v5 funciona en Edge, pero si se necesita acceder a Prisma en middleware, hay que mover la lógica a un Route Handler. La configuración por defecto (middleware de redirección) no necesita Prisma.

**Requisitos relacionados:** RF-001 (registro), RF-004 (inicio de sesión), RF-007 (roles y permisos), RN-002 (aceptación términos), RN-010 (MFA en operaciones sensibles — a implementar con un segundo factor vía NextAuth).
