import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isHotSaleActive } from '@/config/promotions';
import vars from '@/data/data';

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

export default function HotSaleBanner() {
  const hs = vars.promotions.hotSale;
  const { days, hours, minutes, seconds, expired } = useCountdown(hs.endDate + 'T23:59:59');

  if (!isHotSaleActive()) return null;

  return (
    <div className="sticky top-16 z-40 w-full bg-accent text-accent-foreground">
      <div className="container px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 text-center sm:text-left">

          {/* Izquierda: nombre y descripción */}
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase">
              HOT SALE
            </span>
            <span>{hs.percentage}% OFF en toda la tienda · Del 11 al 13 de mayo</span>
          </div>

          {/* Centro: countdown */}
          {!expired && (
            <div className="flex items-center gap-1 text-sm shrink-0">
              <span className="text-white/80 text-xs">Termina en:</span>
              <span className="font-mono font-bold tracking-tight">
                {String(days).padStart(2, '0')}d{' '}
                {String(hours).padStart(2, '0')}h{' '}
                {String(minutes).padStart(2, '0')}m{' '}
                {String(seconds).padStart(2, '0')}s
              </span>
            </div>
          )}

          {/* Derecha: CTA */}
          <Link
            to="/catalogo"
            className="text-xs sm:text-sm font-semibold underline underline-offset-2 hover:no-underline shrink-0"
          >
            Ver catálogo →
          </Link>
        </div>
      </div>
    </div>
  );
}
