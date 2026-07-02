# leonardojurado.com

Base inicial de un proyecto profesional, limpia y preparada para desarrollar.
No incluye lógica de negocio: es el punto de partida para construir sobre él.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL)
- **Drizzle ORM** + **drizzle-kit**
- **Zod** (validación)
- **ESLint** + **Prettier**
- **npm**

## Estructura del proyecto

```
.
├── drizzle/                 # Migraciones generadas por drizzle-kit (SQL + snapshots)
├── public/                  # Archivos estáticos
├── src/
│   ├── app/                 # App Router (rutas, layouts, páginas)
│   │   ├── api/             # API Route Handlers (se crean cuando hagan falta)
│   │   ├── globals.css      # Entrada de Tailwind CSS v4
│   │   ├── layout.tsx       # Layout raíz
│   │   └── page.tsx         # Página principal (Server Component)
│   ├── components/          # Componentes de UI
│   │   └── ui/              # Piezas de interfaz reutilizables
│   ├── lib/                 # Núcleo compartido (no visual)
│   │   ├── db/
│   │   │   ├── index.ts     # Cliente centralizado de base de datos (solo servidor)
│   │   │   └── schema.ts    # Esquema de Drizzle (aún sin tablas)
│   │   └── env.ts           # Validación de variables de entorno con Zod (solo servidor)
│   ├── services/            # Lógica de negocio / casos de uso
│   └── types/               # Tipos e interfaces compartidos
├── drizzle.config.ts        # Configuración de drizzle-kit
├── eslint.config.mjs        # ESLint (flat config)
├── next.config.ts
├── postcss.config.mjs       # Tailwind v4 vía PostCSS
├── tsconfig.json            # Incluye el alias @/* → ./src/*
└── .env.example             # Plantilla de variables de entorno
```

### Separación de responsabilidades

- **`app/`** → rutas, layouts y páginas. Por defecto son **Server Components**.
- **`components/`** → UI reutilizable. Añade `"use client"` solo cuando necesites interactividad.
- **`services/`** → casos de uso / lógica de negocio. Orquestan y llaman a la capa de datos.
- **`lib/db/`** → **único** punto de acceso a la base de datos (solo servidor).
- **`lib/env.ts`** → acceso validado y tipado a las variables de entorno (solo servidor).
- **`types/`** → tipos compartidos.

## Requisitos previos

- **Node.js 20+**
- **npm**
- **PostgreSQL** local en ejecución (o un proyecto de **Supabase** para producción).

## Ejecutar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno y completarlo
cp .env.example .env.local
# edita .env.local y coloca tu DATABASE_URL

# 3. Levantar el servidor de desarrollo
npm run dev
```

La app queda en http://localhost:3000.

### Scripts disponibles

| Script                 | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                        |
| `npm run build`        | Build de producción                           |
| `npm run start`        | Sirve el build de producción                  |
| `npm run lint`         | ESLint                                        |
| `npm run format`       | Formatea con Prettier                         |
| `npm run format:check` | Verifica formato sin escribir                 |
| `npm run typecheck`    | Comprueba tipos con `tsc --noEmit`            |
| `npm run db:generate`  | Genera una migración a partir del esquema     |
| `npm run db:migrate`   | Aplica las migraciones pendientes             |
| `npm run db:push`      | Sincroniza el esquema con la BD (útil en dev) |
| `npm run db:studio`    | Abre Drizzle Studio                           |

## Base de datos local (desarrollo)

El proyecto está conectado a un PostgreSQL local:

- **Servidor:** `localhost:5432`
- **Base de datos:** `leonardojurado`
- **Esquema de la aplicación:** `leonardojurado.com` — todas las tablas viven aquí.

La conexión se define en `.env.local` (git-ignored):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leonardojurado"
```

El esquema se declara en `src/lib/db/schema.ts` con `pgSchema('leonardojurado.com')`,
y `drizzle.config.ts` lo acota con `schemaFilter` para no tocar `public`. El
`search_path` por defecto de la base ya apunta a ese esquema, así que también
resolvés nombres sin calificar desde `psql`.

Para recrear la base desde cero en otra máquina:

