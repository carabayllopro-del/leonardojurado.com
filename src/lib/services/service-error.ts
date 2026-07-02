/**
 * Error de dominio de la capa de negocio.
 *
 * `code` identifica la situación de negocio de forma estable, para que las
 * futuras Server Actions puedan mapearlo a una respuesta clara sin exponer
 * detalles internos (ni de PostgreSQL ni de los repositories).
 */
export type ServiceErrorCode =
  | 'NEGOCIACION_INEXISTENTE'
  | 'NEGOCIACION_REVELADA'
  | 'NEGOCIACION_CANCELADA'
  | 'NEGOCIACION_COMPLETA'
  | 'OFERTAS_INSUFICIENTES'
  | 'NOMBRE_INVALIDO'
  | 'MONTO_INVALIDO'
  | 'CODIGO_NO_DISPONIBLE';

const MENSAJES: Record<ServiceErrorCode, string> = {
  NEGOCIACION_INEXISTENTE: 'La negociación no existe.',
  NEGOCIACION_REVELADA: 'La negociación ya fue revelada.',
  NEGOCIACION_CANCELADA: 'La negociación está cancelada.',
  NEGOCIACION_COMPLETA: 'La negociación ya alcanzó el máximo de ofertas.',
  OFERTAS_INSUFICIENTES: 'La negociación no tiene las dos ofertas necesarias.',
  NOMBRE_INVALIDO: 'El nombre no es válido.',
  MONTO_INVALIDO: 'El monto no es válido.',
  CODIGO_NO_DISPONIBLE:
    'No se pudo generar un código único para la negociación.',
};

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message?: string) {
    super(message ?? MENSAJES[code]);
    this.name = 'ServiceError';
    this.code = code;
  }
}
