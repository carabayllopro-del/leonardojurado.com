const numeroFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fechaFormatter = new Intl.DateTimeFormat('es-PE', {
  // Fijamos la zona horaria del Perú (UTC-5) para que las fechas se muestren
  // siempre en hora peruana, sin importar la zona del servidor (en producción
  // suele ser UTC) ni la del navegador de cada visitante.
  timeZone: 'America/Lima',
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatMonto(valor: string | number): string {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return `S/ ${numeroFormatter.format(numero)}`;
}

export function formatPorcentaje(valor: number): string {
  return `${numeroFormatter.format(valor)} %`;
}

export function formatFecha(fecha: Date): string {
  return fechaFormatter.format(fecha);
}
