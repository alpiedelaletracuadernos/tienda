// src/components/cyber/CyberCartNudge.tsx
//
// Aviso del carrito durante la Cyber Week: cuánto falta para el próximo 3x2
// (con barra de progreso), el ahorro ya ganado y el regalito. Es el empujón
// que más sube el ticket: "sumá 1 más y el de menor valor te sale gratis".
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import { cyberWeek } from '@/config/cyberweek';
import { cn } from '@/lib/utils';

type Props = {
  cyber: { eligibleQty: number; freeCount: number; gift: string; savings: number };
  /** Versión compacta para el checkout (sin el link al catálogo). */
  compact?: boolean;
  className?: string;
};

export function CyberCartNudge({ cyber, compact = false, className }: Props) {
  const inTrio = cyber.eligibleQty % 3;
  const missing = inTrio === 0 ? 0 : 3 - inTrio;
  const filled = inTrio === 0 && cyber.eligibleQty > 0 ? 3 : inTrio;

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl bg-announcement p-4 text-announcement-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="rounded bg-promo px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-promo-foreground">
          {cyberWeek.badge}
        </span>
        {cyber.savings > 0 && (
          <span className="text-sm font-semibold">Ya ahorrás {formatARS(cyber.savings)}</span>
        )}
      </div>

      {cyberWeek.threeForTwo && (
        <div className="space-y-2">
          <p className="text-sm">
            {missing > 0 ? (
              <>
                Sumá{' '}
                <strong>{missing === 1 ? '1 producto más' : `${missing} productos más`}</strong> y
                el de menor valor te sale <strong className="text-promo">gratis</strong> (3x2).
              </>
            ) : (
              <>
                <strong className="text-promo">¡3x2 aplicado!</strong>{' '}
                {cyber.freeCount === 1
                  ? 'Te llevás 1 producto gratis.'
                  : `Te llevás ${cyber.freeCount} productos gratis.`}{' '}
                Sumá 3 más y se repite.
              </>
            )}
          </p>
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn('h-1.5 flex-1 rounded-full', i < filled ? 'bg-promo' : 'bg-white/20')}
              />
            ))}
          </div>
          {!compact && missing > 0 && (
            <Link
              to="/catalogo"
              className="inline-block text-sm font-semibold underline underline-offset-4"
            >
              Elegir {missing === 1 ? 'otro producto' : 'más productos'}
            </Link>
          )}
        </div>
      )}

      <p className="flex items-center gap-2 text-sm text-white/90">
        <Gift className="h-4 w-4 shrink-0 text-promo" aria-hidden />
        Tu pedido incluye un regalito sorpresa.
      </p>
    </div>
  );
}
