import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../dashboard/ui/animations';
import AnnouncementsPanelEmpty from './AnnouncementsPanelEmpty';

export interface AnnInsight {
  kind: string;
  severity: string;
  title: string;
  message: string;
}

interface Props {
  insights: AnnInsight[];
}

const toneMap: Record<string, string> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
};

const AnnouncementsInsightsPanel: FunctionComponent<Props> = ({ insights }) => {
  const { t } = useTranslation();
  const isEmpty = insights.length === 0;

  return (
    <motion.section {...fadeInUp} className="admin-ann-insights" aria-labelledby="ann-insights-title">
      <div className="admin-ann-insights__head">
        <Lightbulb className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <h3 id="ann-insights-title" className="admin-ann-panel-title">
          {t('admin.announcementsModule.insights.panelTitle')}
        </h3>
      </div>
      <div className="admin-ann-panel-body">
        {isEmpty ? (
          <AnnouncementsPanelEmpty variant="insights" />
        ) : (
          <motion.ul
            className="admin-ann-insights__list"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {insights.map((item, i) => (
              <motion.li
                key={`${item.kind}-${i}`}
                variants={fadeInUp}
                className={`admin-ann-insight admin-ann-insight--${toneMap[item.severity] ?? 'info'}`}
              >
                <span className="admin-ann-insight__dot" aria-hidden />
                <span>
                  <strong className="text-[var(--admin-text)]">{item.title}</strong>
                  <br />
                  {item.message}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.section>
  );
};

export default AnnouncementsInsightsPanel;
