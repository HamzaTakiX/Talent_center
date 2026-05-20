import { FunctionComponent } from 'react';
import { TrendingUp } from 'lucide-react';
import { taskProgressSummary } from '../data/taskMock';
import { taskStatValueClass } from '../data/taskBadgeMaps';
import { TASK_PROGRESS_FILL, TASK_PROGRESS_TRACK } from '../constants/taskStyles';
import { TASK_SURFACE_CARD } from '../constants/taskLayout';

const statItems = [
  { key: 'todo' as const, label: 'À faire' },
  { key: 'in_progress' as const, label: 'En cours' },
  { key: 'in_review' as const, label: 'En révision' },
  { key: 'done' as const, label: 'Terminé' },
];

const TaskProgressCard: FunctionComponent = () => {
  const { completedCount, totalCount, percentLabel, stats } = taskProgressSummary;
  const progressPercent = 55;

  return (
    <section aria-label="Progression globale" className={`${TASK_SURFACE_CARD} min-w-0`}>
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-2">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0">
            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">Progression globale</h2>
            <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              Avancement de toutes vos tâches
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-inter text-sm font-medium leading-5 text-[var(--admin-text)]">Tâches complétées</span>
            <span className="font-inter text-sm font-bold tabular-nums leading-5 text-[#2563eb]">
              {completedCount}/{totalCount} ({percentLabel})
            </span>
          </div>
          <div
            className={TASK_PROGRESS_TRACK}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tâches complétées ${progressPercent}%`}
          >
            <div className={TASK_PROGRESS_FILL} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
          {statItems.map((item) => (
            <div key={item.key} className="min-w-0 text-center sm:text-left">
              <p
                className={`m-0 font-inter text-2xl font-bold tabular-nums leading-8 sm:text-[28px] ${taskStatValueClass[item.key]}`}
              >
                {stats[item.key]}
              </p>
              <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TaskProgressCard;
