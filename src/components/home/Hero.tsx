// src/components/landing/Hero.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Importá dos assets:
// 1) heroPoster.webp (LCP): imagen estática optimizada (2000–2400px ancho)
// 2) heroLoop.mp4 (opcional): loop sutil <8s, muted; NO debe ser LCP
import heroPoster from "@/hero/heroPosterAlt.png";
import heroPosterJpg from "@/assets/hero/heroPosterAlt.png"; // fallback
import heroLoop from "@/assets/hero/heroLoop.mp4"; // opcional

export default function Hero() {
  return (
    <section
      className="relative isolate min-h-[90svh] flex items-center overflow-hidden"
      aria-label="Agendas y cuadernos artesanales personalizables"
    >
      {/* Background media: video opcional + imagen LCP como capa */}
      <div className="absolute inset-0 -z-10">
        {/* IMAGEN LCP (no lazy), alto contraste con overlay */}
        <picture>
          <source srcSet="public/hero/heroPoster.jpg" type="image/webp" />
          <img
            src="public/hero/heroPoster.jpg"
            alt="Agenda personalizada sobre mesa, tapa con nombre y vista del interior"
            width={2400}
            height={1400}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover"
          />
        </picture>

        {/* VIDEO decorativo opcional (no bloquea LCP) */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-0 md:opacity-100"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="public/hero/heroLoop.mp4" type="video/mp4" />
        </video>

        {/* Overlay para contraste WCAG */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      </div>

      {/* Contenido */}
      <div className="container relative z-10 px-4">
        <div className="max-w-[44rem] text-white space-y-6">
          {/* Eyebrow con escasez/urgencia moderada */}
          <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-primary-200">
            ✨ Cupos limitados · Hasta 15 por semana
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
              <span className="text-xl sm:text-2xl font-bold text-primary-300">100%</span>
              <span className="text-white/85">Personalizable</span>
            </li>
            <li className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-300">48&nbsp;h</span>
              <span className="text-white/85">Entrega rápida</span>
            </li>
            <li className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-300">+60</span>
              <span className="text-white/85">Modelos listos</span>
            </li>
          </ul>

          {/* Atajos a categorías de alta intención */}
          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Accesos rápidos a categorías"
          >
            {[
              { to: "/catalogo?cat=agendas&size=A5", label: "Agendas A5" },
              { to: "/catalogo?cat=agendas%20docentes", label: "Docentes" },
              { to: "/catalogo?cat=agendas&interior=perpetua", label: "Perpetuas" },
              { to: "/catalogo?cat=cuadernos&size=A4", label: "Cuadernos A4" },
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
