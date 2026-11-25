// src/components/cyber/CyberPdpNote.tsx
//
// Bajo el precio de la ficha durante Black Friday: el regalo (Libreta A6 a
// juego con el diseño elegido, se actualiza en vivo) y cuándo termina.
// El 15% ya se ve en el precio tachado.
import { Gift } from 'lucide-react';
import { cyberWeek, giftPerUnit } from '@/config/cyberweek';
import { formatARS } from '@/lib/currency';
import { thumbOf } from '@/lib/media';
import { useCyberClock } from './useCyberClock';

type Props = {
  /** Si el producto lleva libreta de regalo (las libretas no). */
  giftEligible?: boolean;
  /** Imagen del modelo/diseño elegido. */
  modelImage?: string;
  /** Número de modelo elegido ('5', 'a confirmar' o undefined si no usa modelos). */
  modelLabel?: string;
};

export function CyberPdpNote({ giftEligible = false, modelImage, modelLabel }: Props) {
  const clock = useCyberClock();
  const hasModel = !!modelLabel && modelLabel !== 'a confirmar';
  const caption = hasModel ? `Libreta A6 · Modelo ${modelLabel}` : 'Libreta A6 en composé';
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
            {modelImage ? (
              <img
                src={thumbOf(modelImage)}
                alt={caption}
                className="h-16 w-16 rounded-lg border border-white/20 bg-white object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-white/20" />
            )}
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-promo text-promo-foreground">
              <Gift className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-snug">
              🎁 Te regalamos una Libreta A6 en composé, con este mismo diseño.
            </p>
            <p className="mt-0.5 text-sm">
              Precio regular <span className="line-through">{formatARS(giftValue)}</span> ·{' '}
              <strong className="text-promo">para vos, $0</strong>
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
