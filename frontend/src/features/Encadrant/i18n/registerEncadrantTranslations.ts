import i18n from 'i18next';
import { encadrantCopyAr } from './locales/encadrant-copy.ar';
import { encadrantCopyEn } from './locales/encadrant-copy.en';
import { encadrantCopyFr } from './locales/encadrant-copy.fr';

let registered = false;

/** Merges Encadrant portal UI copy into i18n resources. */
export function registerEncadrantTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle('en', 'translation', { encadrant: encadrantCopyEn }, true, true);
  i18n.addResourceBundle('fr', 'translation', { encadrant: encadrantCopyFr }, true, true);
  i18n.addResourceBundle('ar', 'translation', { encadrant: encadrantCopyAr }, true, true);
}
