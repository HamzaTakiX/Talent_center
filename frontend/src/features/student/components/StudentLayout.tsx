import { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import InternshipStatusOverlay from '../internship_offers/components/InternshipStatusOverlay';
import ExternalApplyConfirmationOverlay from '../internship_offers/components/ExternalApplyConfirmationOverlay';
import ExternalApplyRouteRestore, {
  useExternalApplyLeaveGuard,
} from '../internship_offers/components/ExternalApplyRouteRestore';
import {
  ExternalApplyConfirmationProvider,
  useExternalApplyConfirmation,
} from '../internship_offers/context/ExternalApplyConfirmationContext';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import { useAdminPreferences } from '../../admin/account/context/AdminPreferencesContext';
import { useAuth } from '../../auth/hooks/useAuth';

interface StudentLayoutProps {
  children: ReactNode;
  /** Full-height main without padding (chat, history). */
  contentFlush?: boolean;
  mainFillHeight?: boolean;
  /** @deprecated Title is derived from the route in `StudentHeader`. */
  headerTitle?: string;
  /** @deprecated Subtitle is derived from i18n in `StudentHeader`. */
  headerSubtitle?: string;
}

const INTERNSHIP_OFFERS_PATH_PREFIX = '/student/internship-offers';

/** Same shell as `AdminLayout`: theme tokens, sidebar, header, scrollable main. */
const StudentLayoutShell: FunctionComponent<StudentLayoutProps> = ({
  children,
  contentFlush = false,
  mainFillHeight = false,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [internshipGateDismissed, setInternshipGateDismissed] = useState(false);
  const [internshipGateOpen, setInternshipGateOpen] = useState(false);
  const { theme } = useAdminTheme();
  const { preferences, hydrated } = useAdminPreferences();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isOpen: externalApplyGateOpen } = useExternalApplyConfirmation();
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const fillHeight = contentFlush || mainFillHeight;

  const needsInternshipStatusGate = useMemo(() => {
    if (!pathname.startsWith(INTERNSHIP_OFFERS_PATH_PREFIX)) return false;
    const studentProfile = user?.student_profile;
    if (!studentProfile) return false;
    return !studentProfile.internship_status_acknowledged;
  }, [pathname, user?.student_profile]);

  useEffect(() => {
    if (needsInternshipStatusGate) {
      setInternshipGateOpen(true);
    }
  }, [needsInternshipStatusGate]);

  const showInternshipStatusGate = internshipGateOpen && !internshipGateDismissed;
  const showBlockingGate = showInternshipStatusGate || externalApplyGateOpen;

  const setGateShellRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) node.inert = showBlockingGate;
    },
    [showBlockingGate],
  );

  useExternalApplyLeaveGuard(externalApplyGateOpen && !showInternshipStatusGate);

  const handleInternshipGateDismiss = useCallback(() => {
    setInternshipGateDismissed(true);
  }, []);

  useEffect(() => {
    if (!showBlockingGate) return undefined;

    setMobileNavOpen(false);
    const { overflow, overscrollBehavior } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.overscrollBehavior = overscrollBehavior;
    };
  }, [showBlockingGate]);

  return (
    <motion.div
      data-admin-theme={theme}
      data-admin-compact={hydrated && preferences.compactMode ? 'true' : undefined}
      className={`student-portal admin-shell-bg flex h-screen overflow-hidden font-inter antialiased${
        showBlockingGate ? ' student-portal--internship-gate' : ''
      }`}
    >
      <div
        ref={setGateShellRef}
        className={`student-portal__gate-shell flex min-h-0 min-w-0 flex-1${
          showBlockingGate ? ' internship-status-gate-shell' : ''
        }`}
        aria-hidden={showBlockingGate ? true : undefined}
      >
        <ExternalApplyRouteRestore internshipGateActive={showInternshipStatusGate} />
        <StudentSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StudentHeader onMenuClick={() => setMobileNavOpen(true)} />
          <main
            className={`admin-scroll relative min-h-0 min-w-0 flex-1 overflow-x-hidden ${
              fillHeight
                ? 'flex min-h-0 flex-col overflow-hidden p-0'
                : `px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6 ${
                    showBlockingGate ? 'overflow-hidden' : 'overflow-y-auto'
                  }`
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
                  key="student-scroll"
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
      </div>
      {showInternshipStatusGate ? (
        <InternshipStatusOverlay onDismiss={handleInternshipGateDismiss} />
      ) : externalApplyGateOpen ? (
        <ExternalApplyConfirmationOverlay />
      ) : null}
    </motion.div>
  );
};

const StudentLayout: FunctionComponent<StudentLayoutProps> = (props) => (
  <ExternalApplyConfirmationProvider>
    <StudentLayoutShell {...props} />
  </ExternalApplyConfirmationProvider>
);

export default StudentLayout;
