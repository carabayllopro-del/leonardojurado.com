import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario';
type Tamano = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variantes: Record<Variante, string> = {
  primario: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secundario:
    'border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50',
};

const tamanos: Record<Tamano, string> = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

interface ButtonClassNameOptions {
  variante?: Variante;
  tamano?: Tamano;
  fullWidth?: boolean;
}

export function buttonClassName({
  variante = 'primario',
  tamano = 'md',
  fullWidth = false,
}: ButtonClassNameOptions = {}): string {
  return `${base} ${variantes[variante]} ${tamanos[tamano]} ${fullWidth ? 'w-full' : ''}`.trim();
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonClassNameOptions {}

export function Button({
  variante = 'primario',
  tamano = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName({ variante, tamano, fullWidth })} ${className}`.trim()}
      {...props}
    />
  );
}
