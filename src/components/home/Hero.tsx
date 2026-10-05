// src/components/landing/Hero.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { modeloOptions } from "@/data/options";

// Dos assets:
// 1) heroPoster(-768).webp (LCP): imagen estática, con versión chica para mobile
// 2) heroLoop-opt.mp4 (decorativo): loop sutil, muted; NO es LCP

/**
 * El video sólo se monta en pantallas md+ y si el usuario no pidió ahorrar
 * datos ni reducir movimiento. Antes se ocultaba con `opacity-0` en mobile,
 * pero el navegador lo descargaba igual.
 */
function useShouldPlayHeroVideo() {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    const update = () => setPlay(wide.matches && !calm.matches && !saveData);
    update();
    wide.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);
  return play;
}

export default function Hero() {
  const playVideo = useShouldPlayHeroVideo();
  return (
    <section
      className="relative isolate min-h-[90svh] flex items-center overflow-hidden"
      aria-label="Agendas y cuadernos artesanales personalizables"
    >
      {/* Background media: video opcional + imagen LCP como capa */}
      <div className="absolute inset-0 -z-10">
        {/* IMAGEN LCP (no lazy), alto contraste con overlay */}
        <img
          src="assets/hero/heroPoster.webp"
          srcSet="assets/hero/heroPoster-768.webp 768w, assets/hero/heroPoster.webp 1344w"
          sizes="100vw"
          alt="Agenda personalizada sobre mesa, tapa con nombre y vista del interior"
          width={1344}
          height={768}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />

        {/* VIDEO decorativo (no bloquea LCP) */}
        {playVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="assets/hero/heroPoster.webp"
            aria-hidden="true"
          >
            <source src="assets/hero/heroLoop-opt.mp4" type="video/mp4" />
          </video>
        )}

        {/* Overlay para contraste WCAG */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      </div>

      {/* Contenido */}
      <div className="container relative z-10 px-4">
        <div className="max-w-[44rem] text-white space-y-6">
          <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-primary-light">
            ✨ Nueva colección 2027
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Tu agenda, <span className="underline decoration-primary/70">a tu medida</span>
          </h1>

          <p className="text-base sm:text-xl text-white/90">
            Agendas y cuadernos artesanales con{" "}
            <strong>personalización total</strong>: nombre, frase, foto o tramas.
            Hecho a mano en San Nicolás de los Arroyos, con entrega rápida.
          </p>

          {/* CTA primario/secundario */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="px-7">
              <Link to="/catalogo" aria-label="Ir al catálogo y comprar ahora">
                Comprar ahora
              </Link>
            </Button>
            <WhatsAppButton
              className="px-7"
              message="¡Hola! Quiero personalizar mi agenda/cuaderno. ¿Me ayudás a elegir modelo y tapa? ✨"
              aria-label="Chatear por WhatsApp para personalizar"
            />
          </div>

          {/* Trust + Objeciones resueltas */}
          <ul className="hidden mt-4 md:grid grid-cols-3 gap-4 text-left text-[0.8rem] sm:text-sm">
            <li className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-light">100%</span>
              <span className="text-white/85">Personalizable</span>
            </li>
            <li className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-light">48&nbsp;h</span>
              <span className="text-white/85">Entrega rápida</span>
            </li>
            <li className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-light">
                {modeloOptions.length}
              </span>
              <span className="text-white/85">Diseños 2027</span>
            </li>
          </ul>

          {/* Atajos a categorías de alta intención */}
          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Accesos rápidos a categorías"
          >
            {[
              { to: "/catalogo?interior=semanal", label: "Agenda semanal" },
              { to: "/catalogo?interior=diaria", label: "Agenda diaria" },
              { to: "/catalogo?cat=cuadernos&size=A4", label: "Cuadernos A4" },
              { to: "/catalogo?cat=cuadernos&size=A5", label: "Cuadernos A5" },
            ].map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className="rounded-full bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 backdrop-blur-sm"
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {/* Micro-reseña/UGC (no LCP) */}
          <div className="mt-4 text-white/85 text-sm">
            ★★★★★ “La personalización quedó perfecta y llegó rapidísimo.” — Sofía, SN
          </div>
        </div>
      </div>
    </section>
  );
}
