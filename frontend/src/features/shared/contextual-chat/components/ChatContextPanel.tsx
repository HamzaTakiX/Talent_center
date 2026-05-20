import { FunctionComponent } from 'react';
import { Calendar, FileText, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ConversationDto } from '../types';

export const ChatContextPanel: FunctionComponent<{
  conversation: ConversationDto | null;
}> = ({ conversation }) => {
  const { t } = useTranslation();
  if (!conversation) {
    return (
      <aside className="ctx-chat-panel hidden min-h-0 w-[min(100%,280px)] shrink-0 flex-col border-l border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] xl:flex">
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-[var(--admin-text-secondary)]">
            {t('admin.contextualChat.panelEmpty')}
          </p>
        </div>
      </aside>
    );
  }

  const ctx = conversation.context;
  const snapshot = ctx?.context_snapshot_json ?? {};
  const files = (snapshot.related_files as { name: string }[] | undefined) ?? [];
  const deadline = snapshot.deadline as string | undefined;
  const recentActions = (snapshot.recent_actions as string[] | undefined) ?? [];

  return (
    <aside className="ctx-chat-panel hidden min-h-0 w-[min(100%,280px)] shrink-0 flex-col border-l border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] xl:flex">
      <div className="border-b border-[var(--admin-border)] px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
          {t('admin.contextualChat.panelTitle')}
        </h3>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section>
          <h4 className="mb-2 text-xs font-semibold text-[var(--admin-text)]">
            {t('admin.contextualChat.panelWorkflow')}
          </h4>
          <p className="text-sm text-[var(--admin-text-secondary)]">
            {ctx?.workflow_status || t('admin.contextualChat.panelNoStatus')}
          </p>
        </section>

        {deadline ? (
          <section className="ctx-chat-panel-card">
            <Calendar className="size-4 text-[var(--admin-brand)]" aria-hidden />
            <div>
              <p className="text-xs text-[var(--admin-text-muted)]">{t('admin.contextualChat.panelDeadline')}</p>
              <p className="text-sm font-medium">{deadline}</p>
            </div>
          </section>
        ) : null}

        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--admin-text)]">
            <Users className="size-3.5" aria-hidden />
            {t('admin.contextualChat.panelParticipants')}
          </h4>
          <ul className="space-y-1.5">
            {conversation.participants.map((p) => (
              <li key={p.user_id} className="truncate text-xs text-[var(--admin-text-secondary)]">
                <span className="font-medium text-[var(--admin-text)]">{p.full_name || p.email}</span>
                <span className="text-[var(--admin-text-muted)]"> · {p.role}</span>
              </li>
            ))}
          </ul>
        </section>

        {files.length > 0 ? (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--admin-text)]">
              <FileText className="size-3.5" aria-hidden />
              {t('admin.contextualChat.panelFiles')}
            </h4>
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.name} className="ctx-chat-file-chip truncate text-xs">
                  {f.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {recentActions.length > 0 ? (
          <section>
            <h4 className="mb-2 text-xs font-semibold text-[var(--admin-text)]">
              {t('admin.contextualChat.panelRecentActions')}
            </h4>
            <ul className="space-y-1 text-xs text-[var(--admin-text-secondary)]">
              {recentActions.map((a) => (
                <li key={a} className="border-l-2 border-[var(--admin-brand)]/30 pl-2">
                  {a}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
};
