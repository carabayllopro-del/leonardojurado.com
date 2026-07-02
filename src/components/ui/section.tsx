import type { ReactNode } from 'react';

export function Section({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-6 ${className}`.trim()}>
      {children}
    </section>
  );
}
