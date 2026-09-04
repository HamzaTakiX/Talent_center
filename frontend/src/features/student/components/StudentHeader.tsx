import { FunctionComponent } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import AdminLanguageSwitcher from '../../admin/dashboard/components/AdminLanguageSwitcher';
import AdminNotificationButton from '../../admin/dashboard/components/AdminNotificationButton';
import AdminUserMenu from '../../admin/dashboard/components/AdminUserMenu';
import {
  AdminHeaderSearchDesktop,
  AdminHeaderSearchMobile,
  AdminHeaderSearchProvider,
} from '../../admin/search/components/AdminHeaderSearch';
import PlatformHeaderBrand from '../../shared/platform-header/components/PlatformHeaderBrand';
import { getStudentHeaderSubtitleKey, getStudentHeaderTitleKey, getStudentHeaderIcon } from '../utils/studentPageTitle';

interface StudentHeaderProps {
  onMenuClick?: () => void;
}

const StudentHeader: FunctionComponent<StudentHeaderProps> = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useAdminTheme();
  const { t } = useTranslation();
  const pageTitle = t(getStudentHeaderTitleKey(pathname));
  const PageIcon = getStudentHeaderIcon(pathname);
  const subtitleKey = getStudentHeaderSubtitleKey(pathname);
  const subtitle = subtitleKey ? t(subtitleKey) : t('student.header.defaultSubtitle');

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
            aria-label={t('student.header.openMenu')}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>

          <motion.div
            key={pageTitle}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PlatformHeaderBrand
              title={pageTitle}
              subtitle={subtitle}
              icon={PageIcon}
              subtitleClassName="hidden sm:block"
            />
          </motion.div>
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
            aria-label={theme === 'light' ? t('student.header.darkMode') : t('student.header.lightMode')}
          >
            {theme === 'light' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>

          <AdminLanguageSwitcher />
          <AdminNotificationButton />
          <AdminUserMenu profileBasePath="/student/profile" />
        </motion.div>
      </header>
    </AdminHeaderSearchProvider>
  );
};

export default StudentHeader;
