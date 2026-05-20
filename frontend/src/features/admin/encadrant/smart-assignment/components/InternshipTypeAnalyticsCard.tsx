import { FunctionComponent, useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../dashboard/ui/animations';
import AnimatedStatValue from './AnimatedStatValue';
import {
  buildDonutSegments,
  type AnalyticsInsight,
  type DistributionRow,
  type DistributionSnapshot,
  type InsightKind,
} from './internshipAnalyticsUtils';

const DONUT_SIZE = 140;
const DONUT_R = 52;
const DONUT_STROKE = 10;

type CardVariant = 'students' | 'encadrants';

interface InternshipTypeAnalyticsCardProps {
  variant: CardVariant;
  snapshot: DistributionSnapshot;
  insights: AnalyticsInsight[];
  coverageRatio?: number;
  missingCoverageCount?: number;
}

const STATUS_CLASS: Record<string, string> = {
  balanced: 'sa-type-analytics__status--balanced',
  low: 'sa-type-analytics__status--warn',
  over: 'sa-type-analytics__status--danger',
  surplus: 'sa-type-analytics__status--info',
  none: 'sa-type-analytics__status--danger',
};

function statusLabelKey(status: DistributionRow['status']): string {
  switch (status) {
    case 'low':
      return 'statusLowCoverage';
    case 'over':
      return 'statusOverCapacity';
    case 'surplus':
      return 'statusSurplus';
    case 'none':
      return 'statusNoSupervisor';
    default:
      return 'statusBalanced';
  }
}

function insightLabelKey(kind: InsightKind): string {
  switch (kind) {
    case 'lowCoverage':
      return 'insightLowCoverage';
    case 'balanced':
      return 'insightBalanced';
    case 'limitedSupervisors':
      return 'insightLimitedSupervisors';
    case 'overCapacity':
      return 'insightOverCapacity';
    case 'surplusSupervisors':
      return 'insightSurplusSupervisors';
    case 'uncovered':
      return 'insightUncovered';
    case 'dominant':
      return 'insightDominant';
    case 'diversified':
      return 'insightDiversified';
    default:
      return 'insightBalanced';
  }
}

const InternshipTypeAnalyticsCard: FunctionComponent<InternshipTypeAnalyticsCardProps> = ({
  variant,
  snapshot,
  insights,
  coverageRatio,
  missingCoverageCount,
}) => {
  const { t } = useTranslation();
  const prefix = 'admin.smartAssignment.analytics';
  const isStudents = variant === 'students';

  const donutSegments = useMemo(
    () => buildDonutSegments(snapshot.rows, snapshot.donutTotal),
    [snapshot.rows, snapshot.donutTotal]
  );

  const showMultiTypeNote = !isStudents && snapshot.donutTotal > snapshot.total;

  const maxBar = useMemo(
    () => Math.max(...snapshot.rows.map((r) => r.count), 1),
    [snapshot.rows]
  );

  const Icon = isStudents ? Users : UserCheck;
  const title = t(isStudents ? `${prefix}.studentsByType` : `${prefix}.encadrantsByType`);
  const subtitle = t(isStudents ? `${prefix}.studentsCardSubtitle` : `${prefix}.encadrantsCardSubtitle`);
  const centerLabel = t(
    isStudents ? `${prefix}.donutCenterStudents` : `${prefix}.donutCenterEncadrants`
  );

  return (
    <article
      className={`sa-type-analytics-card sa-type-analytics-card--${variant}`}
      aria-labelledby={`sa-analytics-${variant}-title`}
    >
      <header className="sa-type-analytics-card__header">
        <span className={`sa-type-analytics-card__icon sa-type-analytics-card__icon--${variant}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <motion.div
          className="min-w-0 flex-1"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
        >
          <h3 id={`sa-analytics-${variant}-title`} className="sa-type-analytics-card__title">
            {title}
          </h3>
          <p className="sa-type-analytics-card__subtitle">{subtitle}</p>
        </motion.div>
        <div className="sa-type-analytics-card__total-pill">
          <AnimatedStatValue
            value={snapshot.total}
            className="sa-type-analytics-card__total-value"
          />
          <span className="sa-type-analytics-card__total-label">
            {t(isStudents ? `${prefix}.totalStudents` : `${prefix}.totalEncadrants`)}
          </span>
        </div>
      </header>

      <motion.div
        className="sa-type-analytics-card__kpis"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easePremium }}
      >
        <div className="sa-type-analytics-kpi">
          <span className="sa-type-analytics-kpi__label">
            {t(isStudents ? `${prefix}.largestCategory` : `${prefix}.supervisedTypes`)}
          </span>
          <span className="sa-type-analytics-kpi__value" title={snapshot.largest?.label}>
            {snapshot.largest?.label ?? '—'}
          </span>
          {snapshot.largest ? (
            <span className="sa-type-analytics-kpi__meta tabular-nums">{snapshot.largest.count}</span>
          ) : null}
        </div>
        <div className="sa-type-analytics-kpi">
          <span className="sa-type-analytics-kpi__label">
            {t(isStudents ? `${prefix}.smallestCategory` : `${prefix}.missingCoverage`)}
          </span>
          <span
            className="sa-type-analytics-kpi__value"
            title={isStudents ? snapshot.smallest?.label : undefined}
          >
            {isStudents
              ? (snapshot.smallest?.label ?? '—')
              : String(missingCoverageCount ?? 0)}
          </span>
          {isStudents && snapshot.smallest ? (
            <span className="sa-type-analytics-kpi__meta tabular-nums">{snapshot.smallest.count}</span>
          ) : null}
        </div>
        {!isStudents && coverageRatio !== undefined ? (
          <div className="sa-type-analytics-kpi">
            <span className="sa-type-analytics-kpi__label">{t(`${prefix}.coverageRatio`)}</span>
            <AnimatedStatValue
              value={coverageRatio}
              suffix="%"
              className="sa-type-analytics-kpi__value sa-type-analytics-kpi__value--accent"
            />
          </div>
        ) : null}
      </motion.div>

      <motion.div
        className="sa-type-analytics-card__body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.08, ease: easePremium }}
      >
        <motion.div className="sa-type-analytics-visual">
          <motion.div className="sa-type-analytics-visual__inner">
            {snapshot.rows.length === 0 ? (
              <p className="sa-type-analytics-empty">{t(`${prefix}.noData`)}</p>
            ) : (
              <>
                <motion.div className="sa-type-analytics-donut-wrap">
                  <svg
                    viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                    className="sa-type-analytics-donut-svg"
                    role="img"
                    aria-label={title}
                  >
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={DONUT_R}
                      fill="none"
                      className="sa-type-analytics-donut-track"
                      strokeWidth={DONUT_STROKE}
                    />
                    {donutSegments.map((seg) =>
                      seg.sweep > 0 ? (
                        <motion.path
                          key={seg.key}
                          d={seg.path}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth={DONUT_STROKE}
                          strokeLinecap="butt"
                          className="sa-type-analytics-donut-segment"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.06 + seg.index * 0.07,
                            ease: easePremium,
                          }}
                        />
                      ) : null
                    )}
                  </svg>
                  <motion.div
                    className="sa-type-analytics-donut-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.15, ease: easePremium }}
                  >
                    <AnimatedStatValue
                      value={snapshot.total}
                      className="sa-type-analytics-donut-center__value"
                    />
                    <span className="sa-type-analytics-donut-center__label">{centerLabel}</span>
                    {showMultiTypeNote ? (
                      <span className="sa-type-analytics-donut-center__hint">
                        {t(`${prefix}.encadrantsMultiTypeNote`, { slots: snapshot.donutTotal })}
                      </span>
                    ) : null}
                  </motion.div>
                </motion.div>

                <ul className="sa-type-analytics-mini-legend">
                  {donutSegments.slice(0, 4).map((seg) => {
                    const legendPct = isStudents
                      ? seg.percent
                      : snapshot.donutTotal > 0
                        ? Math.round((seg.count / snapshot.donutTotal) * 100)
                        : 0;
                    return (
                    <li key={seg.key} className="sa-type-analytics-mini-legend__item">
                      <span
                        className="sa-type-analytics-mini-legend__dot"
                        style={{ background: seg.color }}
                        aria-hidden
                      />
                      <span className="sa-type-analytics-mini-legend__label" title={seg.label}>
                        {seg.label}
                      </span>
                      <span className="sa-type-analytics-mini-legend__pct tabular-nums">
                        {legendPct}%
                      </span>
                    </li>
                    );
                  })}
                </ul>
              </>
            )}
          </motion.div>
        </motion.div>

        <ul className="sa-type-analytics-bars" role="list">
          {snapshot.rows.length === 0 ? null : (
            snapshot.rows.map((row, index) => {
              const widthPct = Math.max((row.count / maxBar) * 100, row.count > 0 ? 6 : 0);
              const TrendIcon =
                row.status === 'over' || row.status === 'none'
                  ? TrendingUp
                  : row.status === 'surplus'
                    ? TrendingDown
                    : null;

              return (
                <motion.li
                  key={row.key}
                  className="sa-type-analytics-bar-row"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.04 * index, ease: easePremium }}
                >
                  <motion.div
                    className="sa-type-analytics-bar-row__head"
                    style={{ '--chart-segment-color': row.color } as CSSProperties}
                  >
                    <span className="sa-type-analytics-bar-row__badge">
                      <span className="sa-type-analytics-bar-row__dot" aria-hidden />
                      <span className="sa-type-analytics-bar-row__name" title={row.label}>
                        {row.label}
                      </span>
                    </span>
                    <span className="sa-type-analytics-bar-row__metrics">
                      <span className="sa-type-analytics-bar-row__count tabular-nums">{row.count}</span>
                      <span
                        className="sa-type-analytics-bar-row__pct tabular-nums"
                        title={
                          !isStudents
                            ? t(`${prefix}.percentOfSupervisors`, { percent: row.percent })
                            : undefined
                        }
                      >
                        {row.percent}%
                      </span>
                      {!isStudents ? (
                        <span
                          className={`sa-type-analytics__status ${STATUS_CLASS[row.status] ?? ''}`}
                        >
                          {TrendIcon ? <TrendIcon className="h-3 w-3" aria-hidden /> : null}
                          {t(`${prefix}.${statusLabelKey(row.status)}`)}
                        </span>
                      ) : (
                        <span className="sa-type-analytics-bar-row__share">
                          {t(`${prefix}.shareOfTotal`, { percent: row.percent })}
                        </span>
                      )}
                    </span>
                  </motion.div>
                  <div className="sa-type-analytics-bar-row__track" aria-hidden>
                    <motion.span
                      className="sa-type-analytics-bar-row__fill"
                      style={{ '--chart-segment-color': row.color } as CSSProperties}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.55, delay: 0.08 + index * 0.05, ease: easePremium }}
                    />
                  </div>
                  {!isStudents && row.studentCount !== undefined ? (
                    <p className="sa-type-analytics-bar-row__compare">
                      <span className="tabular-nums">{row.studentCount}</span>{' '}
                      {t(`${prefix}.studentsLabel`)} ·{' '}
                      <span className="tabular-nums">{row.encadrantCount ?? 0}</span>{' '}
                      {t(`${prefix}.encadrantsLabel`)}
                    </p>
                  ) : null}
                </motion.li>
              );
            })
          )}
        </ul>
      </motion.div>

      {insights.length > 0 ? (
        <motion.footer
          className="sa-type-analytics-insights"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: easePremium }}
        >
          <p className="sa-type-analytics-insights__title">
            <span className="sa-type-analytics-insights__icon" aria-hidden>
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            {t(`${prefix}.insightsTitle`)}
          </p>
          <ul className="sa-type-analytics-insights__list" role="list">
            {insights.map((insight, i) => (
              <li
                key={`${insight.kind}-${insight.type}-${i}`}
                className={`sa-type-analytics-insights__item sa-type-analytics-insights__item--${insight.kind}`}
              >
                {insight.kind === 'uncovered' || insight.kind === 'overCapacity' ? (
                  <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Lightbulb className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
                )}
                <span>
                  {t(`${prefix}.${insightLabelKey(insight.kind)}`, {
                    type: insight.type,
                    count: insight.count ?? 0,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </motion.footer>
      ) : null}
    </article>
  );
};

export default InternshipTypeAnalyticsCard;
