// src/config/presale.ts
//
// Estado de la preventa según la fecha (vars.promotions.presale). Todo lo que
// se muestra u oculta por la preventa (portada, barra, badge, orden del
// catálogo, comparación en las agendas, disponibilidad del kit) consulta acá,
// así el 16/10 a las 23:59 se apaga todo junto, sin tocar código.
//
// Se evalúa al cargar la página: una pestaña abierta desde antes del cierre
// sigue mostrando la preventa hasta que se recarga.
import vars from '@/data/data';

const cfg = vars.promotions.presale;

const start = () => new Date(cfg.startDate + 'T00:00:00');
const end = () => new Date(cfg.endDate + 'T23:59:59');

export const isPresaleActive = (now: Date = new Date()): boolean =>
  cfg.enabled && now >= start() && now <= end();

/** Días que quedan contando hoy (el último día devuelve 1). */
export const presaleDaysLeft = (now: Date = new Date()): number => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(end().getFullYear(), end().getMonth(), end().getDate());
  return Math.round((last.getTime() - today.getTime()) / 86_400_000) + 1;
};

/**
 * Frase de urgencia según la etapa: fecha sola, "Quedan X días" en los
 * últimos días, y "Hoy cierra" el último. Nunca un reloj con horas.
 */
export const presaleDeadlineText = (now: Date = new Date()): string => {
  const left = presaleDaysLeft(now);
  if (left <= 1) return 'Hoy cierra la preventa, hasta las 23:59';
  if (left <= cfg.countdownFromDays) return `Quedan ${left} días de preventa`;
  return `Preventa hasta ${cfg.endLabel}`;
};

export const isPresaleProduct = (slug: string) => slug === cfg.slug;

export const presale = cfg;
