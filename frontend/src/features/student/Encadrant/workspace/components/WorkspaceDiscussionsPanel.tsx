import { FunctionComponent } from 'react';
import { MessageSquare, Paperclip, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workspaceDiscussions } from '../data/workspacePlatformMock';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';

const WorkspaceDiscussionsPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      {workspaceDiscussions.length === 0 ? (
        <StudentSearchEmptyState titleKey="student.encadrant.workspace.platform.empty.discussionsTitle" descriptionKey="student.encadrant.workspace.platform.empty.discussionsDesc" variant="inline" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {workspaceDiscussions.map((thread) => (
            <button key={thread.id} type="button" className="student-workspace-thread">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="admin-badge admin-badge--info text-[10px]">
                  {t(`student.encadrant.workspace.platform.discussions.types.${thread.type}`)}
                </span>
                <span className="text-[11px] text-[var(--admin-text-muted)]">{t(thread.timeKey)}</span>
              </div>
              <h3 className="m-0 text-left text-sm font-semibold text-[var(--admin-text)]">{t(thread.titleKey)}</h3>
              <p className="m-0 mt-1 text-left text-xs text-[var(--admin-text-muted)] line-clamp-2">{t(thread.lastMessageKey)}</p>
              <p className="m-0 mt-2 text-left text-[11px] font-medium text-[var(--admin-brand)]">
                {t('student.encadrant.workspace.platform.discussions.replies', { count: thread.replies })}
              </p>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
        <MessageSquare className="h-5 w-5 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
        <input type="text" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" placeholder={t('student.encadrant.workspace.platform.discussions.replyPlaceholder')} />
        <button type="button" className="admin-icon-btn" aria-label="Attach"><Paperclip className="h-4 w-4" /></button>
        <button type="button" className="admin-icon-btn" aria-label="React"><Smile className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export default WorkspaceDiscussionsPanel;