```bash
createdb leonardojurado
npm run db:migrate   # crea el esquema "leonardojurado.com" (migración 0000)
```

## Configurar Supabase

> Opcional / producción. En local usás el PostgreSQL de la sección anterior.

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → Database → Connection string**.
3. Copia la cadena del **Session pooler** (recomendada: funciona tanto para la
   app como para las migraciones y es compatible con el entorno serverless de
   Vercel). Reemplaza `[YOUR-PASSWORD]` por la contraseña de tu base de datos.
4. Pégala en `.env.local` como `DATABASE_URL`.

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

> El cliente de base de datos usa `prepare: false`, por lo que también es
> compatible con el **Transaction pooler** (puerto `6543`) si más adelante
> necesitas mayor escala. Para ese caso, considera usar una URL directa
> separada para las migraciones.

Nunca expongas esta cadena al cliente: `DATABASE_URL` no lleva el prefijo
`NEXT_PUBLIC_`, y `src/lib/env.ts` / `src/lib/db/index.ts` están marcados como
`server-only`, de modo que jamás llegan al navegador.

## Migraciones con Drizzle

El esquema vive en `src/lib/db/schema.ts`. Las tablas se definen con
`appSchema.table(...)` para que queden dentro del esquema `leonardojurado.com`
(aún no hay ninguna). La migración baseline `0000` solo crea ese esquema
(`CREATE SCHEMA IF NOT EXISTS`), por lo que es segura de re-aplicar.

**Flujo recomendado (con historial de migraciones):**

```bash
# 1. Define tus tablas en src/lib/db/schema.ts
# 2. Genera el SQL de la migración
npm run db:generate

# 3. Aplica las migraciones a la base de datos
npm run db:migrate
```

**Alternativa rápida para desarrollo** (sincroniza el esquema sin generar
archivos de migración; no recomendada para producción):

```bash
npm run db:push
```

Explora los datos con:

```bash
npm run db:studio
```

## Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** e importa el repo.
   Vercel detecta Next.js automáticamente (no requiere configuración especial).
3. En **Settings → Environment Variables**, añade `DATABASE_URL` con el valor de
   tu cadena de conexión de Supabase.
4. Despliega. Los push a la rama principal se despliegan automáticamente.

> Las migraciones **no** se ejecutan en el build de Vercel. Ejecútalas desde tu
> máquina (`npm run db:migrate`) o dentro de tu pipeline de CI/CD.

## Variables de entorno

| Variable       | Ámbito        | Descripción                              |
| -------------- | ------------- | ---------------------------------------- |
| `DATABASE_URL` | Solo servidor | Cadena de conexión a Supabase PostgreSQL |

Reservadas para cuando añadas **Supabase Auth** (ver `.env.example`):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas) y
`SUPABASE_SERVICE_ROLE_KEY` (solo servidor).

## Buenas prácticas para continuar

- **Acceso a datos solo desde el servidor.** Usa siempre `db` desde
  `src/lib/db`. Nunca importes ese módulo en componentes de cliente.
- **Server Components por defecto.** Añade `"use client"` únicamente cuando
  necesites estado, efectos o eventos del navegador.
- **Secretos fuera del cliente.** Solo las variables `NEXT_PUBLIC_*` son
  visibles en el navegador. No guardes datos sensibles en `localStorage`.
- **Valida las entradas con Zod** en los límites del sistema (formularios, API
  Routes, payloads externos).
- **Añade API Routes** creando `src/app/api/<ruta>/route.ts` cuando las
  necesites (webhooks, integraciones, etc.).
- **Mantén las capas separadas:** UI (`components`) → servicios (`services`) →
  datos (`lib/db`). La UI no habla directamente con la base de datos.
- **Antes de commitear:** `npm run lint && npm run typecheck && npm run format:check`.

## Próximos pasos sugeridos

1. Definir las primeras tablas en `src/lib/db/schema.ts` y generar migraciones.
2. Añadir **Supabase Auth** (`@supabase/ssr`) usando las variables ya reservadas.
3. Crear los primeros servicios en `src/services/` y sus API Routes si aplica.
