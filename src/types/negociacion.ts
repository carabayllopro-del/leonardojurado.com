import type { EstadoNegociacion } from '@/lib/db/schema';

export type { Negociacion, EstadoNegociacion } from '@/lib/db/schema';
export { ESTADOS_NEGOCIACION } from '@/lib/db/schema';

/** Datos requeridos para crear una negociación (sin campos con default en BD). */
export interface CrearNegociacionInput {
  codigo: string;
  estado: EstadoNegociacion;
}
