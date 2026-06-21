import { FunctionComponent } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import AdminLanguageSwitcher from './AdminLanguageSwitcher';
import AdminNotificationButton from './AdminNotificationButton';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../context/AdminThemeContext';
import AdminUserMenu from './AdminUserMenu';
import {
  AdminHeaderSearchDesktop,
  AdminHeaderSearchMobile,
  AdminHeaderSearchProvider,
} from '../../search/components/AdminHeaderSearch';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

const AdminHeader: FunctionComponent<AdminHeaderProps> = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useAdminTheme();
  const { t } = useTranslation();

  const getPageTitle = (): string => {
    if (pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard/')) {
      return t('admin.header.titles.dashboard');
    }
    if (pathname.startsWith('/admin/students') || pathname.startsWith('/admin/student')) {
      return t('admin.header.titles.students');
    }
    if (pathname.startsWith('/admin/encadrant') || pathname.startsWith('/admin/encadrants')) {
      return t('admin.header.titles.encadrants');
    }
    if (pathname.startsWith('/admin/admins') || pathname.startsWith('/admin/sous-admin')) {
      return t('admin.header.titles.admins');
    }
    if (pathname.startsWith('/admin/internship-offers')) return t('admin.header.titles.internshipOffers');
    if (pathname.startsWith('/admin/announcements')) return t('admin.header.titles.announcements');
    if (pathname.startsWith('/admin/documents/catalog')) {
      return t('admin.header.titles.documentsCatalog');
    }
    if (pathname.startsWith('/admin/documents')) return t('admin.header.titles.documents');
    if (pathname.startsWith('/admin/srf')) return t('admin.header.titles.srf');
    if (pathname.startsWith('/admin/history')) return t('admin.header.titles.history');
    if (pathname === '/admin/profile' || pathname === '/admin/settings') {
      return t('admin.header.titles.account');
    }
    return t('admin.header.defaultTitle');
  };

  const pageTitle = getPageTitle();

  return (
    <AdminHeaderSearchProvider>
      <header className="admin-glass relative z-30 flex h-14 shrink-0 items-center justify-between gap-2 overflow-visible border-b border-[var(--admin-border)] px-3 sm:h-[68px] sm:gap-3 sm:px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4"
        >
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-brand-muted)] lg:hidden"
            aria-label={t('admin.header.openMenu')}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-[var(--admin-text)] sm:text-lg">
              {pageTitle}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className="mx-1 hidden min-w-0 max-w-md flex-1 md:mx-2 md:flex"
        >
          <AdminHeaderSearchDesktop />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          <div className="md:hidden">
            <AdminHeaderSearchMobile />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)]"
            aria-label={theme === 'light' ? t('admin.header.darkMode') : t('admin.header.lightMode')}
          >
            {theme === 'light' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>

          <AdminLanguageSwitcher />

          <AdminNotificationButton />

          <AdminUserMenu />
        </motion.div>
      </header>
    </AdminHeaderSearchProvider>
  );
};

export default AdminHeader;
