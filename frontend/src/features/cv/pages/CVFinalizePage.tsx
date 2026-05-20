import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import CvQuickBuilderEmbed from '../components/CvQuickBuilderEmbed';
import CvEditorShell from '../components/CvEditorShell';
import { clearOnboardingCvPending } from '../../auth/utils/onboardingCvGate';
import { STUDENT_DASHBOARD_PATH } from '../../student/config/studentNavConfig';
import { STUDENT_PRIMARY_BUTTON } from '../../student/design-system/studentTokens';

const CVFinalizePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const goToDashboard = () => {
    clearOnboardingCvPending();
    navigate(STUDENT_DASHBOARD_PATH, { replace: true });
  };

  const footer = (
    <div className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 sm:px-6 flex justify-center">
      <button type="button" onClick={goToDashboard} className={`${STUDENT_PRIMARY_BUTTON} inline-flex items-center gap-2`}>
        <LayoutDashboard className="h-4 w-4" />
        {t('cv.finalize.actions.goDashboard')}
      </button>
    </div>
  );

  return (
    <CvEditorShell showOnboardingBanner={false} footer={footer}>
      {id && (
        <p className="shrink-0 border-b border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-4 py-2 text-center text-xs text-[var(--admin-text-secondary)]">
          {t('cv.finalize.cvIdLabel', { id })} — {t('cv.finalize.subtitle')}
        </p>
      )}
      <CvQuickBuilderEmbed className="min-h-0 flex-1" />
    </CvEditorShell>
  );
};

export default CVFinalizePage;
