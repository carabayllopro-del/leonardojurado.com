'use server';

import { negociacionIdSchema } from '@/actions/action-input';
import { ejecutarConEntrada, type ActionResult } from '@/actions/action-result';
import {
  NegotiationService,
  type ResultadoNegociacion,
} from '@/lib/services/negotiation.service';

export async function revelarNegociacionAction(
  negociacionId: string,
): Promise<ActionResult<ResultadoNegociacion>> {
  return ejecutarConEntrada(negociacionIdSchema, negociacionId, (id) =>
    NegotiationService.revelarNegociacion(id),
  );
}
