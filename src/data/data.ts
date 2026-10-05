// src/data/data.ts
// Objeto de variables globales para la aplicación

export interface AppVars {
    appName: string;
    phoneNumber: string; // número de teléfono principal (formato E.164 recomendado)
    email?: string;
    address?: string;
    locale: string;
    apiBaseUrl: string;
    siteUrl: string; // URL pública de la tienda, con barra final
    supportHours?: string;
    social?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        whatsapp?: string;
    };
    maxUploadSizeBytes?: number;
    dateFormat?: string;
    personalizationSurcharge: number; // Recargo por personalizar producto
    promotions: {
        discount: {
            enabled: boolean;
            percentage: number;
            applyToPersonalized: boolean;
            eligibleCategories: string[];
        };
        twoForOne: {
            enabled: boolean;
            applyToPersonalized: boolean;
            eligibleCategories: string[];
        };
        hotSale: {
            enabled: boolean;
            percentage: number;
            applyToPersonalized: boolean;
            startDate: string;   // 'YYYY-MM-DD'
            endDate: string;     // 'YYYY-MM-DD' (inclusive)
            label: string;
            storageKey: string;  // clave localStorage para cooldown del modal
        };
        /** Preventa del producto principal de la temporada (Kit Mi Año 2027). */
        presale: {
            enabled: boolean;
            slug: string;           // producto en preventa
            name: string;
            badge: string;          // etiqueta en card, ficha y barra
            startDate: string;      // 'YYYY-MM-DD'
            endDate: string;        // 'YYYY-MM-DD' (inclusive, hasta las 23:59)
            endLabel: string;       // cómo se nombra el cierre en los textos
            countdownFromDays: number; // "Quedan X días" sólo en los últimos N días
            campaignCode: string;   // va en el mensaje de WhatsApp para identificar pedidos
            ctaLabel: string;       // único texto del botón principal en todo el sitio
            delivery: string;       // plazo de entrega
            closedLabel: string;    // badge cuando terminó
            closedMessage: string;  // texto de la ficha cuando terminó
            barStorageKey: string;  // cierre de la barra superior (por sesión)
            /** Fichas de agenda suelta que muestran la comparación con el kit. */
            compareFrom: Record<string, 'semanal' | 'diaria'>;
        };
    };
}

export const vars: AppVars = {
    appName: 'AlPie Tienda Feliz',
    phoneNumber: '+5493364364774',
    email: 'alpiedelaletracuadernos@gmail.com',
    address: 'Centro, San Nicolas, Argentina',
    locale: 'es-ES',
    apiBaseUrl: '',
    siteUrl: 'https://alpiedelaletracuadernos.github.io/tienda/',
    supportHours: 'Lun-Vie 09:00-18:00',
    social: {
        facebook: 'https://facebook.com/alpie',
        instagram: 'https://www.instagram.com/alpiedelaletra.cuadernos/profilecard/?igsh=NG1sdHY5djZnMm1j',
        whatsapp: '5493364364774'
    },
    maxUploadSizeBytes: 5 * 1024 * 1024, // 5 MB
    dateFormat: 'dd/MM/yyyy',
    personalizationSurcharge: 8000, // Recargo por personalizar la tapa
    promotions: {
        discount: {
            enabled: false,
            percentage: 0,
            applyToPersonalized: true,
            eligibleCategories: ['agendas', 'agendas docentes']
        },
        twoForOne: {
            enabled: false,
            applyToPersonalized: false,
            eligibleCategories: ['agendas', 'agendas docentes']
        },
        hotSale: {
            enabled: false,
            percentage: 25,
            applyToPersonalized: true,
            startDate: '2026-05-11',
            endDate:   '2026-05-13',
            label:     'Hot Sale',
            storageKey: 'hs26_modal_seen',
        },
        presale: {
            enabled: true,
            slug: 'kit-mi-ano-2027',
            name: 'Kit Mi Año 2027',
            badge: 'PREVENTA',
            startDate: '2026-10-05',
            endDate:   '2026-10-16',
            endLabel:  'el viernes 16/10',
            countdownFromDays: 5,
            campaignCode: 'KIT27',
            ctaLabel: 'Quiero mi kit',
            delivery: 'Se entrega 5 días hábiles después de la compra',
            closedLabel: 'PREVENTA CERRADA',
            closedMessage:
                'La preventa del Kit Mi Año 2027 cerró el 16/10. Las agendas 2027 siguen disponibles por separado.',
            barStorageKey: 'presale27_bar_dismissed',
            compareFrom: {
                'agenda-semanal-a5': 'semanal',
                'agenda-diaria-a5': 'diaria',
            },
        }
    }
};

export default vars;