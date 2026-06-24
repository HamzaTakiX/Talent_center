import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useOfferComparison } from '../../hooks/useOfferAiCoach';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../../CV_Analyse/constants/routes';
import { STUDENT_AI_CAREER_COACH_PATH } from '../../AI_Career_Coach/constants/routes';
import StudentMatchStatCard from '../../../components/StudentMatchStatCard';
import StudentMatchStatCardsSkeleton from '../../../components/StudentMatchStatCardsSkeleton';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_SECTION_SUBTITLE,
  DETAILS_SECTION_TITLE,
  DETAILS_TAG_NEUTRAL,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import {
  STUDENT_CALLOUT_INSET_BRAND,
  STUDENT_CALLOUT_INSET_SUCCESS,
  STUDENT_CALLOUT_INSET_WARNING,
} from '../../../design-system/studentSemanticStyles';
import DetailsSectionCard from './DetailsSectionCard';
import { SafeBadge } from '../../../../../design-system/safeContent';

interface OfferCvMatchSectionProps {
  offer: InternshipOfferDetails;
}

const MATCH_DIMENSION_LABEL_KEYS: Record<string, string> = {
  required_skills: 'student.internshipOffers.details.skills',
  preferred_skills: 'student.internshipOffers.details.preferredSkills',
  internship_type: 'student.internshipOffers.details.internshipType',
  education_level: 'student.internshipOffers.details.minEducation',
  location: 'student.internshipOffers.details.aiCvMatch.location',
};

