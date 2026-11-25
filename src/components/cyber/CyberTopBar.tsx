// src/components/cyber/CyberTopBar.tsx
//
// Franja arriba de todas las páginas durante el Black Friday (y la víspera):
// el beneficio en una línea y cuándo termina. No es sticky (no tapa el menú),
// se puede cerrar por la sesión y no aparece en el checkout (no distraer).
// La previa ("mañana arranca") tiene su propia clave de cierre: quien la
// cierra hoy igual ve la barra real cuando arranca la promo.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { cyberHeadline, cyberWeek, isCyberWeekActive, isTeaserActive } from '@/config/cyberweek';
import { useCyberClock } from './useCyberClock';

const TEASER_KEY = `${cyberWeek.barStorageKey}_teaser`;
const brand = cyberWeek.name.replace(/ APL$/, '');

const readDismissed = (key: string) => {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

export function CyberTopBar() {
  const { pathname } = useLocation();
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(() =>
    [cyberWeek.barStorageKey, TEASER_KEY].filter(readDismissed)
  );
  const clock = useCyberClock();

  const teaser = isTeaserActive(clock.now);
  const active = !teaser && isCyberWeekActive(clock.now);
  const key = teaser ? TEASER_KEY : cyberWeek.barStorageKey;

  if ((!teaser && !active) || dismissedKeys.includes(key) || pathname.startsWith('/checkout')) {
    return null;
  }

  const dismiss = () => {
    setDismissedKeys((k) => [...k, key]);
    try {
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* sin storage: se cierra sólo en esta vista */
    }
  };

  const gift = cyberWeek.giftPerUnit?.enabled;
  const teaserText = `Mañana 00:00 arranca: ${cyberWeek.percentage}% OFF${gift ? ' + libreta de regalo' : ''}`;

  return (
    <div className="bg-black text-white text-xs sm:text-sm">
      <div className="container px-4 py-2 flex items-center gap-3">
        <Link
          to="/catalogo"
          className="flex-1 min-w-0 text-center leading-snug truncate sm:whitespace-normal"
        >
          <span className="mr-1.5 inline-block rounded bg-promo px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold tracking-wide text-promo-foreground">
            {cyberWeek.badge}
          </span>
          {teaser ? (
            <span className="font-semibold">
              <span className="sm:hidden">
                Mañana arranca: {cyberWeek.percentage}% OFF{gift ? ' + regalo' : ''}
              </span>
              <span className="hidden sm:inline">{teaserText}</span>
            </span>
          ) : (
            <>
              <span className="font-semibold">
                <span className="sm:hidden">
                  {cyberWeek.percentage}% OFF{gift ? ' + libreta de regalo' : ''}
                </span>
                <span className="hidden sm:inline">
                  {cyberHeadline()}
                  {gift ? ' a juego' : ''}
                </span>
              </span>
              <span
                className={
                  clock.lastDay
                    ? 'hidden sm:inline font-semibold text-promo'
                    : 'hidden sm:inline text-white/80'
                }
              >
                {' '}
                · {clock.text}
              </span>
            </>
          )}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={`Cerrar aviso de ${brand}`}
          className="shrink-0 rounded p-1 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
