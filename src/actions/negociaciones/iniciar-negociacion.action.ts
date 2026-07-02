'use server';

import {
  iniciarNegociacionInputSchema,
  type IniciarNegociacionActionInput,
} from '@/actions/action-input';
import { ejecutarConEntrada, type ActionResult } from '@/actions/action-result';
import { NegotiationService } from '@/lib/services/negotiation.service';
import type { Negociacion } from '@/types/negociacion';

export async function iniciarNegociacionAction(
  input: IniciarNegociacionActionInput,
): Promise<ActionResult<Negociacion>> {
  return ejecutarConEntrada(iniciarNegociacionInputSchema, input, (datos) =>
    NegotiationService.iniciarNegociacion(datos.nombre, datos.monto),
  );
}
