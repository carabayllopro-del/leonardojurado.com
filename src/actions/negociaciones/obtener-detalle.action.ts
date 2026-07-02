'use server';

import { negociacionIdSchema } from '@/actions/action-input';
import { ejecutarConEntrada, type ActionResult } from '@/actions/action-result';
import {
  NegotiationService,
  type DetalleNegociacion,
} from '@/lib/services/negotiation.service';

export async function obtenerDetalleAction(
  negociacionId: string,
): Promise<ActionResult<DetalleNegociacion>> {
  return ejecutarConEntrada(negociacionIdSchema, negociacionId, (id) =>
    NegotiationService.obtenerDetalle(id),
  );
}
