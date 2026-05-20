import { FunctionComponent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import { DETAILS_SECTION_TITLE, DETAILS_SIDEBAR_ACTION_BUTTON } from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';

interface InternshipOfferDetailsSidebarProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsSidebar: FunctionComponent<InternshipOfferDetailsSidebarProps> = ({
  offer,
}) => {
  return (
    <aside className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <section className="rounded-[12px] border border-[#e9d5ff]/80 bg-[#faf5ff] px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] shrink-0 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>AI Match Analysis</h2>
        </div>
        <p className="m-0 text-sm leading-6 text-[var(--admin-text-secondary)]">{offer.aiMatchSummary}</p>
      </section>

      <DetailsSectionCard>
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-[#22c55e]" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>Your Strengths</h2>
        </div>

        <div className="mb-4 rounded-[10px] bg-[#f0fdf4] p-4">
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">Matching Skills</p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {offer.matchingSkills.map((item) => (
              <li key={item.label} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">
                  <strong className="font-semibold text-[var(--admin-text)]">{item.label}:</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[10px] bg-[#eff6ff] p-4">
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">Relevant Experience</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {offer.relevantExperience.map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#155dfc]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </DetailsSectionCard>

      <DetailsSectionCard>
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <TrendingUp className="h-[18px] w-[18px] shrink-0 text-[#ea580c]" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>Room for Growth</h2>
        </div>

        <div className="mb-4 rounded-[10px] bg-[#fff7ed] p-4">
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">Skills to Develop</p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {offer.skillsToDevelop.map((item) => (
              <li key={item.label} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">
                  <strong className="font-semibold text-[var(--admin-text)]">{item.label}:</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[10px] bg-[#faf5ff] p-4">
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">AI Recommendations</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {offer.aiRecommendations.map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </DetailsSectionCard>

      <section className="rounded-[12px] border border-[#bfdbfe]/80 bg-[#eff6ff] px-4 py-5 sm:px-6 sm:py-6">
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-4`}>Boost Your Application</h2>
        <div className="flex flex-col gap-3">
          <button type="button" className={DETAILS_SIDEBAR_ACTION_BUTTON}>
            <FileText className="h-4 w-4 shrink-0 text-[#155dfc]" strokeWidth={1.75} aria-hidden />
            Analyze My CV
          </button>
          <button type="button" className={DETAILS_SIDEBAR_ACTION_BUTTON}>
            <Users className="h-4 w-4 shrink-0 text-[#155dfc]" strokeWidth={1.75} aria-hidden />
            Practice Interview
          </button>
        </div>
      </section>
    </aside>
  );
};

export default InternshipOfferDetailsSidebar;
