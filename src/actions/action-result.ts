import type { z } from 'zod';

import { ServiceError } from '@/lib/services/service-error';

/**
 * Contrato uniforme de respuesta de todas las Server Actions.
 * La interfaz nunca recibe excepciones: siempre un objeto discriminado por
 * `success`, sin detalles internos ni errores de PostgreSQL.
 */
export interface ActionError {
  code: string;
  message: string;
}

export type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: ActionError };

function ok<T>(data: T): ActionResult<T> {
  return { success: true, data, error: null };
}

function fail(error: ActionError): ActionResult<never> {
  return { success: false, data: null, error };
}

function primerMensaje(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Entrada inválida.';
}

/** Traduce cualquier excepción a un ActionError sin exponer detalles internos. */
function aActionError(error: unknown): ActionError {
  if (error instanceof ServiceError) {
    return { code: error.code, message: error.message };
  }
  // Errores inesperados (incluidos los de la capa de datos): se registran en el
  // servidor y se devuelven de forma genérica.
  console.error('[action] error inesperado:', error);
  return { code: 'ERROR_INTERNO', message: 'Ocurrió un error inesperado.' };
}

/** Ejecuta una operación del Service y nunca propaga excepciones. */
export async function ejecutar<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return fail(aActionError(error));
  }
}

/** Valida la estructura de entrada y, si es válida, ejecuta la operación. */
export async function ejecutarConEntrada<I, T>(
  schema: z.ZodType<I>,
  entrada: I,
  fn: (entrada: I) => Promise<T>,
): Promise<ActionResult<T>> {
  const parse = schema.safeParse(entrada);
  if (!parse.success) {
    return fail({
      code: 'ENTRADA_INVALIDA',
      message: primerMensaje(parse.error),
    });
  }
  return ejecutar(() => fn(parse.data));
}
