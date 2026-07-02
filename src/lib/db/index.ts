import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/lib/env';
import * as schema from '@/lib/db/schema';

/**
 * Centralised database access.
 *
 * This is the single entry point for talking to the database. Import `db`
 * from here anywhere on the server — never instantiate another client.
 * The `server-only` import above ensures this file can never leak into the
 * browser bundle, so the connection string stays private.
 *
 * `prepare: false` keeps the client compatible with Supabase's connection
 * pooler (Supavisor / PgBouncer in transaction mode).
 */

// Cache the client across hot reloads in development to avoid exhausting the
// database connection pool.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.client ?? postgres(env.DATABASE_URL, { prepare: false });

if (env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
