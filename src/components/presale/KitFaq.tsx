// src/components/presale/KitFaq.tsx
// Preguntas frecuentes del kit: responden las objeciones típicas de una
// preventa (cuándo llega, envío, pago, personalización, arrepentimiento).
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { presale } from '@/config/presale';

const FAQ = [
  {
    q: '¿Cuándo lo recibo?',
    a: `${presale.delivery}, sin importar el día en que compres dentro de la preventa.`,
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí, enviamos a todo el país. También podés retirarlo sin cargo en San Nicolás de los Arroyos. El costo del envío lo coordinamos por WhatsApp antes de confirmar el pedido.',
  },
  {
    q: '¿Cómo pago?',
    a: 'Con efectivo, transferencia o Mercado Pago. Al finalizar la compra te escribimos por WhatsApp con los datos.',
  },
  {
    q: '¿Puedo personalizar la tapa?',
    a: 'El kit no incluye personalización: elegís uno de los diseños 2027 para la agenda. Si querés una tapa personalizada, la agenda sola sí se puede personalizar.',
  },
  {
    q: '¿Qué pasa después del 16/10?',
    a: 'La preventa cierra y el kit deja de estar disponible. Las agendas 2027 siguen a la venta por separado.',
  },
  {
    q: '¿Y si me arrepiento?',
    a: 'Tenés 10 días corridos desde que lo recibís para arrepentirte de la compra (Ley 24.240, art. 34). Escribinos por WhatsApp y lo resolvemos.',
  },
];

export function KitFaq() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-1">Preguntas frecuentes</h2>
      <Accordion type="single" collapsible className="w-full">
        {FAQ.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
