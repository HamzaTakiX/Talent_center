import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CvEditorHeader from './CvEditorHeader';
import CvEditorToolbar from './CvEditorToolbar';
import CvAiConfigBanner from './ai/CvAiConfigBanner';
import CvAiOverviewPanel from './ai/CvAiOverviewPanel';
import CvAiValidationPanel from './ai/CvAiValidationPanel';
import '../styles/cv-ai-insights.css';
import { useAdminTheme } from '../../admin/dashboard/context/AdminThemeContext';
import { isOnboardingCvPending } from '../../auth/utils/onboardingCvGate';
import { STUDENT_SHELL_CLASS } from '../../student/design-system/studentTokens';

interface CvEditorShellProps {
  children: ReactNode;
  hideBack?: boolean;
  showOnboardingBanner?: boolean;
  footer?: ReactNode;
}

/** Shell React admin (logo ESCA, langue, thème) + zone QuickCV en dessous. */
export const CvEditorShell: FunctionComponent<CvEditorShellProps> = ({
  children,
  hideBack,
  showOnboardingBanner = true,
  footer,
}) => {
  const { t } = useTranslation();
  const { theme } = useAdminTheme();
  const onboardingCv = isOnboardingCvPending();

  return (
    <div
      data-admin-theme={theme}
      data-cv-editor-shell
      className={`${STUDENT_SHELL_CLASS} flex h-screen w-full flex-col overflow-hidden font-inter antialiased`}
    >
      {showOnboardingBanner && onboardingCv && (
        <div
          data-cv-onboarding-banner
          className="shrink-0 border-b border-[var(--admin-brand)]/30 bg-[var(--admin-brand-muted)] px-4 py-2.5 text-center text-xs text-[var(--admin-text-secondary)] sm:px-6"
        >
          {t('cv.onboarding.banner')}
        </div>
      )}
      <CvEditorHeader hideBack={hideBack ?? onboardingCv} />
      <CvAiConfigBanner />
      <CvEditorToolbar />
      <div className="cv-editor-main relative min-h-0 flex-1 flex flex-col overflow-hidden">
        {children}
        <CvAiOverviewPanel />
        <CvAiValidationPanel />
      </div>
      {footer ? <div data-cv-editor-footer>{footer}</div> : null}
    </div>
  );
};

export default CvEditorShell;
