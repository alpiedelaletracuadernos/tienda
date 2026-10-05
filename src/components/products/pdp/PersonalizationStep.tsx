// src/components/products/pdp/PersonalizationStep.tsx
// Paso "¿Lo querés personalizado?" de la ficha de producto.
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StepSection } from '@/components/products/StepSection';
import { formatARS } from '@/lib/currency';
import type { PersonalizationStyleId } from '@/lib/whatsapp';
import vars from '@/data/data';

const PERSONALIZATION_STYLES: { id: PersonalizationStyleId; label: string }[] = [
  { id: 'nombre', label: 'Nombre/Iniciales' },
  { id: 'frase', label: 'Frase/Versículo' },
  { id: 'foto', label: 'Foto/Imagen' },
  { id: 'trama', label: 'Trama/Patrón' },
  { id: 'logo', label: 'Logo/Marca' },
];

type Props = {
  step: number;
  isCustom: boolean;
  onCustomChange: (v: boolean) => void;
  styleId: PersonalizationStyleId;
  onStyleChange: (id: PersonalizationStyleId) => void;
  text: string;
  onTextChange: (v: string) => void;
};

export function PersonalizationStep({
  step,
  isCustom,
  onCustomChange,
  styleId,
  onStyleChange,
  text,
  onTextChange,
}: Props) {
  return (
    <StepSection
      step={step}
      title="¿Lo querés personalizado?"
      hint={`+${formatARS(vars.personalizationSurcharge)} sobre el precio de lista`}
    >
      <div className="space-y-4 rounded-2xl border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="isCustom" className="cursor-pointer">
            Personalizar con nombre, foto, frase o trama
          </Label>
          <Switch id="isCustom" checked={isCustom} onCheckedChange={onCustomChange} />
        </div>

        {isCustom && (
          <div className="space-y-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Portada o interior: <strong>foto</strong>, <strong>frase</strong>,{' '}
              <strong>nombre</strong> o <strong>trama</strong>. Lo definimos por WhatsApp
              con <em>boceto previo</em>.
            </p>

            {/* Estilos */}
            <div
              role="radiogroup"
              aria-label="Estilos de personalización"
              className="flex flex-wrap gap-2"
            >
              {PERSONALIZATION_STYLES.map((s) => {
                const selected = styleId === s.id;
                return (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onStyleChange(s.id)}
                    className={[
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      'ring-1 ring-border',
                      selected
                        ? 'bg-primary text-primary-foreground ring-primary'
                        : 'bg-background hover:bg-muted',
                    ].join(' ')}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Texto opcional */}
            <div className="space-y-2">
              <Label htmlFor="personalization">Texto (opcional)</Label>
              <Input
                id="personalization"
                placeholder='Ej.: "María" o "¡Vamos por más!"'
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground">
                Si elegís “Foto/Logo”, te pediremos el archivo por WhatsApp.
              </p>
            </div>

            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • Boceto incluido (1 revisión). Producción: 8–10 h. Entrega rápida 24–48 h
                (con recargo).
              </li>
              <li>• Para fotos: luz natural y al menos ~1500 px del lado más corto.</li>
            </ul>
          </div>
        )}
      </div>
    </StepSection>
  );
}
