// src/components/cyber/CyberPdpNote.tsx
//
// Bajo el precio de la ficha durante Black Friday: el regalo (Libreta A6 en
// composé, con un diseño que combina con el elegido) y cuándo termina.
// El 15% ya se ve en el precio tachado.
import { Gift } from 'lucide-react';
import { cyberWeek, giftPerUnit } from '@/config/cyberweek';
import { formatARS } from '@/lib/currency';
import { useCyberClock } from './useCyberClock';

type Props = {
  /** Si el producto lleva libreta de regalo (las libretas no). */
  giftEligible?: boolean;
  /** Número de modelo elegido ('5', 'a confirmar' o undefined si no usa modelos). */
  modelLabel?: string;
};

/** Foto de campaña (agenda + libreta en composé) como miniatura del regalo. */
const GIFT_PHOTO = 'assets/bf/bf26-agenda-libreta-640.webp';

export function CyberPdpNote({ giftEligible = false, modelLabel }: Props) {
  const clock = useCyberClock();
  const hasModel = !!modelLabel && modelLabel !== 'a confirmar';
  const caption = hasModel
    ? `Diseño combinado con tu Modelo ${modelLabel}`
    : 'Diseño combinado con tu producto';
  const giftValue = giftPerUnit?.value ?? 0;

  return (
    <div className="mt-2 space-y-2.5 rounded-xl bg-announcement p-3 text-sm text-announcement-foreground">
      <p className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-promo px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-promo-foreground">
          {cyberWeek.badge}
        </span>
        <span className={clock.lastDay ? 'font-semibold text-promo' : 'text-white/85'}>
          {clock.text}
        </span>
      </p>

      {giftEligible ? (
        <div className="flex items-center gap-3 rounded-lg bg-white/10 p-2.5">
          <div className="relative shrink-0">
            <img
              src={GIFT_PHOTO}
              alt="Agenda y Libreta A6 en composé"
              className="h-16 w-16 rounded-lg border border-white/20 bg-white object-cover object-right"
            />
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-promo text-promo-foreground">
              <Gift className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-snug">
              🎁 Te regalamos una Libreta A6 en composé, con un diseño combinado.
            </p>
            <p className="mt-0.5 text-sm">
              <span className="text-white/60 line-through">{formatARS(giftValue)}</span>{' '}
              <span className="ml-1 rounded-full bg-success px-2 py-0.5 text-xs font-extrabold text-success-foreground">
                GRATIS
              </span>{' '}
              <span className="text-xs text-white/75">con tu compra</span>
            </p>
            <p className="mt-0.5 text-xs text-white/75">{caption}</p>
          </div>
        </div>
      ) : (
        <p className="text-white/85">{cyberWeek.percentage}% OFF ya aplicado en el precio.</p>
      )}
    </div>
  );
}
