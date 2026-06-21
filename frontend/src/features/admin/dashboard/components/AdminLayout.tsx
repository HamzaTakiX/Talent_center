import { FunctionComponent, ReactNode, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminPreferences } from '../../account/context/AdminPreferencesContext';
import { useAdminTheme } from '../context/AdminThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
  mainFillHeight?: boolean;
}

const AdminLayoutInner: FunctionComponent<AdminLayoutProps> = ({ children, mainFillHeight }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme } = useAdminTheme();
  const { preferences, hydrated } = useAdminPreferences();
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div
      data-admin-theme={theme}
      data-admin-compact={hydrated && preferences.compactMode ? 'true' : undefined}
      className="admin-shell-bg flex h-screen overflow-hidden font-inter antialiased"
    >
      <AdminSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main
          className={`admin-scroll relative min-h-0 min-w-0 flex-1 overflow-x-hidden ${
            mainFillHeight
              ? 'flex min-h-0 flex-col overflow-hidden p-0'
              : 'overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6'
          }`}
        >
          {mainFillHeight ? (
            <div className="flex h-0 min-h-0 w-full min-w-0 flex-1 flex-col">{children}</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="scroll"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="contents"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};

const AdminLayout: FunctionComponent<AdminLayoutProps> = (props) => <AdminLayoutInner {...props} />;

export default AdminLayout;
