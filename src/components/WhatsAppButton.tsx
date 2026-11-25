import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import vars from '@/data/data';
import { buildWaLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'floating';
  phone?: string; // override destination if needed
}

export const WhatsAppButton = ({
  message = 'Hola! Me gustaría consultar sobre los productos de Al Pie de la Letra',
  className,
  variant = 'default',
  phone,
}: WhatsAppButtonProps) => {
  const phoneNumber = phone ?? vars.phoneNumber ?? vars.social?.whatsapp ?? '';
  const whatsappUrl = buildWaLink(phoneNumber, message);

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultar por WhatsApp"
        className={cn(
          'fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-all hover:scale-110 hover:bg-whatsapp-hover sm:bottom-6 sm:right-6 sm:h-14 sm:w-14',
          className
        )}
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
      </a>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      className={className}
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Pedila por WhatsApp
      </a>
    </Button>
  );
};
