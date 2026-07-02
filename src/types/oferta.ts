export type { Oferta } from '@/lib/db/schema';

/**
 * Datos requeridos para registrar una oferta.
 * `monto` es string: Drizzle mapea NUMERIC(12,2) a string para no perder precisión.
 */
export interface RegistrarOfertaInput {
  negociacionId: string;
  nombre: string;
  monto: string;
  ipHash?: string | null;
  userAgent?: string | null;
}
