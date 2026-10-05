// src/components/products/ShareButton.tsx
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { shareUrlFor } from '@/lib/share';

type Props = { slug: string; name: string; className?: string };

/** Comparte la ficha con el menú nativo del celu; en desktop copia el link. */
export function ShareButton({ slug, name, className }: Props) {
  const handleShare = async () => {
    const url = shareUrlFor(slug);
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        /* el usuario cerró el menú */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado');
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className={className}
      aria-label={`Compartir ${name}`}
    >
      <Share2 className="mr-1.5 h-4 w-4" />
      Compartir
    </Button>
  );
}
