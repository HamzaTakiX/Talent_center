import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentInternshipAnalytics } from '../../../api/types';
import InternshipTypeAnalyticsCard from './InternshipTypeAnalyticsCard';
import SmartAssignmentInternshipAnalyticsSkeleton from './SmartAssignmentInternshipAnalyticsSkeleton';
import {
  buildEncadrantDistribution,
  buildSmartInsights,
  buildStudentDistribution,
  buildStudentInsights,
  computeCoverageRatio,
  type InsightKind,
} from './internshipAnalyticsUtils';
import '../styles/admin-smart-assignment-analytics.css';

interface SmartAssignmentInternshipAnalyticsPanelProps {
  analytics: SmartAssignmentInternshipAnalytics | null | undefined;
  loading?: boolean;
  /** Fallback when API has not yet returned total_unique_encadrants. */
  fallbackUniqueEncadrants?: number;
}

const ENCADRANT_INSIGHT_KINDS: InsightKind[] = [
  'uncovered',
  'overCapacity',
  'lowCoverage',
  'limitedSupervisors',
  'surplusSupervisors',
];

const SmartAssignmentInternshipAnalyticsPanel: FunctionComponent<
  SmartAssignmentInternshipAnalyticsPanelProps
> = ({ analytics, loading = false, fallbackUniqueEncadrants }) => {
  const { t } = useTranslation();

  const resolvedAnalytics = useMemo(() => {
    if (!analytics) return null;
    const slotSum = analytics.encadrants_by_internship_type.reduce((s, r) => s + r.count, 0);
    return {
      ...analytics,
      total_unique_encadrants:
        analytics.total_unique_encadrants ?? fallbackUniqueEncadrants ?? undefined,
      total_supervision_slots: analytics.total_supervision_slots ?? slotSum,
    };
  }, [analytics, fallbackUniqueEncadrants]);

  const studentSnapshot = useMemo(
    () => (resolvedAnalytics ? buildStudentDistribution(resolvedAnalytics) : null),
    [resolvedAnalytics]
  );
  const encadrantSnapshot = useMemo(
    () => (resolvedAnalytics ? buildEncadrantDistribution(resolvedAnalytics) : null),
    [resolvedAnalytics]
  );

  const allInsights = useMemo(
    () => (resolvedAnalytics ? buildSmartInsights(resolvedAnalytics) : []),
    [resolvedAnalytics]
  );

  const studentInsights = useMemo(
    () => (studentSnapshot ? buildStudentInsights(studentSnapshot) : []),
    [studentSnapshot]
  );

  const encadrantInsights = useMemo(
    () => allInsights.filter((i) => ENCADRANT_INSIGHT_KINDS.includes(i.kind)).slice(0, 4),
    [allInsights]
  );

  const coverageRatio = useMemo(() => {
    if (!resolvedAnalytics || !studentSnapshot) return 0;
    return computeCoverageRatio(
      resolvedAnalytics,
      studentSnapshot.total,
      encadrantSnapshot?.total ?? 0
    );
  }, [resolvedAnalytics, studentSnapshot, encadrantSnapshot]);

  if (loading) {
    return <SmartAssignmentInternshipAnalyticsSkeleton />;
  }

  if (!resolvedAnalytics || !studentSnapshot || !encadrantSnapshot) return null;

  return (
    <section
      className="admin-smart-assignment-analytics"
      aria-label={t('admin.smartAssignment.analytics.title')}
    >
      <div className="admin-smart-assignment-analytics__grid">
        <InternshipTypeAnalyticsCard
          variant="students"
          snapshot={studentSnapshot}
          insights={studentInsights}
        />
        <InternshipTypeAnalyticsCard
          variant="encadrants"
          snapshot={encadrantSnapshot}
          insights={encadrantInsights}
          coverageRatio={coverageRatio}
          missingCoverageCount={resolvedAnalytics.uncovered_internship_types.length}
        />
      </div>
    </section>
  );
};

export default SmartAssignmentInternshipAnalyticsPanel;
