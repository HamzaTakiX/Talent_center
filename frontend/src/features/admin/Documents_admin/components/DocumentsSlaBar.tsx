import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface Props {
  percent: number;
  compact?: boolean;
  deadline?: string | null;
}

const DocumentsSlaBar: FunctionComponent<Props> = ({ percent, compact, deadline }) => {
  const { t } = useTranslation();
  const safePercent = Math.min(100, Math.max(0, percent));
  const level = safePercent >= 90 ? 'critical' : safePercent >= 70 ? 'warning' : 'ok';
  const fillWidth = safePercent > 0 ? safePercent : 0;
  const deadlineLabel = deadline
    ? t('admin.documentsModule.table.slaDeadline', {
        date: new Date(deadline).toLocaleString(undefined, {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : undefined;
  const title = [t('admin.documentsModule.table.slaProgress', { percent: safePercent }), deadlineLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={`admin-doc-sla ${compact ? 'admin-doc-sla--compact' : ''}`} title={title}>
      <motion.div className="admin-doc-sla__track" aria-hidden>
        <motion.div
          className={`admin-doc-sla__fill admin-doc-sla__fill--${level}`}
          initial={{ width: 0 }}
          animate={{ width: `${fillWidth}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>
      <span className="admin-doc-sla__label">{safePercent}%</span>
    </div>
  );
};

export default DocumentsSlaBar;
