import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  STUDENT_CALLOUT_BRAND,
  STUDENT_CALLOUT_INFO,
  STUDENT_CALLOUT_INSET_BRAND,
  STUDENT_CALLOUT_INSET_INFO,
  STUDENT_CALLOUT_INSET_SUCCESS,
  STUDENT_CALLOUT_INSET_WARNING,
} from '../../../design-system/studentSemanticStyles';
import DetailsSectionCard from './DetailsSectionCard';

interface InternshipOfferDetailsSidebarProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsSidebar: FunctionComponent<InternshipOfferDetailsSidebarProps> = ({
  offer,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <section className={`${STUDENT_CALLOUT_BRAND} px-4 py-5 sm:px-6 sm:py-6`}>
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>{t('student.internshipOffers.details.aiAnalysis')}</h2>
        </div>
        <p className="m-0 text-sm leading-6 text-[var(--admin-text-secondary)]">{offer.aiMatchSummary}</p>
      </section>

      <DetailsSectionCard>
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>{t('student.internshipOffers.details.strengths')}</h2>
        </div>

        <div className={`mb-4 ${STUDENT_CALLOUT_INSET_SUCCESS}`}>
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.details.matchingSkills')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {offer.matchingSkills.map((item) => (
              <li key={item.label} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">
                  <strong className="font-semibold text-[var(--admin-text)]">{item.label}:</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={STUDENT_CALLOUT_INSET_INFO}>
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.details.relevantExperience')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {offer.relevantExperience.map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </DetailsSectionCard>

      <DetailsSectionCard>
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <TrendingUp className="h-[18px] w-[18px] shrink-0 text-amber-500" strokeWidth={1.75} aria-hidden />
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>{t('student.internshipOffers.details.growth')}</h2>
        </div>

        <div className={`mb-4 ${STUDENT_CALLOUT_INSET_WARNING}`}>
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.details.skillsToDevelop')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {offer.skillsToDevelop.map((item) => (
              <li key={item.label} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">
                  <strong className="font-semibold text-[var(--admin-text)]">{item.label}:</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={STUDENT_CALLOUT_INSET_BRAND}>
          <p className="m-0 mb-2.5 text-sm font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.details.aiRecommendations')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {offer.aiRecommendations.map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </DetailsSectionCard>

      <section className={`${STUDENT_CALLOUT_INFO} px-4 py-5 sm:px-6 sm:py-6`}>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-4`}>{t('student.internshipOffers.details.boost')}</h2>
        <div className="flex flex-col gap-3">
          <button type="button" className={DETAILS_SIDEBAR_ACTION_BUTTON}>
            <FileText className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
            {t('student.internshipOffers.apply.analyzeCv')}
          </button>
          <button type="button" className={DETAILS_SIDEBAR_ACTION_BUTTON}>
            <Users className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
            {t('student.internshipOffers.details.practiceInterview')}
          </button>
        </div>
      </section>
    </aside>
  );
};

export default InternshipOfferDetailsSidebar;
