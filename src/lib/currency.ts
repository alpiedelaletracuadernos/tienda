// src/lib/currency.ts
export function formatARS(n: number): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(n ?? 0);
  } catch {
    return `$${Number(n ?? 0).toFixed(0)}`;
  }
}

export default formatARS;

