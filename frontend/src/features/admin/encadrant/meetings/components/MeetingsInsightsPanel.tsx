import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import type {
  EncadrantMeetingOverview,
  MeetingsDashboardSummary,
  MeetingAlert,
} from '../types/supervisionMeeting';
import { buildMeetingsInsights } from '../utils/buildMeetingsInsights';
import { fadeInUp, staggerContainer } from '../../../dashboard/ui/animations';

interface MeetingsInsightsPanelProps {
  summary: MeetingsDashboardSummary | null;
  alerts: MeetingAlert[];
  encadrantRows: EncadrantMeetingOverview[];
}

const MeetingsInsightsPanel: FunctionComponent<MeetingsInsightsPanelProps> = ({
  summary,
  alerts,
  encadrantRows,
}) => {
  const { t } = useTranslation();
  const insights = useMemo(
    () => buildMeetingsInsights(summary, alerts, encadrantRows),
    [summary, alerts, encadrantRows],
  );

  return (
    <motion.section {...fadeInUp} className="admin-meetings-insights" aria-labelledby="meetings-insights-title">
      <div className="admin-meetings-insights__head">
        <Lightbulb className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <h3 id="meetings-insights-title" className="admin-meetings-panel-title">
          {t('admin.modules.meetings.insights.title', { defaultValue: 'Key observations' })}
        </h3>
      </div>
      {insights.length === 0 ? (
        <p className="admin-meetings-insights__empty text-sm text-[var(--admin-text-muted)]">
          {t('admin.modules.meetings.insights.empty', {
            defaultValue: 'Supervision metrics are within normal range. No alerts at this time.',
          })}
        </p>
      ) : (
        <motion.ul className="admin-meetings-insights__list" variants={staggerContainer} initial="hidden" animate="visible">
          {insights.map((item, index) => (
            <motion.li
              key={item.id}
              variants={fadeInUp}
              custom={index}
              className={`admin-meetings-insight admin-meetings-insight--${item.tone}`}
            >
              <span className="admin-meetings-insight__dot" aria-hidden />
              <span className="admin-meetings-insight__text">
                {t(item.messageKey, {
                  defaultValue: item.defaultMessage,
                  count: item.count,
                })}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.section>
  );
};

export default MeetingsInsightsPanel;
