import { obtenerDetalleAction } from '@/actions/negociaciones/obtener-detalle.action';
import { obtenerHistorialAction } from '@/actions/negociaciones/obtener-historial.action';
import { HistorialList } from '@/components/negociacion/historial-list';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { Header } from '@/components/ui/header';
import { Section } from '@/components/ui/section';

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
  const historial = await obtenerHistorialAction();

  if (!historial.success) {
    return (
      <Section>
        <Header title="Historial" />
        <ErrorMessage message={historial.error.message} />
      </Section>
    );
  }

  const detalles = await Promise.all(
    historial.data.map((negociacion) => obtenerDetalleAction(negociacion.id)),
  );
  const items = detalles.flatMap((detalle) =>
    detalle.success ? [detalle.data] : [],
  );

  return (
    <Section>
      <Header
        title="Historial"
        subtitle="Negociaciones registradas, de la más reciente a la más antigua."
      />
      {items.length === 0 ? (
        <EmptyState
          title="Todavía no hay negociaciones"
          description="Crea tu primera negociación desde el inicio."
        />
      ) : (
        <HistorialList items={items} />
      )}
    </Section>
  );
}
