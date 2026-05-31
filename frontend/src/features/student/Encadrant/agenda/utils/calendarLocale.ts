const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

export function getAgendaLocale(language: string): string {
  return localeMap[language] ?? localeMap.fr;
}
