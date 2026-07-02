import Link from 'next/link';

import { buttonClassName } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section } from '@/components/ui/section';

export default function NotFound() {
  return (
    <Section>
      <EmptyState
        title="No encontramos esta página"
        description="La negociación no existe o el enlace es incorrecto."
        action={
          <Link href="/" className={buttonClassName()}>
            Volver al inicio
          </Link>
        }
      />
    </Section>
  );
}
