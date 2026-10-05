// src/components/presale/KitValueBreakdown.tsx
// "Qué incluye el kit": una fila por pieza con su valor por separado y, al
// final, el total, el precio de preventa y el ahorro. Mostrar las piezas por
// separado hace que el valor total se perciba completo. Se usa en la ficha
// del kit y en la portada.
import { Package } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import { thumbOf } from '@/lib/media';
import { cn } from '@/lib/utils';
import type { KitPricing } from '@/lib/pricing/kit';

type Props = { kit: KitPricing; title?: string; className?: string };

export function KitValueBreakdown({ kit, title = 'Qué incluye el kit', className }: Props) {
  return (
    <section className={cn('rounded-2xl border bg-card p-4 sm:p-5', className)}>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="divide-y">
        {kit.items.map((it) => (
          <li key={it.label} className="flex items-start gap-3 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted grid place-items-center">
              {it.image ? (
                <img
                  src={thumbOf(it.image)}
                  alt={it.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{it.label}</p>
              <p className="text-sm text-muted-foreground">{it.detail}</p>
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums">{formatARS(it.value)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Valor por separado</dt>
          <dd className="tabular-nums text-muted-foreground line-through">
            {formatARS(kit.separateTotal)}
          </dd>
        </div>
        <div className="flex justify-between text-base font-bold">
          <dt>En preventa</dt>
          <dd className="tabular-nums text-primary">{formatARS(kit.price)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Ahorrás</dt>
          <dd className="tabular-nums">{formatARS(kit.savings)}</dd>
        </div>
      </dl>
    </section>
  );
}
