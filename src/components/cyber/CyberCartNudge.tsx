// src/components/cyber/CyberCartNudge.tsx
//
// Aviso del carrito durante Black Friday: el ahorro ya ganado y las libretas
// A6 en composé que se lleva de regalo (una por unidad elegible). El bloque 3x2
// sólo se muestra si la promo lo tuviera activo (`threeForTwo`).
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import { cyberWeek } from '@/config/cyberweek';
import { cn } from '@/lib/utils';

type CyberGift = { key: string; forProduct: string; model?: string; qty: number };

type Props = {
  cyber: {
    eligibleQty: number;
    freeCount: number;
    gift: string;
    savings: number;
    mode: '3x2' | 'percent';
    gifts?: CyberGift[];
    giftQty?: number;
    giftValue?: number;
  };
  /** Versión compacta para el checkout (sin el link al catálogo). */
  compact?: boolean;
  /** Hay productos en el carrito (para sugerir sumar uno si sólo hay libretas). */
  hasItems?: boolean;
  className?: string;
};

const modelText = (model?: string) =>
  model && model !== 'a confirmar' ? `Modelo ${model}` : 'modelo a confirmar';

/** Subtítulo por línea de carrito: "+ 2x Libreta A6 Modelo 12 de regalo  $0 ~$10.000~". */
export function CyberGiftLine({
  giftQty,
  model,
  className,
}: {
  giftQty: number;
  model?: string;
  className?: string;
}) {
  if (!giftQty || giftQty <= 0) return null;
  const value = (cyberWeek.giftPerUnit?.value ?? 0) * giftQty;
  return (
    <p
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-2 text-xs font-medium text-primary',
        className
      )}
    >
      <span>
        🎁 + {giftQty > 1 ? `${giftQty}x ` : ''}Libreta A6 {modelText(model)} de regalo
      </span>
      <span>
        $0 <span className="text-muted-foreground line-through">{formatARS(value)}</span>
      </span>
    </p>
  );
}

export function CyberCartNudge({
  cyber,
  compact = false,
  hasItems = true,
  className,
}: Props) {
  const inTrio = cyber.eligibleQty % 3;
  const missing = inTrio === 0 ? 0 : 3 - inTrio;
  const filled = inTrio === 0 && cyber.eligibleQty > 0 ? 3 : inTrio;
  const giftQty = cyber.giftQty ?? 0;
  const gifts = (cyber.gifts ?? []).filter((g) => g.qty > 0);

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl bg-announcement p-4 text-announcement-foreground',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-promo px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-promo-foreground">
          {cyberWeek.badge}
        </span>
        {cyber.savings > 0 && (
          <span className="text-base font-bold text-promo">
            Ya ahorrás {formatARS(cyber.savings)}
          </span>
        )}
      </div>

      {cyberWeek.threeForTwo && (
        <div className="space-y-2">
          <p className="text-sm">
            {cyber.mode === 'percent' && cyber.eligibleQty >= 3 ? (
              <>
                Con estos productos te conviene más el{' '}
                <strong className="text-promo">{cyberWeek.percentage}% OFF</strong>, y ya está
                aplicado (no se suma al 3x2).
              </>
            ) : missing > 0 ? (
              <>
                Sumá{' '}
                <strong>{missing === 1 ? '1 producto más' : `${missing} productos más`}</strong> y
                el de menor valor te sale <strong className="text-promo">gratis</strong> (3x2). Te
                aplicamos el {cyberWeek.percentage}% o el 3x2, el que más te convenga.
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

      {giftQty > 0 ? (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="h-4 w-4 shrink-0 text-promo" aria-hidden />
            Te {giftQty === 1 ? 'regalamos 1 libreta' : `regalamos ${giftQty} libretas`} en composé:
            ahorrás {formatARS(cyber.giftValue ?? 0)} más (precio regular)
          </p>
          <ul className="space-y-1 text-sm text-white/90">
            {gifts.map((g) => (
              <li key={g.key}>
                🎁 {g.qty > 1 ? `${g.qty}x ` : ''}Libreta A6 {modelText(g.model)} — en composé con{' '}
                {g.forProduct}
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/70">
            Si querés la libreta en otro diseño, avisanos en las notas del pedido.
          </p>
        </div>
      ) : (
        hasItems && (
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-white/90">
            <Gift className="h-4 w-4 shrink-0 text-promo" aria-hidden />
            <span>Sumá una agenda o un cuaderno y te regalamos una libreta en composé</span>
            {!compact && (
              <Link to="/catalogo" className="font-semibold underline underline-offset-4">
                Ver catálogo
              </Link>
            )}
          </p>
        )
      )}
    </div>
  );
}
