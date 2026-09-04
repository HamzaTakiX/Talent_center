import { FunctionComponent, useMemo } from 'react';
import { CheckCircle, FileText, FileUp, MessageCircle, MessageSquare, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { taskFeedActivities } from '../data/taskPlatformMock';
import type { TaskFeedActivityType } from '../types';

const activityIcons: Record<TaskFeedActivityType, typeof FileUp> = {
  upload: FileUp,
  comment: MessageCircle,
  feedback: MessageSquare,
  meeting: Video,
  task: CheckCircle,
  report: FileText,
};

interface TaskActivityViewProps {
  search?: string;
  onSelectTask?: (id: string) => void;
}

const TaskActivityView: FunctionComponent<TaskActivityViewProps> = ({
  search = '',
  onSelectTask,
}) => {
  const { t } = useTranslation();
  const query = search.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    if (!query) return taskFeedActivities;
    return taskFeedActivities.filter((item) => {
      const haystack = [
        t(item.messageKey),
        t(item.actorKey),
        t(item.timeKey),
        t(`student.encadrant.workspace.platform.activity.types.${item.type}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [query, t]);

  return (
    <div className="student-workspace-hub-tab student-workspace-activity-tab flex min-h-0 flex-col p-3 sm:p-4">
      {filteredActivities.length === 0 ? (
        <StudentSearchEmptyState
          titleKey={
            query ? undefined : 'student.encadrant.task.platform.empty.activityTitle'
          }
          descriptionKey={
            query ? undefined : 'student.encadrant.task.platform.empty.activityDesc'
          }
          variant="inline"
          className="student-workspace-hub-empty"
        />
      ) : (
        <ol className="student-workspace-activity">
          {filteredActivities.map((item) => {
            const Icon = activityIcons[item.type];
            const clickable = Boolean(item.taskId && onSelectTask);

            return (
              <li
                key={item.id}
                className={`student-workspace-activity__item student-workspace-activity__item--${item.type}${clickable ? ' is-clickable' : ''}`}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={
                  clickable ? () => onSelectTask?.(item.taskId!) : undefined
                }
                onKeyDown={
                  clickable
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectTask?.(item.taskId!);
                        }
                      }
                    : undefined
                }
              >
                <span className="student-workspace-activity__marker" aria-hidden>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="student-workspace-activity__body">
                  <p className="student-workspace-activity__message">{t(item.messageKey)}</p>
                  <p className="student-workspace-activity__meta">
                    <span className="student-workspace-activity__actor">{t(item.actorKey)}</span>
                    <span className="student-workspace-activity__sep" aria-hidden>
                      ·
                    </span>
                    <span className="student-workspace-activity__time">{t(item.timeKey)}</span>
                  </p>
                </div>
                <span className="student-workspace-activity__type">
                  {t(`student.encadrant.workspace.platform.activity.types.${item.type}`)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default TaskActivityView;
