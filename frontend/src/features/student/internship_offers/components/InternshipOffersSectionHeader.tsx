import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Target } from 'lucide-react';
import { STUDENT_OUTLINE_BUTTON } from '../../design-system/studentTokens';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';

interface InternshipOffersSectionHeaderProps {
  onViewAll?: () => void;
}

const InternshipOffersSectionHeader: FunctionComponent<InternshipOffersSectionHeaderProps> = ({
  onViewAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 max-[429px]:gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
        <span className={`flex h-8 w-8 rounded-[10px] ${STUDENT_ICON_CHIP_INFO}`}>
          <Target className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="min-w-0 break-words text-lg font-semibold leading-snug tracking-tight text-[var(--admin-text)] sm:truncate sm:leading-normal">
          {t('student.internshipOffers.recommendedTitle')}
        </h2>
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className={`${STUDENT_OUTLINE_BUTTON} student-view-all-offers-header-cta group inline-flex shrink-0 items-center gap-1.5 self-start px-4 sm:self-auto`}
      >
        {t('student.internshipOffers.viewAllOffers')}
        <ChevronRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </div>
  );
};

export default InternshipOffersSectionHeader;
