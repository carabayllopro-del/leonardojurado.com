import { z } from 'zod';

/**
 * Validadores de entrada (Zod) para las ofertas.
 * Única fuente de verdad de estas reglas; los Services los reutilizan.
 */

export const nombreSchema = z
  .string()
  .trim()
  .min(1, 'El nombre no puede estar vacío.')
  .max(100, 'El nombre no puede superar los 100 caracteres.');

export const montoSchema = z
  .union([z.string(), z.number()])
  .transform((valor) =>
    typeof valor === 'number' ? valor.toString() : valor.trim(),
  )
  .refine(
    (valor) => /^\d+(\.\d{1,2})?$/.test(valor),
    'El monto debe ser un número con máximo dos decimales.',
  )
  .refine((valor) => Number(valor) > 0, 'El monto debe ser mayor que cero.');
