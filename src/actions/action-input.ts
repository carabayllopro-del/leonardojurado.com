import { z } from 'zod';

/**
 * Esquemas de ESTRUCTURA de entrada de las Server Actions (presencia y tipos).
 * No contienen reglas de negocio: la validación de contenido de `nombre` y
 * `monto` vive en los validators/services y no se duplica aquí.
 */

export const negociacionIdSchema = z
  .string()
  .min(1, 'El identificador de la negociación es obligatorio.');

export const registrarOfertaInputSchema = z.object({
  negociacionId: negociacionIdSchema,
  nombre: z.string(),
  monto: z.union([z.string(), z.number()]),
});

export type RegistrarOfertaActionInput = z.infer<
  typeof registrarOfertaInputSchema
>;

export const iniciarNegociacionInputSchema = z.object({
  nombre: z.string(),
  monto: z.union([z.string(), z.number()]),
});

export type IniciarNegociacionActionInput = z.infer<
  typeof iniciarNegociacionInputSchema
>;
