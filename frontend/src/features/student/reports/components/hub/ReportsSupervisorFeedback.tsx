import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import type { HubSupervisorFeedbackItem } from '../../types';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsSupervisorFeedbackProps {
  items: HubSupervisorFeedbackItem[];
  reportId: string;
}

const ReportsSupervisorFeedback: FunctionComponent<ReportsSupervisorFeedbackProps> = ({
  items,
  reportId,
}) => {
  const { t } = useTranslation();
  const pending = items.filter((i) => !i.resolved);

  return (
    <section className="sr-hub-card sr-hub-feedback-panel">
      <ReportsWorkspaceModuleHeader
        icon={<MessageSquareQuote className="h-5 w-5" />}
        title={t('student.reports.hub.feedbackTitle')}
        subtitle={t('student.reports.hub.feedbackModuleSubtitle')}
        badge={
          pending.length > 0 ? (
            <span className="sr-hub-feedback__badge">{pending.length}</span>
          ) : undefined
        }
      />
      <ul className="sr-hub-feedback__list">
        {items.slice(0, 3).map((item, i) => (
          <motion.li
            key={item.id}
            className={`sr-hub-feedback__item sr-hub-feedback__item--${item.priority} ${item.resolved ? 'is-resolved' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className="sr-hub-feedback__top">
              <span className="sr-hub-feedback__section">{item.section}</span>
              <span className={`sr-hub-feedback__priority sr-hub-feedback__priority--${item.priority}`}>
                {t(`student.reports.hub.priority.${item.priority}`)}
              </span>
            </div>
            <p className="sr-hub-feedback__text">{item.text}</p>
            <div className="sr-hub-feedback__footer">
              <span className="sr-hub-feedback__author">{item.author}</span>
              <span className="sr-hub-feedback__date">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
      <Link to={studentReportEditorPath(reportId)} className="sr-hub-card__footer-link">
        {t('student.reports.hub.viewAllFeedback')}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
};

export default ReportsSupervisorFeedback;
