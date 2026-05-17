import i18n from 'i18next';
import { adminChatMocksAr } from './locales/admin-chat-mocks.ar';
import { adminChatMocksFr } from './locales/admin-chat-mocks.fr';
import { adminCopyAr } from './locales/admin-copy.ar';
import { adminCopyEn } from './locales/admin-copy.en';
import { adminCopyFr } from './locales/admin-copy.fr';

let registered = false;

/** Merges extended admin UI copy (pages, charts, search, back) into i18n resources. */
export function registerAdminTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle('en', 'translation', { admin: adminCopyEn }, true, true);
  i18n.addResourceBundle(
    'fr',
    'translation',
    { admin: { ...adminCopyFr, chatMocks: adminChatMocksFr } },
    true,
    true
  );
  i18n.addResourceBundle(
    'ar',
    'translation',
    { admin: { ...adminCopyAr, chatMocks: adminChatMocksAr } },
    true,
    true
  );
}
