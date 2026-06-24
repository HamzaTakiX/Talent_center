import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Code,
  Heart,
  History,
  Users,
} from 'lucide-react';

import { INTERVIEW_HISTORY } from '../../data/interviewSimulatorDashboardMock';
import type { InterviewDifficulty } from '../../types/interviewSimulatorDashboard';
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

const InterviewHistoryPanel: FunctionComponent = () => {
  const { t } = useTranslation();
  const rows = INTERVIEW_HISTORY;

  const columnLabels = {
    date: t('student.internshipOffers.interviewSim.history.date'),
    type: t('student.internshipOffers.interviewSim.history.type'),
    difficulty: t('student.internshipOffers.interviewSim.history.difficulty'),
    score: t('student.internshipOffers.interviewSim.history.score'),
    duration: t('student.internshipOffers.interviewSim.history.duration'),
    status: t('student.internshipOffers.interviewSim.history.statusCol'),
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
          {t('student.internshipOffers.interviewSim.history.sessionCount', { count: rows.length })}
        </span>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const TypeIcon = TYPE_ICON_BY_KEY[row.typeKey] ?? Users;
              const tier = scoreTier(row.score);
              const difficulty = row.difficulty as InterviewDifficulty;

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
                    <span className={`sr-is-history__score sr-is-history__score--${tier}`}>
                      <span className="sr-is-history__score-value">{row.score}</span>
                      <span className="sr-is-history__score-bar" aria-hidden>
                        <span
                          className="sr-is-history__score-fill"
                          style={{ width: `${Math.min(row.score, 100)}%` }}
                        />
                      </span>
                    </span>
                  </td>
                  <td className="sr-is-history__cell" data-label={columnLabels.duration}>
                    <span className="sr-is-history__duration">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {row.duration}
                    </span>
                  </td>
                  <td className="sr-is-history__cell" data-label={columnLabels.status}>
                    <span className="sr-is-history__status">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {t(row.statusKey)}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};

export default InterviewHistoryPanel;
