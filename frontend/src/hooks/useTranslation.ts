'use client';

import { useAuthStore } from '@/store/authStore';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';

const translations = {
    en,
    fr,
    es
} as const;

type Locale = keyof typeof translations;

export function useTranslation() {
    const { user } = useAuthStore();
    const locale = (user?.preferences?.language || 'en') as Locale;

    // Fallback to English if locale not found
    const dictionary = translations[locale] || translations.en;

    const t = (path: string) => {
        const keys = path.split('.');
        let result: any = dictionary;

        for (const key of keys) {
            if (result[key] === undefined) {
                // Try fallback to English
                let fallback: any = translations.en;
                for (const fallbackKey of keys) {
                    fallback = fallback?.[fallbackKey];
                }
                return fallback || path;
            }
            result = result[key];
        }

        return result;
    };

    return { t, locale };
}
