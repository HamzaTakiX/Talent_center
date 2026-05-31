import i18n from 'i18next';
import { studentCopyAr } from './locales/student-copy.ar';
import { studentCopyEn } from './locales/student-copy.en';
import { studentCopyFr } from './locales/student-copy.fr';
import { studentDashboardMocksAr } from './locales/student-dashboard-mocks.ar';
import { studentDashboardMocksEn } from './locales/student-dashboard-mocks.en';
import { studentDashboardMocksFr } from './locales/student-dashboard-mocks.fr';
import { studentAnnouncementsMocksAr } from './locales/student-announcements-mocks.ar';
import { studentAnnouncementsMocksEn } from './locales/student-announcements-mocks.en';
import { studentAnnouncementsMocksFr } from './locales/student-announcements-mocks.fr';
import { studentPortalModulesAr } from './locales/student-portal-modules.ar';
import { studentPortalModulesEn } from './locales/student-portal-modules.en';
import { studentPortalModulesFr } from './locales/student-portal-modules.fr';

function mergeStudentBundles(
  copy: typeof studentCopyFr,
  modules: typeof studentPortalModulesFr,
  dashboardMocks: typeof studentDashboardMocksFr,
  announcementsMocks: typeof studentAnnouncementsMocksFr,
) {
  return {
    ...copy,
    ...modules,
    dashboard: { ...copy.dashboard, mocks: dashboardMocks },
    announcements: { ...modules.announcements, mocks: announcementsMocks },
  };
}

let registered = false;

/** Merges student portal UI copy into i18n resources. */
export function registerStudentTranslations(): void {
  if (registered) return;
  registered = true;
  i18n.addResourceBundle(
    'en',
    'translation',
    {
      student: mergeStudentBundles(
        studentCopyEn,
        studentPortalModulesEn,
        studentDashboardMocksEn,
        studentAnnouncementsMocksEn,
      ),
    },
    true,
    true,
  );
  i18n.addResourceBundle(
    'fr',
    'translation',
    {
      student: mergeStudentBundles(
        studentCopyFr,
        studentPortalModulesFr,
        studentDashboardMocksFr,
        studentAnnouncementsMocksFr,
      ),
    },
    true,
    true,
  );
  i18n.addResourceBundle(
    'ar',
    'translation',
    {
      student: mergeStudentBundles(
        studentCopyAr,
        studentPortalModulesAr,
        studentDashboardMocksAr,
        studentAnnouncementsMocksAr,
      ),
    },
    true,
    true,
  );
}
