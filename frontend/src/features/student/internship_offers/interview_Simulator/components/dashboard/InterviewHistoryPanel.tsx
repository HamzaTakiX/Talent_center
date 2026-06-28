import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AdminPagination from '../../../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../../../admin/shared/hooks/useAdminPagination';
import { INTERVIEW_HISTORY_PAGE_SIZE } from '../../constants/interviewSimulatorLayout';
import {
  CheckCircle2,
  Clock,
  Code,
  FileText,
  Heart,
  History,
  Loader2,
  Users,
} from 'lucide-react';
import type { InterviewDifficulty, InterviewHistoryRow } from '../../types/interviewSimulatorDashboard';
import { fadeUp } from './InterviewPrimitives';

const TYPE_ICON_BY_KEY: Record<string, typeof Code> = {
  'student.internshipOffers.interviewSim.history.types.technical': Code,
  'student.internshipOffers.interviewSim.history.types.behavioral': Heart,
  'student.internshipOffers.interviewSim.history.types.general': Users,
};

function scoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

interface InterviewHistoryPanelProps {
  rows: InterviewHistoryRow[];
  isLoading?: boolean;
  onViewReport?: (sessionUuid: string) => void;
}

const InterviewHistoryPanel: FunctionComponent<InterviewHistoryPanelProps> = ({
  rows,
  isLoading = false,
  onViewReport,
}) => {
  const { t } = useTranslation();
  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } = useAdminPagination(
    rows,
    INTERVIEW_HISTORY_PAGE_SIZE,
  );

  const columnLabels = {
    date: t('student.internshipOffers.interviewSim.history.date'),
    type: t('student.internshipOffers.interviewSim.history.type'),
    difficulty: t('student.internshipOffers.interviewSim.history.difficulty'),
    score: t('student.internshipOffers.interviewSim.history.score'),
    duration: t('student.internshipOffers.interviewSim.history.duration'),
    status: t('student.internshipOffers.interviewSim.history.statusCol'),
    report: t('student.internshipOffers.interviewSim.history.reportCol'),
  };

  return (
    <motion.section className="sr-is-panel sr-is-history" {...fadeUp}>
      <div className="sr-is-history__header">
        <div>
          <h2 className="sr-is-history__title">
            <History className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.history.title')}
          </h2>
          <p className="sr-is-history__subtitle">
            {t('student.internshipOffers.interviewSim.history.subtitle')}
          </p>
        </div>
        <span className="sr-is-history__count">
          {t('student.internshipOffers.interviewSim.history.sessionCount', { count: totalItems })}
        </span>
      </div>

      {isLoading ? (
        <div className="sr-is-history__loading">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-brand)]" aria-hidden />
        </div>
      ) : rows.length === 0 ? (
        <p className="m-0 px-4 pb-4 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.interviewSim.history.empty')}
        </p>
      ) : (
        <>
          <div className="sr-is-history__table-wrap">
            <table className="sr-is-history__table">
              <thead>
                <tr>
                  <th scope="col">{columnLabels.date}</th>
                  <th scope="col">{columnLabels.type}</th>
                  <th scope="col">{columnLabels.difficulty}</th>
                  <th scope="col">{columnLabels.score}</th>
                  <th scope="col">{columnLabels.duration}</th>
                  <th scope="col">{columnLabels.status}</th>
                  {onViewReport ? <th scope="col">{columnLabels.report}</th> : null}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((row, index) => {
                const TypeIcon = TYPE_ICON_BY_KEY[row.typeKey] ?? Users;
                const tier = scoreTier(row.score);
                const difficulty = row.difficulty as InterviewDifficulty;
                const canViewReport = Boolean(onViewReport && row.hasReport);

                return (
                  <motion.tr
                    key={row.id}
                    className="sr-is-history__row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                  >
                    <td className="sr-is-history__cell sr-is-history__cell--date" data-label={columnLabels.date}>
                      <span className="sr-is-history__date">{row.date}</span>
                      {row.roleLabel ? (
                        <span className="sr-is-history__role">{row.roleLabel}</span>
                      ) : null}
                    </td>
                    <td className="sr-is-history__cell" data-label={columnLabels.type}>
                      <span className="sr-is-history__type">
                        <span className="sr-is-history__type-icon" aria-hidden>
                          <TypeIcon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        {t(row.typeKey)}
                      </span>
                    </td>
                    <td className="sr-is-history__cell" data-label={columnLabels.difficulty}>
                      <span className={`sr-is-history__difficulty sr-is-history__difficulty--${difficulty}`}>
                        {t(`student.internshipOffers.interviewSim.config.difficulty.${difficulty}`)}
                      </span>
                    </td>
                    <td className="sr-is-history__cell" data-label={columnLabels.score}>
                      {row.score > 0 ? (
                        <span className={`sr-is-history__score sr-is-history__score--${tier}`}>
                          <span className="sr-is-history__score-value">{row.score}</span>
                          <span className="sr-is-history__score-bar" aria-hidden>
                            <span
                              className="sr-is-history__score-fill"
                              style={{ width: `${Math.min(row.score, 100)}%` }}
                            />
                          </span>
                        </span>
                      ) : (
                        <span className="sr-is-history__score-empty">—</span>
                      )}
                    </td>
                    <td className="sr-is-history__cell" data-label={columnLabels.duration}>
                      <span className="sr-is-history__duration">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {row.duration}
                      </span>
                    </td>
                  <td className="sr-is-history__cell" data-label={columnLabels.status}>
                    <span
                      className={`sr-is-history__status sr-is-history__status--${row.status === 'abandoned' ? 'abandoned' : row.status === 'in_progress' ? 'progress' : 'done'}`}
                    >
                      {row.status === 'abandoned' ? (
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {t(row.statusKey)}
                    </span>
                  </td>
                    {onViewReport ? (
                      <td className="sr-is-history__cell" data-label={columnLabels.report}>
                        {canViewReport ? (
                          <button
                            type="button"
                            className="sr-is-history__report-btn"
                            onClick={() => onViewReport(row.sessionUuid)}
                          >
                            <FileText className="h-3.5 w-3.5" aria-hidden />
                            {t('student.internshipOffers.interviewSim.history.viewReport')}
                          </button>
                        ) : (
                          <span className="sr-is-history__score-empty">—</span>
                        )}
                      </td>
                    ) : null}
                  </motion.tr>
                );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('student.internshipOffers.interviewSim.history.pagination.sessions')}
          />
        </>
      )}
    </motion.section>
  );
};

export default InterviewHistoryPanel;
