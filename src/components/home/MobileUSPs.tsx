// src/components/brand/MobileUSPs.tsx
import { Clock, Sparkles, LayoutGrid, ShieldCheck, MessageSquare } from "lucide-react";

type USP = {
  icon: React.ElementType;
  headline: string;
  sub: string;
};

const USPS: USP[] = [
  { icon: Sparkles,   headline: "100%", sub: "Personalizable" },
  { icon: Clock,      headline: "48 h", sub: "Entrega rápida" },
  { icon: LayoutGrid, headline: "+60",  sub: "Modelos listos" },
  { icon: ShieldCheck,headline: "Premium", sub: "Materiales y terminación" },
  { icon: MessageSquare, headline: "1:1", sub: "Atención por WhatsApp" },
];

export default function MobileUSPs() {
  return (
    <section
      aria-label="Beneficios de la marca"
      className="md:hidden relative w-full py-6"
    >
      <div className="container px-4">
        {/* Cinta scrollable (no invade el ancho de la página) */}
        <ul
          className="
            w-full max-w-full min-w-0
            flex flex-nowrap gap-3
            overflow-x-auto overflow-y-hidden
            snap-x snap-mandatory scroll-smooth
            [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-400/60
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
            [&::-webkit-scrollbar-thumb]:rounded-full
            -mx-2 px-2 py-3
          "
          role="list"
        >
          {USPS.map(({ icon: Icon, headline, sub }, i) => (
            <li
              key={i}
              className="
                snap-center flex-none
                rounded-2xl ring-1 ring-slate-200 bg-white/90
                backdrop-blur supports-[backdrop-filter]:bg-white/70
                shadow-sm
                px-4 py-3
                min-w-[9.5rem]  /* tamaño cómodo de lectura en móvil */
                text-center select-none
              "
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold text-primary">{headline}</span>
                <span className="text-[0.8rem] text-slate-800">{sub}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Nota opcional (ayuda a conversión y confianza) */}
        <p className="mt-3 text-xs text-slate-500">
          Producción artesanal, boceto previo sin costo y múltiples medios de pago.
        </p>
      </div>
    </section>
  );
}
