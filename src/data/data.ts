// src/data/data.ts
// Objeto de variables globales para la aplicación

export interface AppVars {
    appName: string;
    phoneNumber: string; // número de teléfono principal (formato E.164 recomendado)
    email?: string;
    address?: string;
    locale: string;
    apiBaseUrl: string;
    supportHours?: string;
    social?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        whatsapp?: string;
    };
    theme?: {
        primary: string;
        secondary?: string;
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
    };
}

export const vars: AppVars = {
    appName: 'AlPie Tienda Feliz',
    phoneNumber: '+5493364364774',
    email: 'alpiedelaletracuadernos@gmail.com',
    address: 'Centro, San Nicolas, Argentina',
    locale: 'es-ES',
    apiBaseUrl: '',
    supportHours: 'Lun-Vie 09:00-18:00',
    social: {
        facebook: 'https://facebook.com/alpie',
        instagram: 'https://www.instagram.com/alpiedelaletra.cuadernos/profilecard/?igsh=NG1sdHY5djZnMm1j',
        whatsapp: '5493364364774'
    },
    theme: {
        primary: '#ff6b6b',
        secondary: '#1a1a1a'
    },
    maxUploadSizeBytes: 5 * 1024 * 1024, // 5 MB
    dateFormat: 'dd/MM/yyyy',
    personalizationSurcharge: 5000, // Recargo $5000 inicial
    promotions: {
        discount: {
            enabled: true,
            percentage: 40,
            applyToPersonalized: true,
            eligibleCategories: ['agendas', 'agendas docentes']
        },
        twoForOne: {
            enabled: true,
            applyToPersonalized: false,
            eligibleCategories: ['agendas', 'agendas docentes']
        }
    }
};

export default vars;