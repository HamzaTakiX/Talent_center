import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';

interface InternshipOffersSectionHeaderProps {
  offerCount?: number;
}

const InternshipOffersSectionHeader: FunctionComponent<InternshipOffersSectionHeaderProps> = ({
  offerCount,
}) => {
  const { t } = useTranslation();
  const showCount = typeof offerCount === 'number' && offerCount > 0;

  return (
    <header className="student-recommended-section-header flex w-full min-w-0 max-w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 rounded-[11px] ${STUDENT_ICON_CHIP_INFO}`}>
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 min-w-0 break-words text-lg font-semibold leading-snug tracking-tight text-[var(--admin-text)] sm:leading-normal">
            {t('student.internshipOffers.recommendedTitle')}
          </h2>
          <p className="student-recommended-section-header__subtitle m-0 mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-muted)]">
            {t('student.internshipOffers.recommendedSubtitle')}
          </p>
        </div>
      </div>

      {showCount ? (
        <span className="student-recommended-section-header__count shrink-0 self-start">
          {t('student.internshipOffers.recommendedCount', { count: offerCount })}
        </span>
      ) : null}
    </header>
  );
};

export default InternshipOffersSectionHeader;
