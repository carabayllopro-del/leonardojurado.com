import 'server-only';

/**
 * Error público de la capa de datos.
 *
 * Nunca contiene detalles internos de PostgreSQL: el `code` es una categoría
 * estable que la capa de Services puede mapear a su propia semántica, y el
 * error original queda en `cause` solo para logging del lado del servidor.
 */
export type RepositoryErrorCode = 'CONFLICT' | 'INVALID' | 'UNKNOWN';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(
    code: RepositoryErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

// SQLSTATE de PostgreSQL → categoría pública.
const SQLSTATE_TO_CODE: Record<string, RepositoryErrorCode> = {
  '23505': 'CONFLICT', // unique_violation
  '23503': 'INVALID', // foreign_key_violation
  '23514': 'INVALID', // check_violation
  '23502': 'INVALID', // not_null_violation
};

const MENSAJE: Record<RepositoryErrorCode, string> = {
  CONFLICT: 'El registro entra en conflicto con datos existentes.',
  INVALID: 'Los datos proporcionados no son válidos.',
  UNKNOWN: 'No se pudo completar la operación de base de datos.',
};

function sqlStateDe(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/**
 * Envuelve una consulta de Drizzle: captura cualquier error de PostgreSQL,
 * lo registra íntegro en el servidor y lo re-lanza saneado como
 * `RepositoryError`. Centraliza el manejo de errores de todos los repositories.
 */
export async function runQuery<T>(
  operacion: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof RepositoryError) throw error;

    const code = SQLSTATE_TO_CODE[sqlStateDe(error) ?? ''] ?? 'UNKNOWN';
    console.error(`[repository] ${operacion} falló:`, error);
    throw new RepositoryError(code, MENSAJE[code], { cause: error });
  }
}
