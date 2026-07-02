import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b border-neutral-200">
      <nav
        aria-label="Principal"
        className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-neutral-900"
        >
          Negociación Ciega
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Nueva negociación
          </Link>
          <Link
            href="/historial"
            className="text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Historial
          </Link>
        </div>
      </nav>
    </header>
  );
}
