import i18n from 'i18next';
import { studentCopyAr } from './locales/student-copy.ar';
import { studentCopyEn } from './locales/student-copy.en';
import { studentCopyFr } from './locales/student-copy.fr';

let registered = false;

/** Merges student portal UI copy into i18n resources. */
export function registerStudentTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle('en', 'translation', { student: studentCopyEn }, true, true);
  i18n.addResourceBundle('fr', 'translation', { student: studentCopyFr }, true, true);
  i18n.addResourceBundle('ar', 'translation', { student: studentCopyAr }, true, true);
}
