import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';

const InternshipOffersSectionHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:gap-2.5">
      <span className={`flex h-8 w-8 rounded-[10px] ${STUDENT_ICON_CHIP_INFO}`}>
        <Target className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="min-w-0 break-words text-lg font-semibold leading-snug tracking-tight text-[var(--admin-text)] sm:truncate sm:leading-normal">
        {t('student.internshipOffers.recommendedTitle')}
      </h2>
    </div>
  );
};

export default InternshipOffersSectionHeader;
