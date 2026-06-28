import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Play, RotateCcw, Users } from 'lucide-react';
import InterviewSimulatorHubSkeleton from './InterviewSimulatorLoadingStates';
import { useAuth } from '../../../../../auth/hooks/useAuth';
import { computeStageReadiness } from '../../../CV_Analyse/utils/cvDraftReader';
import type { InterviewModeId } from '../../types/interviewSimulatorDashboard';
import type { AnalyticsMetric, InterviewHistoryRow } from '../../types/interviewSimulatorDashboard';
import InterviewAnalyticsPanel from './InterviewAnalyticsPanel';
import InterviewHistoryPanel from './InterviewHistoryPanel';
import { AnimatedCounter, fadeUp } from './InterviewPrimitives';

interface InterviewSimulatorHubProps {
  hasHistory: boolean;
  serverReadinessScore?: number | null;
  avgPreparationScore?: number;
  completedCount?: number;
  historyRows: InterviewHistoryRow[];
  analyticsMetrics: AnalyticsMetric[];
  avgOverallScore: number;
  isInitialLoad?: boolean;
  onStartMode: (modeId: InterviewModeId) => void;
  onContinue: () => void;
  onStartFirst: () => void;
  onViewReports?: () => void;
  onViewSessionReport?: (sessionUuid: string) => void;
}

const InterviewSimulatorHub: FunctionComponent<InterviewSimulatorHubProps> = ({
  hasHistory,
  serverReadinessScore,
  avgPreparationScore = 0,
  completedCount = 0,
  historyRows,
  analyticsMetrics,
  avgOverallScore,
  isInitialLoad = false,
  onStartMode,
  onContinue,
  onStartFirst,
  onViewReports,
  onViewSessionReport,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const profile = useMemo(() => {
    const firstName = user?.profile?.first_name ?? user?.student_profile?.first_name ?? '';
    const lastName = user?.profile?.last_name ?? user?.student_profile?.last_name ?? '';
    const fullName = (user?.full_name ?? `${firstName} ${lastName}`.trim()) || (user?.email ?? '');
    const initials = firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
    const sp = user?.student_profile;
    const programParts = [sp?.program_major, sp?.current_class].filter(Boolean);
    const program = programParts.join(' — ') || '';
    const cvReadiness = computeStageReadiness(user, { serverScore: serverReadinessScore });
    const readinessScore = completedCount > 0 ? avgPreparationScore : cvReadiness;
    const avatarUrl = user?.profile?.avatar ?? null;
    return { name: fullName, program, avatarInitials: initials, readinessScore, avatarUrl };
  }, [user, serverReadinessScore, avgPreparationScore, completedCount]);

  if (isInitialLoad) {
    return (
      <div className="sr-is__root sr-is">
        <InterviewSimulatorHubSkeleton />
      </div>
    );
  }

  if (!hasHistory) {
    return (
      <div className="sr-is__root sr-is">
        <div className="sr-is-panel sr-is-empty">
          <div className="sr-is-empty__icon">
            <Users className="h-10 w-10" aria-hidden />
          </div>
          <h2 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.empty.title')}</h2>
          <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.empty.desc')}</p>
          <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onStartFirst}>
            <Play className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.empty.cta')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-is__root sr-is">
      <div className="flex flex-col gap-5">
        <motion.section className="sr-is-panel sr-is-hero sr-is-hero--enhanced" {...fadeUp}>
          <div className="sr-is-hero__inner">
            <div>
              <div className="flex items-center gap-4">
                <div className="sr-is-hero__avatar" aria-hidden>
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    profile.avatarInitials
                  )}
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{profile.name}</p>
                  <p className="m-0 text-xs text-[var(--admin-text-secondary)]">{profile.program}</p>
                  <span className="sr-is-readiness">
                    {completedCount > 0
                      ? t('student.internshipOffers.interviewSim.hero.simulationPrep')
                      : t('student.internshipOffers.interviewSim.hero.readiness')}
                    :{' '}
                    <AnimatedCounter value={profile.readinessScore} suffix="%" />
                  </span>
                </div>
              </div>
              <h1 className="sr-is-hero__title mt-4">{t('student.internshipOffers.interviewSim.hero.title')}</h1>
              <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.hero.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={() => onStartMode('general')}>
                <Play className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.interviewSim.hero.start')}
              </button>
              <button type="button" className="sr-is-btn sr-is-btn--secondary" onClick={onContinue}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                {t('student.internshipOffers.interviewSim.hero.continue')}
              </button>
              {onViewReports ? (
                <button type="button" className="sr-is-btn sr-is-btn--secondary" onClick={onViewReports}>
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  {t('student.internshipOffers.interviewSim.hero.reports')}
                </button>
              ) : null}
            </div>
          </div>
        </motion.section>

        <InterviewAnalyticsPanel
          avgOverall={avgOverallScore}
          avgPreparation={avgPreparationScore}
          completedCount={completedCount}
          metrics={analyticsMetrics}
        />

        <InterviewHistoryPanel
          rows={historyRows}
          onViewReport={onViewSessionReport}
        />
      </div>
    </div>
  );
};

export default InterviewSimulatorHub;
