// src/components/cyber/CyberPdpNote.tsx
//
// Bajo el precio de la ficha durante la Cyber Week: el 3x2 explicado en una
// línea, el regalito y cuándo termina. El 15% ya se ve en el precio tachado.
import { Gift, Layers } from 'lucide-react';
import { cyberWeek } from '@/config/cyberweek';
import { useCyberClock } from './useCyberClock';

export function CyberPdpNote() {
  const clock = useCyberClock();
  return (
    <div className="mt-2 space-y-1.5 rounded-xl bg-announcement p-3 text-sm text-announcement-foreground">
      <p className="flex items-center gap-2">
        <span className="rounded bg-promo px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-promo-foreground">
          {cyberWeek.badge}
        </span>
        <span className={clock.lastDay ? 'font-semibold text-promo' : 'text-white/85'}>
          {clock.text}
        </span>
      </p>
      {cyberWeek.threeForTwo && (
        <p className="flex items-start gap-2">
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-promo" aria-hidden />
          <span>
            <strong>O 3x2:</strong> llevando 3 productos, el de menor valor te sale gratis. No se
            suma al {cyberWeek.percentage}%: en el carrito te aplicamos el que más te conviene.
          </span>
        </p>
      )}
      <p className="flex items-start gap-2">
        <Gift className="mt-0.5 h-4 w-4 shrink-0 text-promo" aria-hidden />
        <span>Regalito sorpresa en todas las compras.</span>
      </p>
    </div>
  );
}
