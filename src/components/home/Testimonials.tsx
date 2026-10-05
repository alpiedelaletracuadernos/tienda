import { MessageCircle } from 'lucide-react';
import { testimonials } from '@/data/testimonials';
import { cn } from '@/lib/utils';

type Props = {
  /** Cantidad a mostrar (por defecto, todos). */
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
};

/**
 * "Lo que nos escriben": mensajes reales de clientes, sin nombres ni fotos
 * inventadas (src/data/testimonials.ts).
 */
export const Testimonials = ({
  limit,
  title = 'Lo que nos escriben',
  subtitle = 'Mensajes reales que nos mandan después de recibir su pedido',
  className,
}: Props) => {
  const list = typeof limit === 'number' ? testimonials.slice(0, limit) : testimonials;
  if (!list.length) return null;

  return (
    <section className={cn('py-16 md:py-24 bg-soft/30', className)}>
      <div className="container px-4">
        <div className="text-center space-y-3 mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-bold">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <ul className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>li]:mb-4">
          {list.map((t) => (
            <li key={t.text} className="break-inside-avoid">
              <figure className="rounded-2xl rounded-bl-sm bg-background p-4 shadow-sm ring-1 ring-border">
                <blockquote className="text-foreground/90">{t.text}</blockquote>
                <figcaption className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Mensaje de un cliente
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
