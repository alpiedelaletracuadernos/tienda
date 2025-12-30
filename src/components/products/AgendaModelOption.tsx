// src/components/product/AgendaModelSelector.tsx
import { useId, useRef, useEffect, useCallback, useState } from "react";
import clsx from "clsx";

export type AgendaModelOption = {
  id: string;
  image: string;   // URL de la miniatura
  modelo: string;  // ej: "semanal", "dos-dias", "universitaria", etc.
  collection: string;  // ej: "semanal", "dos-dias", "universitaria", etc.
};

type Props = {
  label?: string;
  options: AgendaModelOption[];
  value?: string | null; // modelo seleccionado
  onChange?: (id: string) => void;
  className?: string;
};

export function AgendaModelSelector({
  label = "Modelo de agenda",
  options,
  value,
  onChange,
  className,
}: Props) {
  const groupId = useId();
  const [internal, setInternal] = useState<string | null>(value ?? null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Mantener controlado/semicontrolado
  useEffect(() => {
    if (typeof value !== "undefined") setInternal(value);
  }, [value]);

  const setSelected = useCallback(
    (id: string) => {
      if (typeof value === "undefined") setInternal(id);
      onChange?.(id);
    },
    [onChange, value]
  );

  // Navegación con flechas (ARIA radios)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex(o => (internal ?? "") === o.modelo);
    const focusAt = (idx: number) => refs.current[idx]?.focus();

    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const next = (currentIndex + 1 + options.length) % options.length;
      setSelected(options[next].modelo);
      focusAt(next);
    } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const prev = (currentIndex - 1 + options.length) % options.length;
      setSelected(options[prev].id);
      focusAt(prev);
    }
  };

  return (
    <div className={clsx("space-y-2", className)}>

      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className={clsx("w-full max-w-full min-w-0",
          "flex flex-row flex-nowrap items-stretch gap-3",
          "overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth",
          // estilizado de scrollbar
          "[scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]",
          "[&::-webkit-scrollbar]:h-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-slate-400/60 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          // padding lateral suave y evita recortes
          "px-2 py-2")}
        onKeyDown={handleKeyDown}
      >
        {options.map((opt, idx) => {
          const checked = internal === opt.id;
          return (
            <div key={opt.id} className="snap-start flex-none">
              <button
                key={opt.id}
                ref={el => (refs.current[idx] = el)}
                role="radio"
                aria-checked={checked}
                aria-label={opt.id}
                onClick={() => setSelected(opt.id)}
                className={clsx(
                  "group relative overflow-hidden rounded-xl",
                    "w-28 sm:w-32 md:w-36 aspect-[3/4]", // tamaño fijo y apreciable
                    "bg-white ring-1 ring-slate-300/60",
                  checked
                    ? "ring-4 ring-primary ring-offset-2"
                    : "hover:ring-2 hover:ring-slate-400/60",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                )}
                tabIndex={checked || (internal == null && idx === 0) ? 0 : -1}
              >
                  <img
                    src={opt.image}
                    alt={`Modelo ${opt.id}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* Check visual */}
                  {checked && (
                    <span className="absolute inset-0 pointer-events-none bg-black/0" />
                  )}
              </button>
          </div>
          );
        })}
        
      </div>

      
    </div>
  );
}
