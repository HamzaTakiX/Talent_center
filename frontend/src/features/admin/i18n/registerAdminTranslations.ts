import i18n from 'i18next';
import { adminChatMocksAr } from './locales/admin-chat-mocks.ar';
import { adminChatMocksFr } from './locales/admin-chat-mocks.fr';
import { adminCopyAr } from './locales/admin-copy.ar';
import { adminCopyEn } from './locales/admin-copy.en';
import { adminCopyFr } from './locales/admin-copy.fr';
import { announcementsModuleAr } from './locales/announcements-module.ar';
import { announcementsModuleEn } from './locales/announcements-module.en';
import { announcementsModuleFr } from './locales/announcements-module.fr';
import { documentsModuleAr } from './locales/documents-module.ar';
import { documentsModuleEn } from './locales/documents-module.en';
import { documentsModuleFr } from './locales/documents-module.fr';

let registered = false;

/** Merges extended admin UI copy (pages, charts, search, back) into i18n resources. */
export function registerAdminTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle(
    'en',
    'translation',
    { admin: { ...adminCopyEn, announcementsModule: announcementsModuleEn, documentsModule: documentsModuleEn } },
    true,
    true,
  );
  i18n.addResourceBundle(
    'fr',
    'translation',
    {
      admin: {
        ...adminCopyFr,
        chatMocks: adminChatMocksFr,
        announcementsModule: announcementsModuleFr,
        documentsModule: documentsModuleFr,
      },
    },
    true,
    true,
  );
  i18n.addResourceBundle(
    'ar',
    'translation',
    {
      admin: {
        ...adminCopyAr,
        chatMocks: adminChatMocksAr,
        announcementsModule: announcementsModuleAr,
        documentsModule: documentsModuleAr,
      },
    },
    true,
    true,
  );
}
