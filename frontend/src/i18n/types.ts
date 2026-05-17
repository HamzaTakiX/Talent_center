export type AppLanguage = 'fr' | 'en' | 'ar';

export const APP_LANGUAGES: AppLanguage[] = ['fr', 'en', 'ar'];

export const isRtlLanguage = (lang: AppLanguage): boolean => lang === 'ar';
