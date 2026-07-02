import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit is a CLI that runs outside the Next.js runtime, so it needs the
// environment loaded explicitly. We read from `.env.local` (the same file the
// app uses in development).
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.',
  );
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  // Only manage the application schema; never touch `public` or system schemas.
  schemaFilter: ['leonardojurado.com'],
  strict: true,
  verbose: true,
});
