// src/components/promos/CuentaDniHint.tsx
//
// Llamador del beneficio de Cuenta DNI junto al precio. Se configura en
// `vars.cuentaDni` (apagarlo con `enabled: false` lo saca de toda la web).
//  · "detail": ficha de producto, debajo del precio (chip + beneficio + días).
//  · "card": cards del catálogo, un chip corto ("20% reintegro con Cuenta DNI").
import vars from '@/data/data';
import { cn } from '@/lib/utils';

const dni = vars.cuentaDni;

export const cuentaDniEnabled = dni.enabled;
/** "20% de reintegro de lunes a viernes" */
export const cuentaDniPromo = `${dni.benefit} ${dni.days}`;

type Props = { variant?: 'detail' | 'card'; className?: string };

export function CuentaDniHint({ variant = 'detail', className }: Props) {
  if (!dni.enabled) return null;

  if (variant === 'card') {
    return (
      <p
        className={cn(
          'inline-block rounded bg-success px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-success-foreground',
          className
        )}
      >
        {dni.benefit.replace(' de ', ' ')} con {dni.label}
      </p>
    );
  }

  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-success px-3 py-1.5 text-sm font-medium text-success-foreground',
        className
      )}
    >
      <span className="shrink-0 whitespace-nowrap rounded bg-success-foreground px-1.5 py-0.5 text-[11px] font-bold text-success">
        {dni.label}
      </span>
      {cuentaDniPromo}
    </p>
  );
}
