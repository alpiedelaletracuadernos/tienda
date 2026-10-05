// src/components/presale/PresaleTopBar.tsx
//
// Franja fina arriba de todas las páginas durante la preventa. No es sticky
// (no tapa el menú) y se puede cerrar: no vuelve en la misma sesión. Se oculta
// en la ficha del kit (ya estás ahí) y en el checkout (no distraer al pagar).
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { getProductBySlug } from '@/data/products';
import { formatARS } from '@/lib/currency';
import { kitPricingFor } from '@/lib/pricing/kit';
import { isPresaleActive, presale, presaleDeadlineText } from '@/config/presale';

const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(presale.barStorageKey) === '1';
  } catch {
    return false;
  }
};

export function PresaleTopBar() {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(readDismissed);

  const product = getProductBySlug(presale.slug);
  const kit = product && kitPricingFor(product, 'semanal');
  const hidden =
    !isPresaleActive() ||
    !kit ||
    dismissed ||
    pathname === `/producto/${presale.slug}` ||
    pathname.startsWith('/checkout');
  if (hidden) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(presale.barStorageKey, '1');
    } catch {
      /* sin storage: se cierra sólo en esta vista */
    }
  };

  return (
    <div className="bg-announcement text-announcement-foreground text-xs sm:text-sm">
      <div className="container px-4 py-2 flex items-center gap-3">
        <Link to={`/producto/${presale.slug}`} className="flex-1 min-w-0 text-center">
          <span className="font-semibold">{presale.name}</span> · todo el kit desde{' '}
          <span className="font-semibold">{formatARS(kit.price)}</span>
          <span className="hidden sm:inline"> · {presaleDeadlineText()}</span>{' '}
          <span className="underline underline-offset-2 whitespace-nowrap">Ver kit</span>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso de preventa"
          className="shrink-0 rounded p-1 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
