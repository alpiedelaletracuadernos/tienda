// src/components/products/VariantSelector.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (v: T) => void;
  formatOption?: (v: T) => string;
  className?: string;
};

export function VariantSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  formatOption,
  className,
}: Props<T>) {
  if (options.length === 0) return null;

  const format = formatOption ?? ((v: T) => v);

  if (options.length === 1) {
    // Con una sola opción no aplicamos formatOption: ese formateador suele
    // anteponer una palabra (ej. "Tapa dura") que ya está en el label,
    // duplicándose ("Tipo de Tapa: Tapa dura"). Mostramos el valor crudo
    // capitalizado en su lugar ("Tipo de Tapa: Dura").
    const only = options[0];
    const capitalized = only.charAt(0).toUpperCase() + only.slice(1);
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        <span className="font-medium text-foreground">{label}:</span> {capitalized}
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            variant={value === opt ? 'default' : 'outline'}
            onClick={() => onChange(opt)}
            className="capitalize"
          >
            {format(opt)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default VariantSelector;
