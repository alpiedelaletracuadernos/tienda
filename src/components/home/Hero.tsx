// src/components/landing/Hero.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { modeloOptions } from "@/data/options";

// Portada 2027: video vertical (9:16).
//  · Mobile: el video es el fondo de pantalla completa.
//  · Desktop (md+): el video va en una tarjeta vertical a la derecha del texto,
//    sobre un fondo con el primer cuadro ampliado y desenfocado.
// El primer cuadro (poster) es la imagen LCP y se ve al instante; el video se
// monta recién después de que la página terminó de cargar, y nunca con
// "ahorro de datos" o "reducir movimiento" activados.

const POSTER = "assets/hero/hero-2027-poster.webp";
const POSTER_SRCSET =
  "assets/hero/hero-2027-poster-480.webp 480w, assets/hero/hero-2027-poster.webp 720w";
const POSTER_ALT = "Agendas 2027 de Al Pie de la Letra con tapas de colores";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function useCanPlayHeroVideo() {
  const calm = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.readyState === "complete") {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);
  const saveData =
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
  return loaded && !calm && !saveData;
}

function HeroVideo({ className }: { className?: string }) {
  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={POSTER}
      aria-hidden="true"
    >
      {/* VP9 (más liviano) primero; H.264 para Safari y equipos viejos */}
      <source src="assets/hero/hero-2027.webm" type="video/webm" />
      <source src="assets/hero/hero-2027.mp4" type="video/mp4" />
    </video>
  );
}

export default function Hero() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const playVideo = useCanPlayHeroVideo();
  return (
    <section
      className="relative isolate min-h-[90svh] flex items-center overflow-hidden"
      aria-label="Agendas y cuadernos artesanales personalizables"
    >
      {/* Fondo: primer cuadro (LCP). En desktop, ampliado y desenfocado. */}
      <div className="absolute inset-0 -z-10">
        <img
          src={POSTER}
          srcSet={POSTER_SRCSET}
          sizes="100vw"
          alt=""
          width={720}
          height={1280}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover md:scale-110 md:blur-2xl"
        />

        {/* Mobile: el video es el fondo */}
        {playVideo && !isDesktop && (
          <HeroVideo className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Overlay para contraste del texto blanco (el video es muy claro) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45 md:bg-gradient-to-r md:from-black/70 md:via-black/45 md:to-black/10" />
      </div>

      {/* Contenido */}
      <div className="container relative z-10 px-4 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 lg:gap-16">
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

        {/* Desktop: video en tarjeta vertical */}
        <div className="hidden md:block relative aspect-[9/16] h-[min(72svh,640px)] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
          <img
            src={POSTER}
            alt={POSTER_ALT}
            width={720}
            height={1280}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {playVideo && isDesktop && <HeroVideo className="absolute inset-0 h-full w-full object-cover" />}
        </div>
      </div>
    </section>
  );
}
