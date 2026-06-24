import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../dashboard/ui/animations';
import AdminModal from '../../ui/AdminModal';
import AnnouncementsPanelEmpty from './AnnouncementsPanelEmpty';

export interface AnnInsight {
  kind: string;
  severity: string;
  title: string;
  message: string;
}

interface Props {
  insights: AnnInsight[];
  previewLimit?: number;
}

const toneMap: Record<string, string> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
};

const AnnouncementInsightItem: FunctionComponent<{
  item: AnnInsight;
  index: number;
  motionItem?: boolean;
}> = ({ item, index, motionItem = false }) => {
  const className = `admin-ann-insight admin-ann-insight--${toneMap[item.severity] ?? 'info'}`;
  const content = (
    <>
      <span className="admin-ann-insight__dot" aria-hidden />
      <span>
        <strong className="text-[var(--admin-text)]">{item.title}</strong>
        <br />
        {item.message}
      </span>
    </>
  );

  if (motionItem) {
    return (
      <motion.li
        key={`${item.kind}-${index}`}
        variants={fadeInUp}
        className={className}
      >
        {content}
      </motion.li>
    );
  }

  return (
    <li key={`${item.kind}-${index}`} className={className}>
      {content}
    </li>
  );
};

const AnnouncementsInsightsPanel: FunctionComponent<Props> = ({ insights, previewLimit }) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const isEmpty = insights.length === 0;
  const hasPreviewLimit = previewLimit != null && previewLimit > 0;
  const visibleInsights = hasPreviewLimit ? insights.slice(0, previewLimit) : insights;
  const hasMore = hasPreviewLimit && insights.length > previewLimit;

  return (
    <>
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
            <>
              <motion.ul
                className="admin-ann-insights__list"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {visibleInsights.map((item, i) => (
                  <AnnouncementInsightItem key={`${item.kind}-${i}`} item={item} index={i} motionItem />
                ))}
              </motion.ul>
              {hasMore ? (
                <div className="admin-ann-insights__footer">
                  <button
                    type="button"
                    className="admin-ann-insights__view-all"
                    onClick={() => setModalOpen(true)}
                  >
                    {t('admin.announcementsModule.insights.viewAll', { count: insights.length })}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.section>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('admin.announcementsModule.insights.panelTitle')}
        description={t('admin.announcementsModule.insights.subtitle')}
        maxWidthClass="max-w-2xl"
        closeAriaLabel={t('admin.common.actions.close', { defaultValue: 'Fermer' })}
      >
        <ul className="admin-ann-insights__list admin-ann-insights__list--modal">
          {insights.map((item, i) => (
            <AnnouncementInsightItem key={`modal-${item.kind}-${i}`} item={item} index={i} />
          ))}
        </ul>
      </AdminModal>
    </>
  );
};

export default AnnouncementsInsightsPanel;
