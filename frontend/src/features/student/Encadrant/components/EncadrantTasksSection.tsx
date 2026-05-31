import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

import { CheckSquare, Clock } from 'lucide-react';

import { STUDENT_ENCADRANT_TASK_PATH } from '../constants/routes';

import {

  encadrantTaskPriorityClasses,

  encadrantTaskPriorityLabels,

  encadrantTasks,

  encadrantTaskStatusClasses,

  encadrantTaskStatusLabels,

} from '../data/encadrantMock';

import { ENCADRANT_SECTION_HEADER_BTN } from '../constants/encadrantStyles';

import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';



const EncadrantTasksSection: FunctionComponent = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();



  return (

    <section aria-label={t('student.encadrant.tasks.title')} className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>

      <div className="flex flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <CheckSquare className="h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />

            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">

              {t('student.encadrant.tasks.title')}

            </h2>

          </div>

          <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">

            {t('student.encadrant.tasks.subtitle')}

          </p>

        </div>

        <button
          type="button"
          className={ENCADRANT_SECTION_HEADER_BTN}
          onClick={() => navigate(STUDENT_ENCADRANT_TASK_PATH)}
        >

          {t('student.encadrant.tasks.viewAll')}

        </button>

      </div>



      <div className="flex flex-col gap-3 p-4 sm:p-5">

        {encadrantTasks.map((task) => (

          <article

            key={task.id}

            className="flex min-w-0 flex-col gap-2.5 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5 sm:gap-3 sm:p-4"

          >

            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">

              <h3 className="m-0 min-w-0 flex-1 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">

                {task.title}

              </h3>

              <span className={`shrink-0 ${encadrantTaskStatusClasses[task.status]}`}>

                {encadrantTaskStatusLabels[task.status]}

              </span>

            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">

              <span className={encadrantTaskPriorityClasses[task.priority]}>

                {encadrantTaskPriorityLabels[task.priority]}

              </span>

              <p className="m-0 inline-flex items-center gap-1.5 text-[13px] leading-5 text-[var(--admin-text-muted)]">

                <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />

                {t('student.encadrant.tasks.duePrefix')} {task.dueDate}

              </p>

            </div>

          </article>

        ))}

      </div>

    </section>

  );

};



export default EncadrantTasksSection;

