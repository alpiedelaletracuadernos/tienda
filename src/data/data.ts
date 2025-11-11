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
    dateFormat: 'dd/MM/yyyy'
};

export default vars;