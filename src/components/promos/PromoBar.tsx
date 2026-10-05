// src/components/promos/PromoBar.tsx
//
// Barra informativa de promoción (2x1, descuento, Hot Sale). Antes cada
// página tenía su copia del mismo markup; ahora se cambia el estilo acá.
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  badge: string;
  children: ReactNode;
  /** `announcement`: barra oscura con etiqueta de promo; `accent`: Hot Sale. */
  tone?: 'announcement' | 'accent';
  className?: string;
};

export function PromoBar({ badge, children, tone = 'announcement', className }: Props) {
  return (
    <div
      className={cn(
        tone === 'accent'
          ? 'bg-accent text-accent-foreground'
          : 'bg-announcement text-announcement-foreground',
        className
      )}
    >
      <div className="container px-4 py-2 flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            'font-bold',
            tone === 'accent'
              ? 'bg-background text-accent hover:bg-background/90'
              : 'bg-promo text-promo-foreground hover:bg-promo'
          )}
        >
          {badge}
        </Badge>
        <span className="text-sm sm:text-base font-semibold">{children}</span>
      </div>
    </div>
  );
}
