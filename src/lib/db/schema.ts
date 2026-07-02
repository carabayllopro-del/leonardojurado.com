import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * All application tables live in the `leonardojurado.com` PostgreSQL schema.
 * The name contains a dot, so it must always be quoted at the SQL level —
 * Drizzle handles that automatically for every table declared through
 * `appSchema.table(...)`.
 */
export const appSchema = pgSchema('leonardojurado.com');

/**
 * Allowed values for `negociaciones.estado`. Kept as a single source of truth
 * so application code and the CHECK constraint stay in sync.
 */
export const ESTADOS_NEGOCIACION = [
  'pendiente',
  'una_oferta',
  'completa',
  'revelada',
  'cancelada',
] as const;

export type EstadoNegociacion = (typeof ESTADOS_NEGOCIACION)[number];

// ---------------------------------------------------------------------------
// negociaciones
// ---------------------------------------------------------------------------

export const negociaciones = appSchema.table(
  'negociaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 255 }).notNull().unique(),
    estado: varchar('estado', { length: 20 }).notNull(),
    fechaCreacion: timestamp('fecha_creacion', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    fechaRevelacion: timestamp('fecha_revelacion', {
      withTimezone: true,
      mode: 'date',
    }),
  },
  (table) => [
    // Restrict `estado` to the known set of values at the database level.
    check(
      'negociaciones_estado_check',
      sql`${table.estado} in ('pendiente', 'una_oferta', 'completa', 'revelada', 'cancelada')`,
    ),
    // `codigo` already has a UNIQUE index from `.unique()`, so we only add a
    // dedicated index for the non-unique lookup column `estado`.
    index('negociaciones_estado_idx').on(table.estado),
  ],
);

// ---------------------------------------------------------------------------
// ofertas
// ---------------------------------------------------------------------------

export const ofertas = appSchema.table(
  'ofertas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    negociacionId: uuid('negociacion_id')
      .notNull()
      .references(() => negociaciones.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    // NUMERIC(12,2) keeps monetary amounts exact (no floating-point rounding).
    monto: numeric('monto', { precision: 12, scale: 2 }).notNull(),
    revelada: boolean('revelada').notNull().default(false),
    fechaRegistro: timestamp('fecha_registro', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    ipHash: varchar('ip_hash', { length: 255 }),
    userAgent: text('user_agent'),
  },
  (table) => [
    check('ofertas_monto_check', sql`${table.monto} > 0`),
    index('ofertas_negociacion_id_idx').on(table.negociacionId),
  ],
);

// ---------------------------------------------------------------------------
// Relations (Drizzle relational queries)
// ---------------------------------------------------------------------------

export const negociacionesRelations = relations(negociaciones, ({ many }) => ({
  ofertas: many(ofertas),
}));

export const ofertasRelations = relations(ofertas, ({ one }) => ({
  negociacion: one(negociaciones, {
    fields: [ofertas.negociacionId],
    references: [negociaciones.id],
  }),
}));

// ---------------------------------------------------------------------------
// Inferred types (handy for the data/service layer)
// ---------------------------------------------------------------------------

export type Negociacion = typeof negociaciones.$inferSelect;
export type NuevaNegociacion = typeof negociaciones.$inferInsert;
export type Oferta = typeof ofertas.$inferSelect;
export type NuevaOferta = typeof ofertas.$inferInsert;
