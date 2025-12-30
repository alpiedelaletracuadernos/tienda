// src/components/promos/BlackFridayModal.tsx
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppVars from "@/data/data"; // para phoneNumber o links si querés
import { buildWaLink } from "@/lib/whatsapp";

type Props = {
  /** control externo opcional */
  forceOpen?: boolean;
  /** rutas de imagen según dispositivo */
  desktopSrc: string;
  mobileSrc: string;
  /** mensaje/UTM del CTA */
  ctaHref?: string;
  ctaLabel?: string;
  /** sólo mostrar una vez por usuario */
  storageKey?: string; // default: 'bf24_seen'
};

export default function BlackFridayModal({
  forceOpen,
  desktopSrc,
  mobileSrc,
  ctaHref = "/catalogo?utm_source=banner_bf&utm_medium=modal&utm_campaign=bf",
  ctaLabel = "Ver ofertas Black Friday",
  storageKey = "bf24_seen",
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Abrir 1 sola vez por usuario (salvo forceOpen)
  useEffect(() => {
    try {
      if (forceOpen) {
        setOpen(true);
        return;
      }
      const seen = typeof window !== "undefined" && localStorage.getItem(storageKey);
      if (!seen) {
        setOpen(true);
        localStorage.setItem(storageKey, "1");
      }
    } catch (err) {
      // Si localStorage falla (modo privado), igual mostramos el modal
      setOpen(true);
      // opcional: console.warn("BF modal storage error", err);
    }
  }, [forceOpen, storageKey]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  // CTA secundario a WhatsApp con mensaje prellenado
  const waMsg =
    "¡Hola! Quiero aprovechar el Black Friday 🎉 ¿Qué modelos recomendás con -15%?";
  const waLink = buildWaLink(AppVars.phoneNumber, waMsg); // usa tu número desde util

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Promoción Black Friday"
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-[101] w-full max-w-3xl mx-4 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10"
      >
        {/* Imagen responsive: mobile primero */}
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrc} />
          <img
            src={mobileSrc}
            alt="Black Friday -15% OFF"
            className="w-full h-auto object-cover"
            loading="eager"
          />
        </picture>

        {/* Capa de contenido y CTAs */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="space-y-2 text-white max-w-lg">
            <p className="text-xs uppercase tracking-wider text-white/80">
              Sólo por tiempo limitado
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Black Friday: <span className="text-primary-foreground">-15% OFF</span> en agendas seleccionadas
            </h2>
            <p className="text-sm sm:text-base text-white/90">
              Mostramos el precio final con descuento. Cupos semanales limitados.
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={ctaHref}> {ctaLabel} </a>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Close */}
        <button
          className="absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label="Cerrar"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
