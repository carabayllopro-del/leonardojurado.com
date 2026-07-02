import 'server-only';

import { z } from 'zod';

/**
 * Centralised, validated access to server-side environment variables.
 *
 * Importing `server-only` guarantees this module (and the secrets it holds)
 * can never be bundled into client-side code. Add public, browser-safe
 * variables (prefixed with NEXT_PUBLIC_) in a separate module when needed.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL es obligatoria.')
    .refine(
      (value) => /^postgres(ql)?:\/\//i.test(value),
      'DATABASE_URL debe ser una cadena de conexión PostgreSQL (postgres:// o postgresql://).',
    ),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  throw new Error(
    `Invalid environment variables. Check your .env.local file:\n${details}`,
  );
}

export const env = parsed.data;
