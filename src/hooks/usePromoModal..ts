// usePromoModal.ts (hook)
import { useEffect, useState } from "react";

const SEEN_KEY = "promo2x1_seen_at";
const SESSION_KEY = "promo2x1_seen_session";

export function usePromoModal({
  minSeconds = 10,           // ≥8–10 s recomendado
  minScrollPct = 35,         // 30–50 % recomendado
  cooldownDays = 7,          // no más de 1/semana
}: {
  minSeconds?: number;
  minScrollPct?: number;
  cooldownDays?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // frequency capping
    const last = localStorage.getItem(SEEN_KEY);
    const inSession = sessionStorage.getItem(SESSION_KEY);
    const now = Date.now();

    if (inSession) return; // ya lo mostré esta sesión

    if (last) {
      const days = (now - Number(last)) / (1000 * 60 * 60 * 24);
      if (days < cooldownDays) return;
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, String(now));
      localStorage.setItem(SEEN_KEY, String(now));
      window.removeEventListener("scroll", onScroll, { passive: true } as any);
    };

    // trigger por tiempo
    const t = window.setTimeout(show, minSeconds * 1000);

    // trigger por scroll
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      if (pct >= minScrollPct) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll as any);
    };
  }, [minSeconds, minScrollPct, cooldownDays]);

  return { open, setOpen };
}
