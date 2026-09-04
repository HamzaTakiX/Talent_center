import { FunctionComponent, ReactNode, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EncadrantHeader from './EncadrantHeader';
import EncadrantSidebar from './EncadrantSidebar';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import { useAdminPreferences } from '../../admin/account/context/AdminPreferencesContext';

interface EncadrantLayoutProps {
  children: ReactNode;
  /** Full-height main without padding (chat). */
  contentFlush?: boolean;
  mainFillHeight?: boolean;
  /** @deprecated Title is derived from the route in `EncadrantHeader`. */
  headerTitle?: string;
  /** @deprecated Subtitle is derived from i18n in `EncadrantHeader`. */
  headerSubtitle?: string;
}

/** Same shell DNA as Admin/Student: theme tokens, glass chrome, scrollable main. */
const EncadrantLayout: FunctionComponent<EncadrantLayoutProps> = ({
  children,
  contentFlush = false,
  mainFillHeight = false,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme } = useAdminTheme();
  const { preferences, hydrated } = useAdminPreferences();
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const fillHeight = contentFlush || mainFillHeight;

  return (
    <motion.div
      data-admin-theme={theme}
      data-admin-compact={hydrated && preferences.compactMode ? 'true' : undefined}
      className="encadrant-portal admin-shell-bg flex h-screen overflow-hidden font-inter antialiased"
    >
      <EncadrantSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <EncadrantHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main
          className={`admin-scroll relative min-h-0 min-w-0 flex-1 overflow-x-hidden ${
            fillHeight
              ? 'flex min-h-0 flex-col overflow-hidden p-0'
              : 'overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6'
          }`}
        >
          {fillHeight ? (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              className="flex h-0 min-h-0 flex-1 flex-col"
            >
              {children}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="encadrant-scroll"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default EncadrantLayout;
