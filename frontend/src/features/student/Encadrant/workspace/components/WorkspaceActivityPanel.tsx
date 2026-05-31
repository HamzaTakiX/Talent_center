import { FunctionComponent } from 'react';
import { FileUp, MessageSquare, Video, CheckCircle, FileText, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workspaceActivities } from '../data/workspacePlatformMock';
import type { ActivityType } from '../types';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';

const activityIcons: Record<ActivityType, typeof FileUp> = {
  upload: FileUp,
  comment: MessageCircle,
  feedback: MessageSquare,
  meeting: Video,
  task: CheckCircle,
  report: FileText,
};

const WorkspaceActivityPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-5">
      {workspaceActivities.length === 0 ? (
        <StudentSearchEmptyState titleKey="student.encadrant.workspace.platform.empty.activityTitle" descriptionKey="student.encadrant.workspace.platform.empty.activityDesc" variant="inline" />
      ) : (
        <div>
          {workspaceActivities.map((item) => {
            const Icon = activityIcons[item.type];
            return (
              <div key={item.id} className="student-workspace-activity-row">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="m-0 text-sm font-medium text-[var(--admin-text)]">{t(item.messageKey)}</p>
                  <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">
                    {t(item.actorKey)} · {t(item.timeKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceActivityPanel;
