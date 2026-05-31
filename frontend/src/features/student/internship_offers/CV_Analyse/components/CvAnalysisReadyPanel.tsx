import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import {
  CV_TOOL_PRO_TIP_BOX,
  CV_TOOL_READY_ICON,
  CV_TOOL_READY_PANEL,
} from '../constants/cvAnalysisToolStyles';

const CvAnalysisReadyPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section className={CV_TOOL_READY_PANEL} aria-label={t('student.internshipOffers.cvTool.readyAria')}>
      <div className={CV_TOOL_READY_ICON}>
        <Sparkles className="h-6 w-6 text-[var(--admin-brand)] sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
      </div>

      <h2 className="m-0 mt-5 max-w-md text-base font-semibold tracking-tight text-[var(--admin-text)] sm:mt-6 sm:text-lg sm:leading-7 md:text-xl">
        {t('student.internshipOffers.cvTool.readyTitle')}
      </h2>

      <p className="m-0 mt-2.5 max-w-md px-1 text-[13px] leading-[22px] text-[var(--admin-text-muted)] sm:px-0 sm:text-sm sm:leading-6 md:text-[15px]">
        {t('student.internshipOffers.cvTool.readyDesc')}
      </p>

      <div className={CV_TOOL_PRO_TIP_BOX}>
        <p className="m-0 flex items-start gap-2 text-[13px] font-semibold leading-5 text-[var(--admin-brand)] sm:items-center sm:text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2} aria-hidden />
          <span>{t('student.internshipOffers.cvTool.proTipTitle')}</span>
        </p>
        <p className="m-0 mt-1.5 text-[13px] leading-5 text-[var(--admin-text-secondary)] sm:text-sm">
          {t('student.internshipOffers.cvTool.proTipText')}
        </p>
      </div>
    </section>
  );
};

export default CvAnalysisReadyPanel;
