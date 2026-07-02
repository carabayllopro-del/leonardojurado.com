import { Card } from '@/components/ui/card';
import { formatFecha, formatMonto, formatPorcentaje } from '@/lib/format';
import type { CalculoOfertas } from '@/lib/services/negotiation.service';
import type { Oferta } from '@/types/oferta';

interface ResultadoCardProps {
  referencia: string;
  fecha: Date;
  ofertas: Oferta[];
  calculo: CalculoOfertas | null;
}

export function ResultadoCard({
  referencia,
  fecha,
  ofertas,
  calculo,
}: ResultadoCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            Referencia
          </span>
          <span className="font-mono text-sm text-neutral-900">
            {referencia}
          </span>
          <span className="text-sm text-neutral-500">{formatFecha(fecha)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ofertas.map((oferta, indice) => (
            <div
              key={oferta.id}
              className="rounded-xl border border-neutral-200 p-4"
            >
              <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                Participante {indice + 1}
              </span>
              <p className="mt-1 text-base font-medium text-neutral-900">
                {oferta.nombre}
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                {formatMonto(oferta.monto)}
              </p>
            </div>
          ))}
        </div>

        {calculo ? (
          <dl className="grid grid-cols-1 gap-3 border-t border-neutral-100 pt-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                Diferencia
              </dt>
              <dd className="text-base font-medium text-neutral-900">
                {formatMonto(calculo.diferencia)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                Promedio
              </dt>
              <dd className="text-base font-medium text-neutral-900">
                {formatMonto(calculo.promedio)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                Diferencia %
              </dt>
              <dd className="text-base font-medium text-neutral-900">
                {formatPorcentaje(calculo.porcentaje)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="border-t border-neutral-100 pt-5 text-sm text-neutral-500">
            El resultado estará disponible cuando se registren las dos ofertas.
          </p>
        )}
      </div>
    </Card>
  );
}
