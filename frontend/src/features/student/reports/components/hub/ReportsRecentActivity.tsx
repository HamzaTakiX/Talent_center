import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  FileEdit,
  GitBranch,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import type { ReportActivityItem, ReportActivityType } from '../../types';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsRecentActivityProps {
  items: ReportActivityItem[];
}

const iconMap: Record<ReportActivityType, typeof FileEdit> = {
  edit: FileEdit,
  comment: MessageCircle,
  submit: Send,
  version: GitBranch,
  reference: Sparkles,
  feedback: MessageCircle,
};

const ReportsRecentActivity: FunctionComponent<ReportsRecentActivityProps> = ({ items }) => {
  const { t } = useTranslation();

  return (
    <section className="sr-hub-card sr-hub-activity-panel">
      <ReportsWorkspaceModuleHeader
        icon={<Activity className="h-5 w-5" />}
        title={t('student.reports.hub.activityTitle')}
        subtitle={t('student.reports.hub.activityModuleSubtitle')}
      />
      <ul className="sr-hub-activity__list">
        {items.slice(0, 5).map((item, i) => {
          const Icon = iconMap[item.type];
          const timeAgo = formatRelativeTime(item.time, t);

          const content = (
            <>
              <div className={`sr-hub-activity__icon sr-hub-activity__icon--${item.type}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              <div className="sr-hub-activity__body">
                <span className="sr-hub-activity__title">{item.title}</span>
                <span className="sr-hub-activity__desc">{item.description}</span>
              </div>
              <span className="sr-hub-activity__time">{timeAgo}</span>
            </>
          );

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              {item.reportId ? (
                <Link to={studentReportEditorPath(item.reportId)} className="sr-hub-activity__item">
                  {content}
                </Link>
              ) : (
                <div className="sr-hub-activity__item">{content}</div>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
};

function formatRelativeTime(
  iso: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return t('student.reports.hub.timeJustNow');
  if (hours < 24) return t('student.reports.hub.timeHours', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t('student.reports.hub.timeDays', { count: days });
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default ReportsRecentActivity;
