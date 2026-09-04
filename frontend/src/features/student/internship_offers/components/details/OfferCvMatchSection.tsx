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
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import StudentMatchStatCard from '../../../components/StudentMatchStatCard';
import StudentMatchStatCardsSkeleton from '../../../components/StudentMatchStatCardsSkeleton';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_OUTLINE_BUTTON,
  DETAILS_PRIMARY_BUTTON,
  DETAILS_SECTION_SUBTITLE,
  DETAILS_SECTION_TITLE,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import { STUDENT_CALLOUT_INSET_WARNING } from '../../../design-system/studentSemanticStyles';
import DetailsSectionCard from './DetailsSectionCard';
import OfferMatchInsightPanel from './OfferMatchInsightPanel';
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

  const hasInsightPanels =
    strengths.length > 0 ||
    missingSkills.length > 0 ||
    gaps.length > 0 ||
    recommendations.length > 0;

  return (
    <DetailsSectionCard>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
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
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            className={`${DETAILS_PRIMARY_BUTTON} inline-flex items-center justify-center gap-2`}
            onClick={() =>
              navigate(STUDENT_AI_CAREER_COACH_PATH, {
                state: {
                  offerContext: {
                    launchToken: `${offer.id}-${Date.now()}`,
                    offerId: offer.id,
                    title: offer.title,
                    company: offer.company,
                    companyLogoUrl: resolveMediaUrl(offer.companyLogoUrl) ?? '',
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
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="safe-button-label">
              {t('student.internshipOffers.details.chatWithAiCoach', {
                defaultValue: 'Chat with AI Coach',
              })}
            </span>
          </button>
          <button
            type="button"
            className={`${DETAILS_OUTLINE_BUTTON} inline-flex items-center justify-center gap-2`}
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden />
            <span className="safe-button-label">
              {t('common.refresh', { defaultValue: 'Actualiser' })}
            </span>
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
        <div className="admin-students-stats-grid student-match-stats mb-4">
          <StudentMatchStatCard
            statKey="overall"
            label={t('student.internshipOffers.details.matchScore')}
            value={data!.overall_match_percent}
            badge={t('student.internshipOffers.details.aiCvMatch.badges.overall', {
              defaultValue: 'Score global',
            })}
          />
          <StudentMatchStatCard
            statKey="profile"
            label={t('student.internshipOffers.details.aiCvMatch.profile', {
              defaultValue: 'Profil',
            })}
            value={data!.profile_match_percent}
            badge={t('student.internshipOffers.details.aiCvMatch.badges.profile', {
              defaultValue: 'Alignement profil',
            })}
          />
          <StudentMatchStatCard
            statKey="cv"
            label={t('student.internshipOffers.details.aiCvMatch.cv', {
              defaultValue: 'CV',
            })}
            value={data!.cv_match_percent}
            badge={t('student.internshipOffers.details.aiCvMatch.badges.cv', {
              defaultValue: 'Score CV',
            })}
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
          className={`${STUDENT_CALLOUT_INSET_WARNING} mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
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
        <p className="m-0 mb-4 text-sm leading-relaxed text-[var(--admin-text-secondary)]">{summary}</p>
      ) : null}

      {matchedSkills.length ? (
        <div className="mb-4">
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

      {hasInsightPanels ? (
        <div className="student-match-insights mt-1">
          {strengths.length ? (
            <OfferMatchInsightPanel
              tone="success"
              icon={Target}
              title={t('student.internshipOffers.details.strengths')}
            >
              <ul className="student-match-insight__list">
                {strengths.map((item) => (
                  <li key={item} className="student-match-insight__item">
                    <CheckCircle2
                      className="student-match-insight__bullet h-3.5 w-3.5"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </OfferMatchInsightPanel>
          ) : null}

          {missingSkills.length ? (
            <OfferMatchInsightPanel
              tone="warning"
              icon={AlertCircle}
              title={t('student.internshipOffers.details.skillsToDevelop')}
            >
              <div className="student-match-insight__tags">
                {missingSkills.map((skill) => (
                  <span key={skill} className="student-match-insight__tag">
                    {skill}
                  </span>
                ))}
              </div>
            </OfferMatchInsightPanel>
          ) : null}

          {gaps.length ? (
            <OfferMatchInsightPanel
              tone="warning"
              icon={AlertCircle}
              title={
                data?.gaps?.length
                  ? t('student.internshipOffers.details.growth')
                  : t('student.internshipOffers.details.skillsToDevelop')
              }
            >
              <ul className="student-match-insight__list">
                {gaps.map((item) => (
                  <li key={item} className="student-match-insight__item">
                    <span
                      className="student-match-insight__bullet mt-1.5 h-1.5 w-1.5 rounded-full bg-current"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </OfferMatchInsightPanel>
          ) : null}

          {recommendations.length ? (
            <OfferMatchInsightPanel
              tone="brand"
              icon={TrendingUp}
              title={t('student.internshipOffers.details.aiRecommendations')}
            >
              <ul className="student-match-insight__list">
                {recommendations.map((item) => (
                  <li key={item} className="student-match-insight__item">
                    <Sparkles
                      className="student-match-insight__bullet h-3.5 w-3.5"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </OfferMatchInsightPanel>
          ) : null}
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
