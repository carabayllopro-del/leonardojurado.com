import type { ReactNode } from 'react';

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-base leading-relaxed text-neutral-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
