import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Navbar } from '@/components/layout/navbar';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Negociación Ciega',
  description:
    'Registra dos ofertas por separado y revela el resultado solo cuando ambas estén cargadas.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
          {children}
        </main>
      </body>
    </html>
  );
}
