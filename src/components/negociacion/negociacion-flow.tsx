'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { cancelarNegociacionAction } from '@/actions/negociaciones/cancelar-negociacion.action';
import { iniciarNegociacionAction } from '@/actions/negociaciones/iniciar-negociacion.action';
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

  function guardarOferta(nombre: string, monto: string, siguiente: Paso) {
    setError(null);
    startTransition(async () => {
      // La primera oferta crea la negociación (creación diferida); la segunda
      // se registra sobre la negociación ya existente.
      const res = negociacion
        ? await registrarOfertaAction({
            negociacionId: negociacion.id,
            nombre,
            monto,
          })
        : await iniciarNegociacionAction({ nombre, monto });
      if (res.success) {
        if (!negociacion) {
          setNegociacion({ id: res.data.id, codigo: res.data.codigo });
        }
        setPaso(siguiente);
      } else {
        setError(res.error.message);
      }
    });
  }

  function cancelar() {
    // En 'oferta1' aún no existe la negociación: no hay nada que borrar.
    if (!negociacion) {
      reiniciar();
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await cancelarNegociacionAction(negociacion.id);
      if (res.success) {
        reiniciar();
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
            title="Negociación Justa"
            subtitle="Registra dos ofertas por separado. Ninguna se muestra hasta que ambas estén cargadas y decidas revelar el resultado."
          />
          <div>
            <Button
              tamano="lg"
              onClick={() => {
                setError(null);
                setPaso('oferta1');
              }}
            >
              Nueva negociación
            </Button>
          </div>
        </>
      ) : null}

      {paso === 'oferta1' ? (
        <>
          <Header title="Primera oferta" />
          <Card>
            <OfertaForm
              key="oferta1"
              pendiente={isPending}
              onGuardar={(nombre, monto) =>
                guardarOferta(nombre, monto, 'oferta1-ok')
              }
            />
          </Card>
          <div>
            <Button
              tamano="lg"
              variante="secundario"
              onClick={cancelar}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              tamano="lg"
              onClick={() => setPaso('oferta2')}
              disabled={isPending}
            >
              Continuar
            </Button>
            <Button
              tamano="lg"
              variante="secundario"
              onClick={cancelar}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </>
      ) : null}

      {paso === 'oferta2' ? (
        <>
          <Header title="Segunda oferta" />
          <Card>
            <OfertaForm
              key="oferta2"
              pendiente={isPending}
              onGuardar={(nombre, monto) =>
                guardarOferta(nombre, monto, 'oferta2-ok')
              }
            />
          </Card>
          <div>
            <Button
              tamano="lg"
              variante="secundario"
              onClick={cancelar}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button tamano="lg" onClick={revelar} disabled={isPending}>
              {isPending ? 'Revelando…' : 'Revelar negociación'}
            </Button>
            <Button
              tamano="lg"
              variante="secundario"
              onClick={cancelar}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
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
