import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { agendaPersonalTasks } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';
import { AGENDA_PRIORITY_CLASS } from '../constants/agendaPriorities';
import type { AgendaTaskStatus } from '../types';

const COLUMNS: AgendaTaskStatus[] = ['todo', 'in_progress', 'completed'];

const AgendaTasksKanban: FunctionComponent = () => {
  const { t } = useTranslation();

  const byStatus = useMemo(() => {
    const map: Record<AgendaTaskStatus, typeof agendaPersonalTasks> = {
      todo: [],
      in_progress: [],
      completed: [],
    };
    agendaPersonalTasks.forEach((task) => map[task.status].push(task));
    return map;
  }, []);

  const isEmpty = agendaPersonalTasks.length === 0;

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.agenda.platform.tasks.title')}
        </h2>
      </div>
      {isEmpty ? (
        <div className="p-5">
          <StudentSearchEmptyState
            titleKey="student.encadrant.agenda.platform.empty.tasksTitle"
            descriptionKey="student.encadrant.agenda.platform.empty.tasksDesc"
            variant="inline"
          />
        </div>
      ) : (
        <div className="student-agenda-kanban">
          {COLUMNS.map((status) => (
            <div key={status} className="student-agenda-kanban__col">
              <h3 className="m-0 text-xs font-bold uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t(`student.encadrant.agenda.platform.tasks.columns.${status}`)}
              </h3>
              {byStatus[status].map((task) => (
                <article key={task.id} className="student-agenda-kanban__card">
                  <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(task.titleKey)}</p>
                  <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted)]">
                    {t('student.encadrant.agenda.platform.tasks.due', { date: task.dueAt })}
                  </p>
                  <span className={`admin-badge ${AGENDA_PRIORITY_CLASS[task.priority]}`}>
                    {t(`student.encadrant.agenda.priorities.${task.priority}`)}
                  </span>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default AgendaTasksKanban;
