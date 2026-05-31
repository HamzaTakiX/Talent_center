import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import {
  STUDENT_CALLOUT_INFO,
  STUDENT_ICON_CHIP_INFO,
} from '../../design-system/studentSemanticStyles';
import { PLATFORM_BTN_OUTLINE } from '../../../../design-system/platformTokens';

const DocumentsAlertBanner: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={`flex w-full min-w-0 flex-col gap-2 ${STUDENT_CALLOUT_INFO} px-3 py-2.5 max-[429px]:gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3.5 sm:py-3`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-2.5">
        <span className={`inline-flex h-7 w-7 sm:h-8 sm:w-8 ${STUDENT_ICON_CHIP_INFO}`}>
          <Info className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="m-0 text-[13px] font-semibold leading-4 text-[var(--admin-text)] sm:text-sm sm:leading-5">
            {t('student.documents.alert.title')}
          </p>
          <p className="m-0 text-[11px] leading-4 text-[var(--admin-text-secondary)] max-[429px]:leading-[1.35] sm:text-[12px] sm:leading-[1.4]">
            {t('student.documents.alert.message')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => console.log('Voir détails documents manquants')}
        className={`${PLATFORM_BTN_OUTLINE} h-8 w-full shrink-0 sm:h-8 sm:w-auto`}
      >
        {t('student.documents.alert.action')}
      </button>
    </div>
  );
};

export default DocumentsAlertBanner;
