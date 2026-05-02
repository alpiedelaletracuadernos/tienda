// src/pages/Index.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowToOrder } from '@/components/home/HowToOrder';
import { Testimonials } from '@/components/home/Testimonials';
import { ShippingInfo } from '@/components/home/ShippingInfo';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import MobileUSPs from '@/components/home/MobileUSPs';
import Promo2x1Modal from '@/components/promos/Promo2x1';
import HotSaleBanner from '@/components/promos/HotSaleBanner';
import HotSaleModal from '@/components/promos/HotSaleModal';
import AppVars from '../data/data';

//promociones
import vars from '@/data/data';

const LADDER_LABEL = '15% en 1u • 20% en 2u • 30% en 3+u';

const BLACK_FRIDAY_ACTIVE = false;

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <HotSaleBanner />
      <HotSaleModal />
      {vars.promotions.twoForOne.enabled && (
        <>
          {/* ——— Barra de anuncio 2x1 ——— */}
          <div className="sticky top-16 z-40 w-full bg-amber-50/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-amber-100">
            <div className="container px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-center">
                {/* etiqueta responsive (envuelve a varias líneas si hace falta) */}
                {/* <span className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-1 text-[0.8rem] font-semibold text-amber-800 whitespace-normal break-words">
              {LADDER_LABEL}
            </span> */}
                <a
                  href="/catalogo"
                  className=" inline text-sm font-medium text-amber-800 underline underline-offset-4 hover:no-underline"
                >
                  2x1 en diseños en stock. ¡Aprovechá la oferta!
                </a>
              </div>
            </div>
          </div>

          {/* ——— Modal 2×1 (sólo diseños en stock) con delay/cooldown ——— */}
          <Promo2x1Modal
            waNumber={AppVars.phoneNumber}
            cooldownDays={7} // no reabrir por 7 días tras cerrar
            delayMs={5500} // delay mínimo recomendado para no ser intrusivo
          />
        </>
      )}
      {vars.promotions.discount.enabled && (
        <>
          {/* ——— Barra de anuncio 2x1 ——— */}
          <div className="sticky top-16 z-40 w-full bg-amber-50/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-amber-100">
            <div className="container px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-center">
                {/* etiqueta responsive (envuelve a varias líneas si hace falta) */}
                {/* <span className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-1 text-[0.8rem] font-semibold text-amber-800 whitespace-normal break-words">
              {LADDER_LABEL}
            </span> */}
                <a
                  href="/catalogo"
                  className=" inline text-sm font-medium text-amber-800 underline underline-offset-4 hover:no-underline"
                >
                  Descuento del {vars.promotions.discount.percentage}% en diseños seleccionados
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      <Header />
      <main>
        <Hero />
        <MobileUSPs />
        <FeaturedProducts />

        <section id="como-pedir" className="scroll-mt-24">
          <HowToOrder />
        </section>

        <section id="opiniones" className="scroll-mt-24">
          <Testimonials />
        </section>

        <section id="contacto" className="scroll-mt-24">
          <ShippingInfo />
        </section>
      </main>

      <Footer />
      <WhatsAppButton variant="floating" />
    </div>
  );
};

export default Index;
