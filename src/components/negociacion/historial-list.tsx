import Link from 'next/link';

import { buttonClassName } from '@/components/ui/button';
import { formatFecha, formatMonto } from '@/lib/format';
import type { DetalleNegociacion } from '@/lib/services/negotiation.service';

export function HistorialList({ items }: { items: DetalleNegociacion[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ negociacion, ofertas, resultado }) => (
        <li
          key={negociacion.id}
          className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm text-neutral-900">
              {negociacion.codigo}
            </span>
            <span className="text-sm text-neutral-500">
              {formatFecha(negociacion.fechaCreacion)}
            </span>
            <span className="text-sm text-neutral-600">
              {ofertas[0]?.nombre ?? '—'} · {ofertas[1]?.nombre ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-sm text-neutral-600">
              {resultado
                ? `Diferencia ${formatMonto(resultado.diferencia)}`
                : 'En curso'}
            </span>
            <Link
              href={`/historial/${negociacion.id}`}
              className={buttonClassName({ variante: 'secundario' })}
            >
              Ver detalle
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
