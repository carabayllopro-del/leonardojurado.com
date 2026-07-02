'use server';

import { ejecutar, type ActionResult } from '@/actions/action-result';
import { NegotiationService } from '@/lib/services/negotiation.service';
import type { Negociacion } from '@/types/negociacion';

export async function crearNegociacionAction(): Promise<
  ActionResult<Negociacion>
> {
  return ejecutar(() => NegotiationService.crearNegociacion());
}
