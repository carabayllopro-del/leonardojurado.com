import 'server-only';

import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { ofertas } from '@/lib/db/schema';
import { runQuery } from '@/lib/repositories/repository-error';
import type { Oferta, RegistrarOfertaInput } from '@/types/oferta';

export function registrarOferta(input: RegistrarOfertaInput): Promise<Oferta> {
  return runQuery('registrarOferta', async () => {
    const [row] = await db.insert(ofertas).values(input).returning();
    return row;
  });
}

export function obtenerPorNegociacion(
  negociacionId: string,
): Promise<Oferta[]> {
  return runQuery('obtenerPorNegociacion', async () =>
    db
      .select()
      .from(ofertas)
      .where(eq(ofertas.negociacionId, negociacionId))
      .orderBy(asc(ofertas.fechaRegistro)),
  );
}

export function contarOfertas(negociacionId: string): Promise<number> {
  return runQuery('contarOfertas', async () =>
    db.$count(ofertas, eq(ofertas.negociacionId, negociacionId)),
  );
}

export function existeOferta(
  negociacionId: string,
  nombre: string,
): Promise<boolean> {
  return runQuery('existeOferta', async () => {
    const rows = await db
      .select({ id: ofertas.id })
      .from(ofertas)
      .where(
        and(
          eq(ofertas.negociacionId, negociacionId),
          eq(ofertas.nombre, nombre),
        ),
      )
      .limit(1);
    return rows.length > 0;
  });
}

export function eliminarOferta(id: string): Promise<boolean> {
  return runQuery('eliminarOferta', async () => {
    const rows = await db
      .delete(ofertas)
      .where(eq(ofertas.id, id))
      .returning({ id: ofertas.id });
    return rows.length > 0;
  });
}
