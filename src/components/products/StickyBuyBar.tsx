// src/components/products/StickyBuyBar.tsx
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  visible: boolean;
  price: string;
  originalPrice?: string;
  summary?: string;
  onAddToCart: () => void;
  addLabel?: string;
};

export function StickyBuyBar({
  visible,
  price,
  originalPrice,
  summary,
  onAddToCart,
  addLabel = 'Agregar',
}: Props) {
  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 lg:hidden',
        'border-t bg-background/95 backdrop-blur',
        'pb-[env(safe-area-inset-bottom)]',
        'transition-transform duration-200',
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      )}
      aria-hidden={!visible}
    >
      <div className="container px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
            )}
            <span className="text-lg font-bold text-primary truncate">{price}</span>
          </div>
          {summary && <p className="text-xs text-muted-foreground truncate">{summary}</p>}
        </div>
        <Button onClick={onAddToCart} className="shrink-0">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

export default StickyBuyBar;
