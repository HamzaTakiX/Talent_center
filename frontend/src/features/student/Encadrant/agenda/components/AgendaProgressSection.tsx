import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { agendaProgressMetrics } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';

const AgendaProgressSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.agenda.platform.progress.title')}
        </h2>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {agendaProgressMetrics.map((metric, index) => (
          <motion.article
            key={metric.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--admin-text)]">{t(metric.labelKey)}</span>
              <span className="text-sm font-bold text-[var(--admin-brand)]">{metric.progress}%</span>
            </div>
            <div className="student-agenda-progress-bar">
              <motion.div
                className="student-agenda-progress-bar__fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${metric.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};

export default AgendaProgressSection;
