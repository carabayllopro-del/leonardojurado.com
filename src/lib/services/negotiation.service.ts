import 'server-only';

import { randomBytes } from 'node:crypto';

import { z } from 'zod';

import * as negociacionesRepo from '@/lib/repositories/negociaciones.repository';
import * as ofertasRepo from '@/lib/repositories/ofertas.repository';
import { RepositoryError } from '@/lib/repositories/repository-error';
import { ServiceError } from '@/lib/services/service-error';
import { montoSchema, nombreSchema } from '@/lib/validators/oferta.validator';
import type { EstadoNegociacion, Negociacion } from '@/types/negociacion';
import type { Oferta } from '@/types/oferta';

// ---------------------------------------------------------------------------
// Tipos de salida de la capa de negocio
// ---------------------------------------------------------------------------

export interface CalculoOfertas {
  diferencia: number;
  promedio: number;
  porcentaje: number;
}

export interface ResultadoNegociacion extends CalculoOfertas {
  negociacion: Negociacion;
  ofertas: Oferta[];
  fechaRevelacion: Date | null;
}

export interface DetalleNegociacion {
  negociacion: Negociacion;
  ofertas: Oferta[];
  resultado: CalculoOfertas | null;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
const MAX_OFERTAS = 2;

function generarCodigo(longitud = 8): string {
  const bytes = randomBytes(longitud);
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += ALFABETO_CODIGO[bytes[i] % ALFABETO_CODIGO.length];
  }
  return codigo;
}

function esUuid(valor: string): boolean {
  return z.uuid().safeParse(valor).success;
}

function mensajeZod(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Valor inválido.';
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

async function cargarNegociacion(negociacionId: string): Promise<Negociacion> {
  if (!esUuid(negociacionId)) {
    throw new ServiceError('NEGOCIACION_INEXISTENTE');
  }
  const negociacion = await negociacionesRepo.obtenerPorId(negociacionId);
  if (!negociacion) {
    throw new ServiceError('NEGOCIACION_INEXISTENTE');
  }
  return negociacion;
}

async function cargarOfertasExactas(negociacionId: string): Promise<Oferta[]> {
  const ofertas = await ofertasRepo.obtenerPorNegociacion(negociacionId);
  if (ofertas.length !== MAX_OFERTAS) {
    throw new ServiceError('OFERTAS_INSUFICIENTES');
  }
  return ofertas;
}

/** Cálculos derivados de las dos ofertas. No se persisten: solo se devuelven. */
function calcular(ofertas: Oferta[]): CalculoOfertas {
  const [primera, segunda] = ofertas;
  const montoA = Number(primera.monto);
  const montoB = Number(segunda.monto);

  const diferencia = Math.abs(montoA - montoB);
  const promedio = (montoA + montoB) / 2;
  const porcentaje = promedio === 0 ? 0 : (diferencia / promedio) * 100;

  return {
    diferencia: redondear(diferencia),
    promedio: redondear(promedio),
    porcentaje: redondear(porcentaje),
  };
}

function armarResultado(
  negociacion: Negociacion,
  ofertas: Oferta[],
): ResultadoNegociacion {
  return {
    negociacion,
    ofertas,
    fechaRevelacion: negociacion.fechaRevelacion,
    ...calcular(ofertas),
  };
}

function estadoSegunOfertas(total: number): EstadoNegociacion {
  if (total >= MAX_OFERTAS) return 'completa';
  if (total === 1) return 'una_oferta';
  return 'pendiente';
}

// ---------------------------------------------------------------------------
// Métodos del servicio
// ---------------------------------------------------------------------------

async function crearNegociacion(): Promise<Negociacion> {
  const maxIntentos = 5;
  for (let intento = 0; intento < maxIntentos; intento++) {
    try {
      return await negociacionesRepo.crearNegociacion({
        codigo: generarCodigo(),
        estado: 'pendiente',
      });
    } catch (error) {
      // Reintentar solo ante una colisión de código; cualquier otro error sube.
      if (error instanceof RepositoryError && error.code === 'CONFLICT') {
        continue;
      }
      throw error;
    }
  }
  throw new ServiceError('CODIGO_NO_DISPONIBLE');
}

async function registrarOferta(
  negociacionId: string,
  nombre: string,
  monto: string | number,
): Promise<Negociacion> {
  const negociacion = await cargarNegociacion(negociacionId);

  if (negociacion.estado === 'revelada') {
    throw new ServiceError('NEGOCIACION_REVELADA');
  }
  if (negociacion.estado === 'cancelada') {
    throw new ServiceError('NEGOCIACION_CANCELADA');
  }

  const nombreParse = nombreSchema.safeParse(nombre);
  if (!nombreParse.success) {
    throw new ServiceError('NOMBRE_INVALIDO', mensajeZod(nombreParse.error));
  }

  const montoParse = montoSchema.safeParse(monto);
  if (!montoParse.success) {
    throw new ServiceError('MONTO_INVALIDO', mensajeZod(montoParse.error));
  }

  if ((await ofertasRepo.contarOfertas(negociacionId)) >= MAX_OFERTAS) {
    throw new ServiceError('NEGOCIACION_COMPLETA');
  }

  await ofertasRepo.registrarOferta({
    negociacionId,
    nombre: nombreParse.data,
    monto: montoParse.data,
  });

  const total = await ofertasRepo.contarOfertas(negociacionId);
  const actualizada = await negociacionesRepo.cambiarEstado(
    negociacionId,
    estadoSegunOfertas(total),
  );
  if (!actualizada) {
    throw new ServiceError('NEGOCIACION_INEXISTENTE');
  }
  return actualizada;
}

async function revelarNegociacion(
  negociacionId: string,
): Promise<ResultadoNegociacion> {
  const negociacion = await cargarNegociacion(negociacionId);

  if (negociacion.estado === 'cancelada') {
    throw new ServiceError('NEGOCIACION_CANCELADA');
  }
  if (negociacion.estado === 'revelada') {
    throw new ServiceError('NEGOCIACION_REVELADA');
  }

  const ofertas = await cargarOfertasExactas(negociacionId);

  const actualizada = await negociacionesRepo.revelarNegociacion(negociacionId);
  if (!actualizada) {
    throw new ServiceError('NEGOCIACION_INEXISTENTE');
  }
  return armarResultado(actualizada, ofertas);
}

async function obtenerResultado(
  negociacionId: string,
): Promise<ResultadoNegociacion> {
  const negociacion = await cargarNegociacion(negociacionId);
  const ofertas = await cargarOfertasExactas(negociacionId);
  return armarResultado(negociacion, ofertas);
}

function obtenerHistorial(): Promise<Negociacion[]> {
  return negociacionesRepo.listarHistorial();
}

async function obtenerDetalle(
  negociacionId: string,
): Promise<DetalleNegociacion> {
  const negociacion = await cargarNegociacion(negociacionId);
  const ofertas = await ofertasRepo.obtenerPorNegociacion(negociacionId);
  const resultado = ofertas.length === MAX_OFERTAS ? calcular(ofertas) : null;
  return { negociacion, ofertas, resultado };
}

export const NegotiationService = {
  crearNegociacion,
  registrarOferta,
  revelarNegociacion,
  obtenerResultado,
  obtenerHistorial,
  obtenerDetalle,
};
