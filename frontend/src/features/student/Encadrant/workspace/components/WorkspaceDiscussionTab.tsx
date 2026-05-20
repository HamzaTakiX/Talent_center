import { Send } from 'lucide-react';
import {
  workspaceDiscussionInputPlaceholder,
  workspaceDiscussionMessages,
} from '../data/workspaceMock';
import {
  WORKSPACE_DISCUSSION_SCROLL,
  WORKSPACE_MESSAGE_BUBBLE,
  WORKSPACE_PANEL_BODY,
  WORKSPACE_PANEL_HEADER,
  WORKSPACE_TAB_ROOT,
} from '../constants/workspaceLayout';
import { WORKSPACE_DISCUSSION_FORM, WORKSPACE_FIELD_INPUT } from '../constants/workspaceStyles';

export default function WorkspaceDiscussionTab() {
  return (
    <div className={WORKSPACE_TAB_ROOT}>
      <header className={WORKSPACE_PANEL_HEADER}>
        <div className="min-w-0 max-w-full flex-1">
          <h2 className="m-0 break-words font-inter text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
            Discussion workspace
          </h2>
          <p className="m-0 mt-0.5 break-words font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            Discussions liées au workspace collaboratif
          </p>
        </div>
      </header>

      <div className={`${WORKSPACE_PANEL_BODY} flex min-h-0 flex-1 flex-col overflow-hidden`}>
        <div className={WORKSPACE_DISCUSSION_SCROLL}>
          {workspaceDiscussionMessages.map((message) => (
            <article
              key={message.id}
              className={`flex w-full min-w-0 max-w-full gap-2 ${message.isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-inter text-[11px] font-semibold text-white ${message.avatarClass}`}
                aria-hidden
              >
                {message.authorInitials}
              </span>
              <div
                className={`flex min-w-0 max-w-[calc(100%-2.5rem)] flex-1 flex-col sm:max-w-[min(100%,520px)] ${message.isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <p
                  className={`${WORKSPACE_MESSAGE_BUBBLE} ${
                    message.isOutgoing
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-[var(--admin-surface-inset)] text-[var(--admin-text)]'
                  }`}
                >
                  {message.text}
                </p>
                <span className="mt-1 max-w-full break-words font-inter text-[11px] leading-4 text-[var(--admin-text-muted)] sm:text-[12px]">
                  {message.timeLabel}
                </span>
              </div>
            </article>
          ))}
        </div>

        <form className={WORKSPACE_DISCUSSION_FORM} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            className={WORKSPACE_FIELD_INPUT}
            placeholder={workspaceDiscussionInputPlaceholder}
            aria-label="Message de discussion"
          />
          <button
            type="submit"
            className="box-border inline-flex h-10 w-full max-w-full shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#030213] text-white transition-opacity hover:opacity-90 sm:h-10 sm:w-10"
            aria-label="Envoyer le message"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
