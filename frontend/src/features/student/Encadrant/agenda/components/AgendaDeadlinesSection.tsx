import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { agendaDeadlineItems } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';
import { AGENDA_PRIORITY_CLASS } from '../constants/agendaPriorities';

const AgendaDeadlinesSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.agenda.platform.deadlines.title')}
        </h2>
      </div>
      <div className="p-4 sm:p-5">
        {agendaDeadlineItems.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.agenda.platform.empty.deadlinesTitle"
            descriptionKey="student.encadrant.agenda.platform.empty.deadlinesDesc"
            variant="inline"
          />
        ) : (
          agendaDeadlineItems.map((item) => (
            <div key={item.id} className="student-agenda-deadline-row">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(item.titleKey)}</p>
                <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted)]">
                  {t('student.encadrant.agenda.platform.deadlines.remaining', { days: item.daysRemaining })}
                </p>
                <div className="student-agenda-progress-bar mt-2 max-w-xs">
                  <motion.div
                    className="student-agenda-progress-bar__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
              <span className={`admin-badge shrink-0 ${AGENDA_PRIORITY_CLASS[item.priority]}`}>
                {t(`student.encadrant.agenda.priorities.${item.priority}`)}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default AgendaDeadlinesSection;
