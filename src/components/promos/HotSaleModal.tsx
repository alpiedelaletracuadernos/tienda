import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import vars from '@/data/data';
import { isHotSaleActive } from '@/config/promotions';
import { buildWaLink } from '@/lib/whatsapp';

function useCountdown(targetIso: string) {
  const target = new Date(targetIso).getTime();
  const compute = () => Math.max(0, target - Date.now());
  const [diff, setDiff] = useState(compute);

  useEffect(() => {
    if (diff <= 0) return;
    const id = setInterval(() => setDiff(compute), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    expired: diff <= 0,
  };
}

type Props = {
  forceOpen?: boolean;
};

export default function HotSaleModal({ forceOpen }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const hs = vars.promotions.hotSale;

  useEffect(() => {
    if (!isHotSaleActive()) return;

    if (forceOpen) {
      setOpen(true);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const seen = localStorage.getItem(hs.storageKey);
        if (!seen) {
          setOpen(true);
          localStorage.setItem(hs.storageKey, '1');
        }
      } catch {
        setOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const { days, hours, minutes, seconds, expired } = useCountdown(hs.endDate + 'T23:59:59');

  if (!open) return null;

  const waMsg = `¡Hola! Quiero aprovechar el Hot Sale 🔥 ${hs.percentage}% OFF en toda la tienda. ¿Qué me recomendás?`;
  const waLink = buildWaLink(vars.phoneNumber, waMsg);

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Hot Sale promoción"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-[101] w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #EC6B79 0%, #d4556a 100%)' }}
      >
        {/* Cierre */}
        <button
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          aria-label="Cerrar"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 text-white space-y-4">
          {/* Cabecera */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">
              Solo 11, 12 y 13 de mayo
            </p>
            <h2 className="text-4xl sm:text-5xl font-black leading-none tracking-tight">
              HOT SALE
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white/90">
              {hs.percentage}% OFF
            </p>
          </div>

          {/* Descripción */}
          <p className="text-sm text-white/85 leading-relaxed">
            Agendas, cuadernos, planners y especiales — toda la tienda con {hs.percentage}% de
            descuento. Sin mínimo de compra.
          </p>

          {/* Countdown */}
          {!expired && (
            <div className="rounded-xl bg-white/15 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-white/70 font-medium">Termina en</span>
              <span className="font-mono font-bold text-lg tracking-tight">
                {String(days).padStart(2, '0')}d{' '}
                {String(hours).padStart(2, '0')}h{' '}
                {String(minutes).padStart(2, '0')}m{' '}
                {String(seconds).padStart(2, '0')}s
              </span>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-accent hover:bg-white/90 font-bold"
            >
              <a href="/tienda/#/catalogo">Ver toda la tienda →</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full text-white hover:bg-white/10 border border-white/30"
            >
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
