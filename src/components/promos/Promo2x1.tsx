// src/components/marketing/Promo2x1Modal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import clsx from "clsx";

type Props = {
  waNumber: string;            // ej: "549336XXXXXXX"
  cooldownDays?: number;       // cada cuántos días volver a mostrar (default 7)
  delayMs?: number;            // delay antes de mostrar en primer scroll (default 6000)
  className?: string;
};

const LS_KEY = "promo2x1_dismissed_until";

function isMobile() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export default function Promo2x1Modal({
  waNumber,
  cooldownDays = 7,
  delayMs = 6000,
  className
}: Props) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(isMobile()); // bottom-sheet en mobile
  const exitArmed = useRef(false);
  const shownRef  = useRef(false);

  const until = useMemo(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? new Date(raw).getTime() : 0;
  }, []);

  // Helper
  const armCooldown = () => {
    const next = new Date();
    next.setDate(next.getDate() + cooldownDays);
    localStorage.setItem(LS_KEY, next.toISOString());
  };

  const close = () => {
    setOpen(false);
    armCooldown();
    // (Opcional) envia evento de analytics
    window.dispatchEvent(new CustomEvent("promo2x1:dismiss"));
  };

  const goWhatsApp = () => {
    const text = encodeURIComponent(
      "Hola! Vi la promo 2×1 en *diseños en stock*. ¿Cuáles hay disponibles?"
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank");
    // (Opcional) analytics
    window.dispatchEvent(new CustomEvent("promo2x1:cta"));
    armCooldown();
    setOpen(false);
  };

  // Mostrar con delay (solo si no está en cooldown)
  useEffect(() => {
    if (shownRef.current) return;
    if (Date.now() < until) return;

    const t = setTimeout(() => {
      // en mobile lo mostramos como bottom-sheet; en desktop podríamos esperar scroll
      setSheet(isMobile());
      setOpen(true);
      shownRef.current = true;
    }, delayMs);

    return () => clearTimeout(t);
  }, [until, delayMs]);

  // Exit-intent (solo desktop) — evita interrumpir demasiado
  useEffect(() => {
    if (Date.now() < until) return;
    if (isMobile()) return;          // solo desktop
    if (exitArmed.current) return;   // armar una sola vez

    const onMouseLeave = (e: MouseEvent) => {
      if (shownRef.current) return;  // si ya lo mostramos por delay, no repetir
      if (e.clientY <= 0) {
        setSheet(false);
        setOpen(true);
        exitArmed.current = true;
        shownRef.current = true;
      }
    };
    document.addEventListener("mouseout", onMouseLeave);
    return () => document.removeEventListener("mouseout", onMouseLeave);
  }, [until]);

  if (!open) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[90] flex items-end sm:items-center justify-center",
        "bg-black/40 backdrop-blur-[1px]",
        className
      )}
      aria-labelledby="promo2x1-title"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // cerrar si clic fuera del contenedor
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Contenedor modal */}
      <div
        className={clsx(
          "relative w-full sm:w-[560px] rounded-t-3xl sm:rounded-2xl overflow-hidden",
            sheet
            ? "translate-y-0 sm:translate-y-0 self-end sm:self-center"
            : "self-center",
          "bg-white shadow-2xl"
        )}
      >
        {/* Header / Close */}
        <button
          onClick={close}
          aria-label="Cerrar promoción"
          className="absolute right-3 top-3 p-2 rounded-full bg-white/90 shadow hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Imagen promo (mobile/desktop) */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-100">
          {/* Usa 2 imágenes distintas optimizadas */}
          <picture>
            <source media="(max-width: 767px)" srcSet="assets/promos/2X1.png" />
            <img
              src="assets/promos/2X1.png"
              alt="Promo 2×1 en diseños en stock"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Cinta/Badge arriba */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
              Solo diseños en stock
            </span>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3 id="promo2x1-title" className="text-xl sm:text-2xl font-bold">
            2×1 por tiempo limitado
          </h3>
          <p className="text-sm text-slate-600">
            Llevá <strong>2 productos al precio de 1</strong> en nuestros diseños disponibles en stock. Aprovechalo hoy: cupos semanales limitados.
          </p>

          {/* Bullets de confianza */}
          <ul className="text-sm text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <li>• Hecho a mano</li>
            <li>• Entrega 24–48h</li>
          </ul>

          {/* CTA principal */}
          <div className="grid sm:grid-cols-[1fr,auto] gap-2">
            <button
              onClick={goWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-white font-semibold shadow hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" />
              Ver diseños en stock por WhatsApp
            </button>

            {/* Secundario: ver catálogo */}
            <a
              href="#/catalogo"
              className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4 justify-self-start sm:justify-self-end"
            >
              Ver catálogo →
            </a>
          </div>

          {/* Nota legal/condiciones cortas */}
          <p className="text-[11px] text-slate-500">
            Válido solo en modelos en stock. No acumulable con otras promos. Sujeto a disponibilidad semanal.
          </p>
        </div>
      </div>
    </div>
  );
}
