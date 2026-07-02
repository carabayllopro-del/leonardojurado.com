'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { crearNegociacionAction } from '@/actions/negociaciones/crear-negociacion.action';
import { revelarNegociacionAction } from '@/actions/negociaciones/revelar-negociacion.action';
import { registrarOfertaAction } from '@/actions/ofertas/registrar-oferta.action';
import { OfertaForm } from '@/components/negociacion/oferta-form';
import { ResultadoCard } from '@/components/negociacion/resultado-card';
import { Button, buttonClassName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { Header } from '@/components/ui/header';
import { Section } from '@/components/ui/section';
import type { ResultadoNegociacion } from '@/lib/services/negotiation.service';

type Paso =
  | 'inicio'
  | 'crear'
  | 'oferta1'
  | 'oferta1-ok'
  | 'oferta2'
  | 'oferta2-ok'
  | 'resultado';

interface NegociacionActiva {
  id: string;
  codigo: string;
}

export function NegociacionFlow() {
  const [paso, setPaso] = useState<Paso>('inicio');
  const [negociacion, setNegociacion] = useState<NegociacionActiva | null>(
    null,
  );
  const [resultado, setResultado] = useState<ResultadoNegociacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reiniciar() {
    setPaso('inicio');
    setNegociacion(null);
    setResultado(null);
    setError(null);
  }

  function crear() {
    setError(null);
    startTransition(async () => {
      const res = await crearNegociacionAction();
      if (res.success) {
        setNegociacion({ id: res.data.id, codigo: res.data.codigo });
        setPaso('oferta1');
      } else {
        setError(res.error.message);
      }
    });
  }

  function guardarOferta(nombre: string, monto: string, siguiente: Paso) {
    if (!negociacion) return;
    setError(null);
    startTransition(async () => {
      const res = await registrarOfertaAction({
        negociacionId: negociacion.id,
        nombre,
        monto,
      });
      if (res.success) {
        setPaso(siguiente);
      } else {
        setError(res.error.message);
      }
    });
  }

  function revelar() {
    if (!negociacion) return;
    setError(null);
    startTransition(async () => {
      const res = await revelarNegociacionAction(negociacion.id);
      if (res.success) {
        setResultado(res.data);
        setPaso('resultado');
      } else {
        setError(res.error.message);
      }
    });
  }

  return (
    <Section>
      {error ? <ErrorMessage message={error} /> : null}

      {paso === 'inicio' ? (
        <>
          <Header
            title="Negociación Ciega"
            subtitle="Registra dos ofertas por separado. Ninguna se muestra hasta que ambas estén cargadas y decidas revelar el resultado."
          />
          <div>
            <Button tamano="lg" onClick={() => setPaso('crear')}>
              Nueva negociación
            </Button>
          </div>
        </>
      ) : null}

      {paso === 'crear' ? (
        <>
          <Header
            title="Nueva negociación"
            subtitle="Se generará un código único para identificar esta negociación."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button tamano="lg" onClick={crear} disabled={isPending}>
              {isPending ? 'Creando…' : 'Comenzar'}
            </Button>
            <Button
              tamano="lg"
              variante="secundario"
              onClick={() => setPaso('inicio')}
              disabled={isPending}
            >
              Volver
            </Button>
          </div>
        </>
      ) : null}

      {paso === 'oferta1' ? (
        <>
          <Header
            title="Primera oferta"
            subtitle={`Referencia: ${negociacion?.codigo ?? ''}`}
          />
          <Card>
            <OfertaForm
              key="oferta1"
              pendiente={isPending}
              onGuardar={(nombre, monto) =>
                guardarOferta(nombre, monto, 'oferta1-ok')
              }
            />
          </Card>
        </>
      ) : null}

      {paso === 'oferta1-ok' ? (
        <>
          <Header title="Primera oferta registrada" />
          <Card>
            <div className="flex flex-col gap-2 text-neutral-700">
              <p>Primera oferta registrada correctamente.</p>
              <p>Entregue el dispositivo a la segunda persona.</p>
            </div>
          </Card>
          <div>
            <Button tamano="lg" onClick={() => setPaso('oferta2')}>
              Continuar
            </Button>
          </div>
        </>
      ) : null}

      {paso === 'oferta2' ? (
        <>
          <Header
            title="Segunda oferta"
            subtitle={`Referencia: ${negociacion?.codigo ?? ''}`}
          />
          <Card>
            <OfertaForm
              key="oferta2"
              pendiente={isPending}
              onGuardar={(nombre, monto) =>
                guardarOferta(nombre, monto, 'oferta2-ok')
              }
            />
          </Card>
        </>
      ) : null}

      {paso === 'oferta2-ok' ? (
        <>
          <Header title="Ofertas completas" />
          <Card>
            <p className="text-neutral-700">
              Las dos ofertas fueron registradas correctamente.
            </p>
          </Card>
          <Button tamano="lg" fullWidth onClick={revelar} disabled={isPending}>
            {isPending ? 'Revelando…' : 'Revelar negociación'}
          </Button>
        </>
      ) : null}

      {paso === 'resultado' && resultado ? (
        <>
          <Header title="Resultado" />
          <ResultadoCard
            referencia={resultado.negociacion.codigo}
            fecha={
              resultado.fechaRevelacion ?? resultado.negociacion.fechaCreacion
            }
            ofertas={resultado.ofertas}
            calculo={resultado}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button tamano="lg" onClick={reiniciar}>
              Nueva negociación
            </Button>
            <Link
              href="/historial"
              className={buttonClassName({
                variante: 'secundario',
                tamano: 'lg',
              })}
            >
              Ir al historial
            </Link>
          </div>
        </>
      ) : null}
    </Section>
  );
}
