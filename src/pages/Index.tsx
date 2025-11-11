import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowToOrder } from '@/components/home/HowToOrder';
import { Testimonials } from '@/components/home/Testimonials';
import { ShippingInfo } from '@/components/home/ShippingInfo';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import  MobileUSPs from '@/components/home/MobileUSPs';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <Header />
      <main>
        <Hero />
        <MobileUSPs />
        <FeaturedProducts />
        <HowToOrder />
        <Testimonials />
        <ShippingInfo />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </div>
  );
};

export default Index;
