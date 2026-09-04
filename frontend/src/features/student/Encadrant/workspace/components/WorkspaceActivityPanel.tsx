import { FunctionComponent, useMemo } from 'react';
import { FileUp, MessageSquare, Video, CheckCircle, FileText, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workspaceActivities } from '../data/workspacePlatformMock';
import type { ActivityType } from '../types';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { isWorkspaceSearchActive, matchesWorkspaceSearch } from '../utils/workspaceSearch';

const activityIcons: Record<ActivityType, typeof FileUp> = {
  upload: FileUp,
  comment: MessageCircle,
  feedback: MessageSquare,
  meeting: Video,
  task: CheckCircle,
  report: FileText,
};

interface WorkspaceActivityPanelProps {
  search: string;
}

const WorkspaceActivityPanel: FunctionComponent<WorkspaceActivityPanelProps> = ({ search }) => {
  const { t } = useTranslation();
  const isSearching = isWorkspaceSearchActive(search);

  const filteredActivities = useMemo(
    () =>
      workspaceActivities.filter((item) =>
        matchesWorkspaceSearch(search, [
          t(item.messageKey),
          t(item.actorKey),
          t(item.timeKey),
          t(`student.encadrant.workspace.platform.activity.types.${item.type}`),
        ]),
      ),
    [search, t],
  );

  return (
    <div className="student-workspace-hub-tab student-workspace-activity-tab flex h-full min-h-0 flex-col">
      {filteredActivities.length === 0 ? (
        <StudentSearchEmptyState
          titleKey={
            isSearching ? undefined : 'student.encadrant.workspace.platform.empty.activityTitle'
          }
          descriptionKey={
            isSearching ? undefined : 'student.encadrant.workspace.platform.empty.activityDesc'
          }
          variant="inline"
          className="student-workspace-hub-empty"
        />
      ) : (
        <ol className="student-workspace-activity">
          {filteredActivities.map((item) => {
            const Icon = activityIcons[item.type];
            return (
              <li
                key={item.id}
                className={`student-workspace-activity__item student-workspace-activity__item--${item.type}`}
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

export default WorkspaceActivityPanel;
