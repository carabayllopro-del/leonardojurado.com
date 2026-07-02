import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function Input({
  id,
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`h-11 rounded-lg border bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:outline-none ${error ? 'border-red-400' : 'border-neutral-200 focus-visible:border-neutral-900'} ${className}`.trim()}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
