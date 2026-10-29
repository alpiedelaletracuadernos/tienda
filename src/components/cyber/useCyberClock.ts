// src/components/cyber/useCyberClock.ts
//
// Reloj de la Cyber Week: el último día muestra cuánto falta (hh:mm:ss);
// antes, sólo la frase de cierre ("Hasta el sábado 7/11", "Quedan 2 días").
// Nunca un contador falso: siempre apunta al cierre real.
import { useEffect, useState } from 'react';
import { cyberDaysLeft, cyberDeadlineText, cyberWeekEnd, promoNow } from '@/config/cyberweek';

const pad = (n: number) => String(n).padStart(2, '0');

export function useCyberClock() {
  const [now, setNow] = useState(promoNow);
  const lastDay = cyberDaysLeft(now) <= 1;

  useEffect(() => {
    if (!lastDay) return;
    const id = window.setInterval(() => setNow(promoNow()), 1000);
    return () => window.clearInterval(id);
  }, [lastDay]);

  const ms = Math.max(0, cyberWeekEnd().getTime() - now.getTime());
  const countdown = `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor((ms % 3_600_000) / 60_000))}:${pad(
    Math.floor((ms % 60_000) / 1000)
  )}`;

  return {
    lastDay,
    /** "Termina en 05:12:33" el último día; si no, la frase de cierre. */
    text: lastDay ? `Termina hoy en ${countdown}` : cyberDeadlineText(now),
  };
}