const OfferCvMatchSection: FunctionComponent<OfferCvMatchSectionProps> = ({ offer }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useOfferComparison(offer.id);

  const analysisReady = !loading;

  const formatFallbackMatchItem = (item: { label: string; description?: string }) => {
    if (item.description) {
      const labelKey = MATCH_DIMENSION_LABEL_KEYS[item.label];
      const label = labelKey ? t(labelKey) : item.label;
      return `${label}: ${item.description}`;
    }
    return item.label;
  };

  const summary = useMemo(() => {
    if (data?.summary) return data.summary;
    if (!analysisReady) return '';
    if (offer.aiMatchSummary) return offer.aiMatchSummary;
    return '';
  }, [analysisReady, data?.summary, offer.aiMatchSummary]);

  const matchedSkills = useMemo(() => {
    if (data?.matched_skills?.length) return data.matched_skills;
    return [];
  }, [data?.matched_skills]);

  const missingSkills = useMemo(() => {
    if (data?.missing_skills?.length) return data.missing_skills;
    if (!analysisReady) return [];
    return offer.skillsToDevelop.map((item) => item.label).filter(Boolean);
  }, [analysisReady, data?.missing_skills, offer.skillsToDevelop]);

  const strengths = useMemo(() => {
    if (data?.strengths?.length) return data.strengths;
    if (!analysisReady) return [];
    return offer.matchingSkills.map(formatFallbackMatchItem).filter(Boolean);
  }, [analysisReady, data?.strengths, offer.matchingSkills, t]);

  const gaps = useMemo(() => {
    if (data?.gaps?.length) return data.gaps;
    if (!analysisReady) return [];
    return offer.skillsToDevelop.map(formatFallbackMatchItem).filter(Boolean);
  }, [analysisReady, data?.gaps, offer.skillsToDevelop, t]);

  const recommendations = useMemo(() => {
    if (data?.recommendations?.length) return data.recommendations;
    if (!analysisReady) return [];
    return offer.aiRecommendations;
  }, [analysisReady, data?.recommendations, offer.aiRecommendations]);

  const showScores = Boolean(data);
  const showInsights =
    summary ||
    matchedSkills.length ||
    missingSkills.length ||
    strengths.length ||
    gaps.length ||
    recommendations.length;

  return (
    <DetailsSectionCard>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="student-icon-chip student-icon-chip--brand flex h-9 w-9 shrink-0 items-center justify-center">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>
              {t('student.internshipOffers.details.aiAnalysis')}
            </h2>
            <p className={`${DETAILS_SECTION_SUBTITLE} m-0 mt-1`}>
              {t('student.internshipOffers.details.aiCvMatch.subtitle', {
                defaultValue:
                  'Analyse de compatibilité entre votre profil et cette offre de stage.',
              })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            className="group inline-flex h-10 items-center gap-2 rounded-xl border border-[#5d8bff] bg-[linear-gradient(135deg,#3b82f6,#2563eb)] px-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#93c5fd] hover:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] hover:shadow-[0_18px_30px_-14px_rgba(29,78,216,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2"
            onClick={() =>
              navigate(STUDENT_AI_CAREER_COACH_PATH, {
                state: {
                  offerContext: {
                    launchToken: `${offer.id}-${Date.now()}`,
                    offerId: offer.id,
                    title: offer.title,
                    company: offer.company,
                    companyLogoUrl: offer.companyLogoUrl ?? '',
                    internshipType: offer.internshipType ?? '',
                    deadline: offer.applicationDeadline ?? '',
                    applicationStatus: 'Not Applied',
                    appliedDate: '',
                    interviewDate: '',
                  },
                },
              })
            }
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[rgba(255,255,255,0.2)] transition-colors duration-200 group-hover:bg-[rgba(255,255,255,0.28)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            {t('student.internshipOffers.details.chatWithAiCoach', {
              defaultValue: 'Chat with AI Coach',
            })}
          </button>
          <button
            type="button"
            className="admin-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            {t('common.refresh', { defaultValue: 'Actualiser' })}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <StudentMatchStatCardsSkeleton loadingLabelKey="student.internshipOffers.details.aiCvMatch.loading" />
      ) : null}

      {error && !data && !showInsights ? (
        <div className={`${STUDENT_CALLOUT_INSET_WARNING} text-sm`}>{error}</div>
      ) : null}

      {showScores ? (
        <div className="student-match-stats mb-5">
          <StudentMatchStatCard
            statKey="overall"
            label={t('student.internshipOffers.details.matchScore')}
            value={data!.overall_match_percent}
          />
          <StudentMatchStatCard
            statKey="profile"
            label={t('student.internshipOffers.details.aiCvMatch.profile', {
              defaultValue: 'Profil',
            })}
            value={data!.profile_match_percent}
          />
          <StudentMatchStatCard
            statKey="cv"
            label={t('student.internshipOffers.details.aiCvMatch.cv', {
              defaultValue: 'CV',
            })}
            value={data!.cv_match_percent}
          />
          <StudentMatchStatCard
            statKey="eligibility"
            label={t('student.internshipOffers.details.aiCvMatch.eligibility', {
              defaultValue: 'Éligibilité',
            })}
            isEligible={data!.is_eligible}
            eligibleLabel={t('student.internshipOffers.details.aiCvMatch.eligible', {
              defaultValue: 'Éligible',
            })}
            notEligibleLabel={t('student.internshipOffers.details.aiCvMatch.notEligible', {
              defaultValue: 'À vérifier',
            })}
          />
        </div>
      ) : null}

      {data && !data.has_cv_analysis ? (
        <div
          className={`${STUDENT_CALLOUT_INSET_WARNING} mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
        >
          <p className="m-0 text-sm leading-relaxed text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.details.aiCvMatch.noCv', {
              defaultValue:
                'Analysez votre CV pour un score précis et des recommandations personnalisées.',
            })}
          </p>
          <button
            type="button"
            className="admin-btn-primary shrink-0 px-4 py-2 text-sm"
            onClick={() => navigate(STUDENT_CV_ANALYSIS_TOOL_PATH)}
          >
            {t('student.internshipOffers.details.aiCvMatch.analyzeCv', {
              defaultValue: 'Analyser mon CV',
            })}
          </button>
        </div>
      ) : null}

      {summary ? (
        <p className="m-0 mb-5 text-sm leading-relaxed text-[var(--admin-text-secondary)]">{summary}</p>
      ) : null}

      {matchedSkills.length ? (
        <div className="mb-5">
          <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-text)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
            {t('student.internshipOffers.details.aiCvMatch.matchedSkills', {
              defaultValue: 'Compétences alignées',
            })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill) => (
              <SafeBadge key={skill} className={DETAILS_TAG_PRIMARY}>
                {skill}
              </SafeBadge>
            ))}
          </div>
        </div>
      ) : null}

      {strengths.length ? (
        <div className={`mb-5 ${STUDENT_CALLOUT_INSET_SUCCESS}`}>
          <p className="m-0 mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-text)]">
            <Target className="h-4 w-4 text-emerald-500" aria-hidden />
            {t('student.internshipOffers.details.strengths')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {strengths.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-relaxed text-[var(--admin-text-secondary)]"
              >
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {missingSkills.length ? (
        <div className={`mb-5 ${STUDENT_CALLOUT_INSET_WARNING}`}>
          <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-text)]">
            <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />
            {t('student.internshipOffers.details.skillsToDevelop')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill) => (
              <SafeBadge key={skill} className={DETAILS_TAG_NEUTRAL}>
                {skill}
              </SafeBadge>
            ))}
          </div>
        </div>
      ) : null}

      {gaps.length ? (
        <div className={`mb-5 ${STUDENT_CALLOUT_INSET_WARNING}`}>
          <p className="m-0 mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-text)]">
            <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />
            {data?.gaps?.length
              ? t('student.internshipOffers.details.growth')
              : t('student.internshipOffers.details.skillsToDevelop')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {gaps.map((item) => (
              <li
                key={item}
                className="text-sm leading-relaxed text-[var(--admin-text-secondary)] before:mr-2 before:font-bold before:text-amber-500 before:content-['•']"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recommendations.length ? (
        <div className={STUDENT_CALLOUT_INSET_BRAND}>
          <p className="m-0 mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-text)]">
            <TrendingUp className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.details.aiRecommendations')}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {recommendations.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-relaxed text-[var(--admin-text-secondary)]"
              >
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-brand)]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && !showScores && !showInsights && !error ? (
        <p className="m-0 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.details.aiCvMatch.noData', {
            defaultValue: 'Aucune analyse disponible pour le moment.',
          })}
        </p>
      ) : null}
    </DetailsSectionCard>
  );
};

export default OfferCvMatchSection;
