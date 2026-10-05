// src/components/products/pdp/QuantityStepper.tsx
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = { value: number; onChange: (v: number) => void; min?: number; max: number };

export function QuantityStepper({ value, onChange, min = 1, max }: Props) {
  return (
    <div className="space-y-2">
      <Label id="quantity-label">Cantidad</Label>
      <div className="flex items-center gap-2" role="group" aria-labelledby="quantity-label">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Restar cantidad"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium" aria-live="polite">
          {value}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Sumar cantidad"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
