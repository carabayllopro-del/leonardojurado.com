'use client';

import { type FormEvent, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { montoSchema, nombreSchema } from '@/lib/validators/oferta.validator';

interface OfertaFormProps {
  onGuardar: (nombre: string, monto: string) => void;
  pendiente: boolean;
}

interface Errores {
  nombre?: string;
  monto?: string;
}

export function OfertaForm({ onGuardar, pendiente }: OfertaFormProps) {
  const nombreId = useId();
  const montoId = useId();
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombreCheck = nombreSchema.safeParse(nombre);
    const montoCheck = montoSchema.safeParse(monto);

    if (!nombreCheck.success || !montoCheck.success) {
      setErrores({
        nombre: nombreCheck.success
          ? undefined
          : nombreCheck.error.issues[0]?.message,
        monto: montoCheck.success
          ? undefined
          : montoCheck.error.issues[0]?.message,
      });
      return;
    }

    setErrores({});
    onGuardar(nombreCheck.data, montoCheck.data);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id={nombreId}
        label="Nombre"
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
        error={errores.nombre}
        autoComplete="off"
        maxLength={100}
        autoFocus
      />
      <Input
        id={montoId}
        label="Monto"
        value={monto}
        onChange={(event) => setMonto(event.target.value)}
        error={errores.monto}
        inputMode="decimal"
        autoComplete="off"
      />
      <Button type="submit" tamano="lg" fullWidth disabled={pendiente}>
        {pendiente ? 'Guardando…' : 'Guardar oferta'}
      </Button>
    </form>
  );
}
