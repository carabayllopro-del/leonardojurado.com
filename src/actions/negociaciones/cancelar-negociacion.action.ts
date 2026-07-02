'use server';

import { negociacionIdSchema } from '@/actions/action-input';
import { ejecutarConEntrada, type ActionResult } from '@/actions/action-result';
import { NegotiationService } from '@/lib/services/negotiation.service';

export async function cancelarNegociacionAction(
  negociacionId: string,
): Promise<ActionResult<void>> {
  return ejecutarConEntrada(negociacionIdSchema, negociacionId, (id) =>
    NegotiationService.cancelarNegociacion(id),
  );
}
