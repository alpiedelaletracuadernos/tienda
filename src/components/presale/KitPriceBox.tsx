// src/components/presale/KitPriceBox.tsx
// Bloque de precio del kit. Orden de lectura pedido por el brief: valor por
// separado (referencia) → precio de preventa → ahorro → fecha → entrega.
import { CalendarClock, Truck } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import { presaleDeadlineText } from '@/config/presale';
import type { KitPricing } from '@/lib/pricing/kit';
import { CuentaDniHint } from '@/components/promos/CuentaDniHint';

type Props = { kit: KitPricing; deliveryNote?: string };

export function KitPriceBox({ kit, deliveryNote }: Props) {
  return (
    <div className="mt-3 sm:mt-4 space-y-2">
      <p className="text-sm text-muted-foreground">
        Valor por separado <span className="line-through">{formatARS(kit.separateTotal)}</span>
      </p>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl sm:text-4xl font-bold text-primary">{formatARS(kit.price)}</span>
        <span className="text-sm text-muted-foreground">en preventa</span>
      </div>
      <p className="font-semibold">Ahorrás {formatARS(kit.savings)}</p>
      {/* Beneficio de pago: a la vista junto al precio, no sólo en las FAQ */}
      <CuentaDniHint />
      <ul className="space-y-1 pt-1 text-sm">
        <li className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary shrink-0" aria-hidden />
          {presaleDeadlineText()}
        </li>
        {deliveryNote && (
          <li className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary shrink-0" aria-hidden />
            {deliveryNote}
          </li>
        )}
      </ul>
    </div>
  );
}
