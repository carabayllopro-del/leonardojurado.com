CREATE TABLE "leonardojurado.com"."negociaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" varchar(255) NOT NULL,
	"estado" varchar(20) NOT NULL,
	"fecha_creacion" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_revelacion" timestamp with time zone,
	CONSTRAINT "negociaciones_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "negociaciones_estado_check" CHECK ("leonardojurado.com"."negociaciones"."estado" in ('pendiente', 'una_oferta', 'completa', 'revelada', 'cancelada'))
);
--> statement-breakpoint
CREATE TABLE "leonardojurado.com"."ofertas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negociacion_id" uuid NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"revelada" boolean DEFAULT false NOT NULL,
	"fecha_registro" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" varchar(255),
	"user_agent" text,
	CONSTRAINT "ofertas_monto_check" CHECK ("leonardojurado.com"."ofertas"."monto" > 0)
);
--> statement-breakpoint
ALTER TABLE "leonardojurado.com"."ofertas" ADD CONSTRAINT "ofertas_negociacion_id_negociaciones_id_fk" FOREIGN KEY ("negociacion_id") REFERENCES "leonardojurado.com"."negociaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "negociaciones_estado_idx" ON "leonardojurado.com"."negociaciones" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "ofertas_negociacion_id_idx" ON "leonardojurado.com"."ofertas" USING btree ("negociacion_id");