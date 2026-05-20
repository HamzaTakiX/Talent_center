import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentInternshipAnalytics } from '../../../api/types';
import { easePremium } from '../../../dashboard/ui/animations';
import AnimatedStatValue from './AnimatedStatValue';
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
  const prefix = 'admin.smartAssignment.analytics';

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
    return (
      <SmartAssignmentInternshipAnalyticsSkeleton />
    );
  }

  if (!resolvedAnalytics || !studentSnapshot || !encadrantSnapshot) return null;

  const alertItems = [
    { key: 'missing', label: t(`${prefix}.missingInternship`), value: resolvedAnalytics.missing_internship_type_students },
    {
      key: 'unsupported',
      label: t(`${prefix}.unsupportedCategory`),
      value: resolvedAnalytics.unsupported_internship_categories,
    },
    {
      key: 'noTypes',
      label: t(`${prefix}.encadrantsWithoutTypes`),
      value: resolvedAnalytics.encadrants_without_supervised_types,
    },
    {
      key: 'uncovered',
      label: t(`${prefix}.uncoveredTypes`),
      value: resolvedAnalytics.uncovered_internship_types.length,
    },
    ...(resolvedAnalytics.excluded_non_official_students
      ? [
          {
            key: 'excluded',
            label: t(`${prefix}.excludedNonOfficial`),
            value: resolvedAnalytics.excluded_non_official_students,
          },
        ]
      : []),
  ];

  return (
    <section className="admin-smart-assignment-analytics" aria-labelledby="smart-assignment-analytics-title">
      <motion.header
        className="admin-smart-assignment-analytics__header"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easePremium }}
      >
        <h2 id="smart-assignment-analytics-title" className="admin-smart-assignment-analytics__title">
          {t(`${prefix}.title`)}
        </h2>
        <p className="admin-smart-assignment-analytics__subtitle">
          {t(`${prefix}.subtitle`)} · {t(`${prefix}.officialCatalogNote`)}
        </p>
      </motion.header>

      <motion.div
        className="admin-smart-assignment-analytics__alerts"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easePremium }}
      >
        {alertItems.map((item, index) => (
          <motion.div
            key={item.key}
            className="admin-smart-assignment-analytics__alert"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.04 * index, ease: easePremium }}
          >
            <span className="admin-smart-assignment-analytics__alert-label">{item.label}</span>
            <AnimatedStatValue
              value={item.value}
              className="admin-smart-assignment-analytics__alert-value"
            />
          </motion.div>
        ))}
      </motion.div>

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

      {resolvedAnalytics.uncovered_internship_types.length > 0 ? (
        <motion.aside
          className="admin-smart-assignment-analytics__uncovered"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
          role="note"
        >
          <h3 className="admin-smart-assignment-analytics__uncovered-title">
            {t(`${prefix}.uncoveredTitle`)}
          </h3>
          <ul className="admin-smart-assignment-analytics__uncovered-list" role="list">
            {resolvedAnalytics.uncovered_internship_types.map((row) => (
              <li key={row.internship_type_id} className="admin-smart-assignment-analytics__uncovered-item">
                {t(`${prefix}.uncoveredRow`, {
                  type: row.internship_type_name,
                  count: row.student_count,
                })}
              </li>
            ))}
          </ul>
        </motion.aside>
      ) : null}
    </section>
  );
};

export default SmartAssignmentInternshipAnalyticsPanel;
