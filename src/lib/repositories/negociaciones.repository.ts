import 'server-only';

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { negociaciones } from '@/lib/db/schema';
import { runQuery } from '@/lib/repositories/repository-error';
import type {
  CrearNegociacionInput,
  EstadoNegociacion,
  Negociacion,
} from '@/types/negociacion';

export function crearNegociacion(
  input: CrearNegociacionInput,
): Promise<Negociacion> {
  return runQuery('crearNegociacion', async () => {
    const [row] = await db.insert(negociaciones).values(input).returning();
    return row;
  });
}

export function obtenerPorCodigo(codigo: string): Promise<Negociacion | null> {
  return runQuery('obtenerPorCodigo', async () => {
    const [row] = await db
      .select()
      .from(negociaciones)
      .where(eq(negociaciones.codigo, codigo))
      .limit(1);
    return row ?? null;
  });
}

export function obtenerPorId(id: string): Promise<Negociacion | null> {
  return runQuery('obtenerPorId', async () => {
    const [row] = await db
      .select()
      .from(negociaciones)
      .where(eq(negociaciones.id, id))
      .limit(1);
    return row ?? null;
  });
}

export function cambiarEstado(
  id: string,
  estado: EstadoNegociacion,
): Promise<Negociacion | null> {
  return runQuery('cambiarEstado', async () => {
    const [row] = await db
      .update(negociaciones)
      .set({ estado })
      .where(eq(negociaciones.id, id))
      .returning();
    return row ?? null;
  });
}

export function revelarNegociacion(id: string): Promise<Negociacion | null> {
  return runQuery('revelarNegociacion', async () => {
    const [row] = await db
      .update(negociaciones)
      .set({ estado: 'revelada', fechaRevelacion: sql`now()` })
      .where(eq(negociaciones.id, id))
      .returning();
    return row ?? null;
  });
}

export function listarHistorial(): Promise<Negociacion[]> {
  return runQuery('listarHistorial', async () =>
    db.select().from(negociaciones).orderBy(desc(negociaciones.fechaCreacion)),
  );
}

export function eliminarNegociacion(id: string): Promise<boolean> {
  return runQuery('eliminarNegociacion', async () => {
    const rows = await db
      .delete(negociaciones)
      .where(eq(negociaciones.id, id))
      .returning({ id: negociaciones.id });
    return rows.length > 0;
  });
}
