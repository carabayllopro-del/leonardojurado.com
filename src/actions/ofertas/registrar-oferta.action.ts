'use server';

import {
  registrarOfertaInputSchema,
  type RegistrarOfertaActionInput,
} from '@/actions/action-input';
import { ejecutarConEntrada, type ActionResult } from '@/actions/action-result';
import { NegotiationService } from '@/lib/services/negotiation.service';
import type { Negociacion } from '@/types/negociacion';

export async function registrarOfertaAction(
  input: RegistrarOfertaActionInput,
): Promise<ActionResult<Negociacion>> {
  return ejecutarConEntrada(registrarOfertaInputSchema, input, (datos) =>
    NegotiationService.registrarOferta(
      datos.negociacionId,
      datos.nombre,
      datos.monto,
    ),
  );
}
