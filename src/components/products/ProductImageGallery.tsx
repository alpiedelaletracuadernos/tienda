// src/components/products/ProductImageGallery.tsx
import { useState, useId, useRef, useEffect } from "react";
import { Maximize2, Play } from "lucide-react";
import clsx from "clsx";

type Props = {
  images: string[];                 // puede contener URLs de imágenes o videos
  altBase?: string;
  className?: string;
  onOpenFullscreen?: (src: string) => void;
};

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;
const isVideo = (src: string) => {
  // Ignora querystrings al evaluar la extensión
  const clean = src.split("?")[0];
  return VIDEO_EXT_RE.test(clean);
};

export default function ProductImageGallery({
  images,
  altBase = "Imagen de producto",
  className,
  onOpenFullscreen,
}: Props) {
  const [index, setIndex] = useState(0);
  const groupId = useId();
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (index > images.length - 1) setIndex(0);
  }, [images, index]);

  const select = (i: number) => setIndex(i);

  const onKeyDownThumbs = (e: React.KeyboardEvent) => {
    if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1;
    const next = (index + dir + images.length) % images.length;
    setIndex(next);
    thumbRefs.current[next]?.focus();
  };

  const currentSrc = images[index];
  const currentIsVideo = isVideo(currentSrc);

  return (
    <section
      className={clsx(
        "w-full max-w-full min-w-0",
        "grid gap-4 lg:grid-cols-[100px,1fr]",
        className
      )}
      aria-roledescription="gallery"
      aria-label="Galería de imágenes del producto"
    >
      {/* Thumbs */}
      <div className="order-2 lg:order-1 min-w-0">
        {/* Mobile: fila con scroll-x */}
        <div
          className="
            flex lg:hidden flex-nowrap gap-3
            overflow-x-auto overflow-y-hidden
            snap-x snap-mandatory scroll-smooth
            py-1 px-2
            [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-400/60
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
            [&::-webkit-scrollbar-thumb]:rounded-full
          "
          role="listbox"
          aria-label="Miniaturas"
          aria-activedescendant={`${groupId}-thumb-${index}`}
          onKeyDown={onKeyDownThumbs}
        >
          {images.map((src, i) => {
            const selected = i === index;
            const video = isVideo(src);
            return (
              <button
                key={i}
                ref={(el) => (thumbRefs.current[i] = el)}
                id={`${groupId}-thumb-${i}`}
                role="option"
                aria-selected={selected}
                className={clsx(
                  "relative snap-center flex-none w-20 h-20 rounded-xl overflow-hidden ring-1 ring-slate-300/50 bg-white shadow-sm",
                  selected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-slate-400/60"
                )}
                onClick={() => select(i)}
                title={video ? "Miniatura de video" : `Miniatura ${i + 1}`}
              >
                {video ? (
                  <>
                    <video
                      src={src}
                      preload="metadata"     // no descarga el video completo
                      muted
                      playsInline            // iOS: reproducción inline
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="rounded-full bg-black/50 text-white p-1.5">
                        <Play className="w-4 h-4" />
                      </span>
                    </span>
                  </>
                ) : (
                  <img
                    src={src}
                    alt={`${altBase} miniatura ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop: columna con scroll-y */}
        <div
          className="
            hidden lg:flex lg:flex-col gap-3
            lg:max-h-[50svh] xl:max-h-[55svh] min-h-0
            overflow-y-auto pr-1
            snap-y snap-mandatory
            [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-400/60
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
            [&::-webkit-scrollbar-thumb]:rounded-full
          "
          role="listbox"
          aria-label="Miniaturas"
          aria-activedescendant={`${groupId}-thumb-${index}`}
          onKeyDown={onKeyDownThumbs}
        >
          {images.map((src, i) => {
            const selected = i === index;
            const video = isVideo(src);
            return (
              <button
                key={i}
                ref={(el) => (thumbRefs.current[i] = el)}
                id={`${groupId}-thumb-${i}`}
                role="option"
                aria-selected={selected}
                className={clsx(
                  "relative snap-start w-full aspect-square rounded-xl overflow-hidden ring-1 ring-slate-300/50 bg-white shadow-sm",
                  selected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-slate-400/60"
                )}
                onClick={() => select(i)}
                title={video ? "Miniatura de video" : `Miniatura ${i + 1}`}
              >
                {video ? (
                  <>
                    <video
                      src={src}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="rounded-full bg-black/50 text-white p-1.5">
                        <Play className="w-4 h-4" />
                      </span>
                    </span>
                  </>
                ) : (
                  <img
                    src={src}
                    alt={`${altBase} miniatura ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vista principal (imagen o video) */}
      <div className="order-1 lg:order-2 relative min-w-0">
        <div
          className="
            w-full max-w-full h-auto mx-auto
            rounded-2xl bg-muted/60 ring-1 ring-slate-200 overflow-hidden
            flex items-center justify-center
            p-3 sm:p-4
            max-h-[70svh] sm:max-h-[75svh] md:max-h-[80svh]
          "
        >
          {currentIsVideo ? (
            <video
              key={currentSrc}      // fuerza refresco al cambiar
              src={currentSrc}
              controls
              playsInline
              preload="metadata"
              className="max-w-full max-h-full object-contain"
              // poster="(opcional) /ruta/preview.jpg"
              aria-label={`${altBase} (video) ${index + 1} de ${images.length}`}
            >
              {/* Si querés ofrecer varios formatos: */}
              {/* <source src="/ruta/video.webm" type="video/webm" />
                  <source src="/ruta/video.mp4" type="video/mp4" /> */}
            </video>
          ) : (
            <img
              src={currentSrc}
              alt={`${altBase} ${index + 1} de ${images.length}`}
              className="max-w-full max-h-full object-contain select-none"
            />
          )}

          
        </div>
        {onOpenFullscreen && (
          <button
            type="button"
            aria-label="Ver en pantalla completa"
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-black/40 text-white p-2 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => onOpenFullscreen(currentSrc)}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
