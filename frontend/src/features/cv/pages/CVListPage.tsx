import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CvQuickBuilderEmbed from '../components/CvQuickBuilderEmbed';
import CvEditorShell from '../components/CvEditorShell';
import { STUDENT_PRIMARY_BUTTON, STUDENT_TEXT_PRIMARY } from '../../student/design-system/studentTokens';

const CVListPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <CvEditorShell showOnboardingBanner={false}>
      <div className="flex shrink-0 items-center justify-end gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-2 sm:px-6">
        <h2 className={`mr-auto text-sm font-semibold ${STUDENT_TEXT_PRIMARY}`}>{t('cv.list.title')}</h2>
        <button type="button" onClick={() => navigate('/cv-editor')} className={`${STUDENT_PRIMARY_BUTTON} inline-flex items-center gap-2`}>
          <Plus className="h-4 w-4" />
          {t('cv.list.openEditor')}
        </button>
      </div>
      <CvQuickBuilderEmbed className="min-h-0 flex-1" />
    </CvEditorShell>
  );
};

export default CVListPage;
