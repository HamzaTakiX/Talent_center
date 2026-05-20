import { FunctionComponent } from 'react';
import { AlertTriangle, Link2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ConversationDto } from '../types';
import { ConversationKindBadge } from './ConversationKindBadge';

export const ChatContextHeader: FunctionComponent<{
  conversation: ConversationDto | null;
  participantTitle?: string;
}> = ({ conversation, participantTitle }) => {
  const { t } = useTranslation();
  const ctx = conversation?.context;
  if (!conversation && !participantTitle) return null;

  const urgency = ctx?.urgency ?? 'NONE';
  const snapshot = ctx?.context_snapshot_json ?? {};

  return (
    <div className="ctx-chat-context-header border-b border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <ConversationKindBadge kind={ctx?.context_kind} />
            {urgency !== 'NONE' ? (
              <span className={`ctx-chat-urgency ctx-chat-urgency--${urgency.toLowerCase()}`}>
                <AlertTriangle className="size-3.5" aria-hidden />
                {t(`admin.contextualChat.urgency.${urgency}`)}
              </span>
            ) : null}
            {ctx?.workflow_status ? (
              <span className="ctx-chat-workflow-status">{ctx.workflow_status}</span>
            ) : null}
          </div>
          <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
            {ctx?.entity_label || participantTitle || conversation?.title}
          </p>
          {ctx?.entity_type ? (
            <p className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
              <Link2 className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {t('admin.contextualChat.linkedEntity', {
                  type: ctx.entity_type,
                  id: ctx.entity_id,
                })}
              </span>
            </p>
          ) : null}
        </div>
        {ctx?.student_user_id ? (
          <div className="ctx-chat-context-chip">
            <User className="size-3.5" aria-hidden />
            <span>{t('admin.contextualChat.linkedStudent')}</span>
          </div>
        ) : null}
      </div>
      {Object.keys(snapshot).length > 0 ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
          {Object.entries(snapshot)
            .slice(0, 6)
            .map(([key, val]) => (
              <div key={key}>
                <dt className="text-[var(--admin-text-muted)]">{key}</dt>
                <dd className="truncate font-medium text-[var(--admin-text)]">{String(val)}</dd>
              </div>
            ))}
        </dl>
      ) : null}
    </div>
  );
};
