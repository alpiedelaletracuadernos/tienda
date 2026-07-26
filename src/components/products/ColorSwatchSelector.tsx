// src/components/products/ColorSwatchSelector.tsx
import { useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types/product';

type Props = {
  label?: string;
  options: ProductColor[];
  value?: string; // id del color seleccionado
  onChange: (id: string) => void;
  className?: string;
};

// Determina si el ícono de check debe ir en blanco o negro según el
// contraste del color de fondo (fórmula de luminancia relativa simplificada).
function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export function ColorSwatchSelector({
  label = 'Color',
  options,
  value,
  onChange,
  className,
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Navegación con flechas (ARIA radios). El findIndex compara contra `id`,
  // que es exactamente el mismo campo que se guarda como `value` — evita el
  // desfasaje que tenía AgendaModelSelector cuando el valor comparado no
  // coincidía con el campo persistido.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = options.findIndex((o) => o.id === value);
      const focusAt = (idx: number) => refs.current[idx]?.focus();

      if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const next = (currentIndex + 1 + options.length) % options.length;
        onChange(options[next].id);
        focusAt(next);
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        const prev = (currentIndex - 1 + options.length) % options.length;
        onChange(options[prev].id);
        focusAt(prev);
      }
    },
    [options, value, onChange]
  );

  const selectedOption = options.find((o) => o.id === value);

  if (options.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap items-center gap-3"
        onKeyDown={handleKeyDown}
      >
        {options.map((opt, idx) => {
          const checked = opt.id === value;
          const lightBg = isLightColor(opt.hex);
          return (
            <button
              key={opt.id}
              ref={(el) => (refs.current[idx] = el)}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={opt.name}
              onClick={() => onChange(opt.id)}
              tabIndex={checked || (!value && idx === 0) ? 0 : -1}
              className={cn(
                'relative h-11 w-11 shrink-0 rounded-full ring-1 ring-slate-300/60',
                'flex items-center justify-center',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
                checked && 'ring-2 ring-offset-2 ring-primary'
              )}
              style={{ backgroundColor: opt.hex }}
            >
              {checked && (
                <Check
                  className={cn('h-5 w-5', lightBg ? 'text-black' : 'text-white')}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <p className="text-sm text-muted-foreground">
          {label}: <span className="font-medium text-foreground">{selectedOption.name}</span>
        </p>
      )}
    </div>
  );
}

export default ColorSwatchSelector;
