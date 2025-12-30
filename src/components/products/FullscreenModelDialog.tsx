// src/components/product/FullscreenModelDialog.tsx
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Maximize2, X } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  trigger?: React.ReactNode;
  openModel: string;
   // botón o thumbnail que abre el modal
};

export default function FullscreenModelDialog({ src, alt = "Modelo", trigger, openModel}: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(!open);
  }, [openModel]);
  
  useEffect(() => {
    setOpen(false)
    }, []);
  const enterFullscreen = async () => {
    // Fullscreen API
    if (boxRef.current && boxRef.current.requestFullscreen) {
      try { await boxRef.current.requestFullscreen(); } catch { /* noop */ }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="w-full rounded-xl ring-1 ring-muted-foreground/20 overflow-hidden"
            aria-label="Ver modelo en grande"
          >
            <img src={src} alt={alt} className="h-full w-auto object-cover" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="
          p-0 gap-0 bg-black overflow-hidden
          w-screen max-w-[min(100vw,1024px)]
          h-[85svh] md:h-[90svh]   /* mejor que 100vh en mobile */
        "
        aria-label="Vista ampliada del modelo"
      >
        <div className="relative w-full h-full min-h-0"> {/* min-h-0 evita overflow en flex/grid */}
          <TransformWrapper
            initialScale={1}
            minScale={1}
            limitToBounds
            centerOnInit
            wheel={{ step: 0.15 }}
            doubleClick={{ mode: "zoomIn" }}
            pinch={{ step: 5 }}
            panning={{ velocityDisabled: true }}
          >
            {/* Forzamos alto completo del área visible */}
            <TransformComponent
              wrapperClass="w-full h-full"                       // ocupa todo el Dialog
              contentClass="w-full h-full flex items-center justify-center" // centra la imagen
            >
              <img
                src={src}
                alt={alt}
                className="
                  max-h-full max-w-full
                  object-contain select-none   /* nunca se sale del contenedor */
                "
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Controles... (igual que antes) */}
        </div>
      </DialogContent>

    </Dialog>
  );
}
