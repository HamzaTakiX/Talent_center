import { FunctionComponent } from 'react';
import { ChevronRight, Target } from 'lucide-react';
import { STUDENT_SECTION_LINK } from '../constants/internshipOffersStyles';

interface InternshipOffersSectionHeaderProps {
  onViewAll?: () => void;
}

const InternshipOffersSectionHeader: FunctionComponent<InternshipOffersSectionHeaderProps> = ({
  onViewAll,
}) => {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 max-[429px]:gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#eff6ff] text-[#155dfc] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <Target className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="min-w-0 break-words text-lg font-semibold leading-snug tracking-tight text-[var(--admin-text)] sm:truncate sm:leading-normal">
          Recommended Internship Offer
        </h2>
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className={`${STUDENT_SECTION_LINK} shrink-0 self-start sm:self-auto`}
      >
        View All Offers
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
