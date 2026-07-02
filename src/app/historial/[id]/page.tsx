import Link from 'next/link';
import { notFound } from 'next/navigation';

import { obtenerDetalleAction } from '@/actions/negociaciones/obtener-detalle.action';
import { ResultadoCard } from '@/components/negociacion/resultado-card';
import { buttonClassName } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Header } from '@/components/ui/header';
import { Section } from '@/components/ui/section';

export const dynamic = 'force-dynamic';

export default async function DetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detalle = await obtenerDetalleAction(id);

  if (!detalle.success) {
    if (detalle.error.code === 'NEGOCIACION_INEXISTENTE') {
      notFound();
    }
    return (
      <Section>
        <Header title="Detalle" />
        <ErrorMessage message={detalle.error.message} />
      </Section>
    );
  }

  const { negociacion, ofertas, resultado } = detalle.data;

  return (
    <Section>
      <Header title="Detalle de la negociación" subtitle="Solo lectura." />
      <ResultadoCard
        referencia={negociacion.codigo}
        fecha={negociacion.fechaRevelacion ?? negociacion.fechaCreacion}
        ofertas={ofertas}
        calculo={resultado}
      />
      <div>
        <Link
          href="/historial"
          className={buttonClassName({ variante: 'secundario' })}
        >
          Volver al historial
        </Link>
      </div>
    </Section>
  );
}
