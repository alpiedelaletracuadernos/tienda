// src/components/cyber/CyberTopBar.tsx
//
// Franja arriba de todas las páginas durante la Cyber Week: los tres
// beneficios en una línea y cuándo termina. No es sticky (no tapa el menú),
// se puede cerrar por la sesión y no aparece en el checkout (no distraer).
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { cyberWeek, isCyberWeekActive } from '@/config/cyberweek';
import { useCyberClock } from './useCyberClock';

const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(cyberWeek.barStorageKey) === '1';
  } catch {
    return false;
  }
};

export function CyberTopBar() {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(readDismissed);
  const clock = useCyberClock();

  if (!isCyberWeekActive() || dismissed || pathname.startsWith('/checkout')) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(cyberWeek.barStorageKey, '1');
    } catch {
      /* sin storage: se cierra sólo en esta vista */
    }
  };

  return (
    <div className="bg-announcement text-announcement-foreground text-xs sm:text-sm">
      <div className="container px-4 py-2 flex items-center gap-3">
        <Link to="/catalogo" className="flex-1 min-w-0 text-center leading-snug">
          <span className="mr-1.5 inline-block rounded bg-promo px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold tracking-wide text-promo-foreground">
            {cyberWeek.badge}
          </span>
          <span className="font-semibold">
            {cyberWeek.percentage}% OFF en todo{cyberWeek.threeForTwo && ' + 3x2'} + regalito
          </span>
          <span className={clock.lastDay ? 'font-semibold text-promo' : 'text-white/80'}>
            {' '}
            · {clock.text}
          </span>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso de Cyber Week"
          className="shrink-0 rounded p-1 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
