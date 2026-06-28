import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessageBubbleContent from '../../contextual-chat/components/ChatMessageBubbleContent';
import type { ChatAttachmentView } from '../../contextual-chat/utils/chatAttachmentUtils';
import { formatChatSystemMessage } from '../utils/chatSystemMessageUtils';
import ChatMessageReadStatus from './ChatMessageReadStatus';
import ChatWorkflowSystemMessage from './ChatWorkflowSystemMessage';

export type StandardChatMessage = {
  id: string;
  direction?: 'in' | 'out';
  text: string;
  time: string;
  createdAt?: string;
  separatorBefore?: string;
  messageType?: string;
  attachments?: ChatAttachmentView[];
  attachmentName?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenTime?: string;
  smartActionCode?: string;
};

export type StandardChatMessageThreadProps = {
  messages: StandardChatMessage[];
  inboxMode?: 'admin' | 'student';
  systemEventsPrefix?: string;
  emptyLabel?: string;
  typing?: boolean;
  typingLabel?: string;
  seenLabelFor?: (message: StandardChatMessage) => string | undefined;
  getMessageBlockProps?: (messageId: string) => {
    'data-chat-msg-id': string;
    className: string;
  };
  renderHighlightedText?: (messageId: string, text: string) => ReactNode;
};

const StandardChatMessageThread: FunctionComponent<StandardChatMessageThreadProps> = ({
  messages,
  inboxMode = 'admin',
  systemEventsPrefix,
  emptyLabel,
  typing = false,
  typingLabel,
  seenLabelFor,
  getMessageBlockProps,
  renderHighlightedText,
}) => {
  const { t } = useTranslation();

  if (!messages.length && !typing) {
    if (!emptyLabel) return null;
    return (
      <div className="isi-messages-empty">
        <p className="text-sm text-[var(--admin-text-muted)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => {
        const blockProps = getMessageBlockProps?.(msg.id) ?? {
          'data-chat-msg-id': msg.id,
          className: 'isi-msg-block',
        };

        const systemLabel =
          msg.messageType === 'EVENT' || msg.messageType === 'SYSTEM'
            ? formatChatSystemMessage(
                msg,
                { inboxMode, systemEventsPrefix },
                t,
              )
            : null;

        return (
          <div key={msg.id} {...blockProps}>
            {msg.separatorBefore ? (
              <div className="isi-date-sep">
                <span>{msg.separatorBefore}</span>
              </div>
            ) : null}
            {systemLabel ? (
              <ChatWorkflowSystemMessage label={systemLabel} createdAt={msg.createdAt} />
            ) : msg.direction === 'in' ? (
              <div className="isi-msg isi-msg--in">
                <ChatMessageBubbleContent
                  messageId={msg.id}
                  text={msg.text}
                  attachments={msg.attachments}
                  attachmentName={msg.attachmentName}
                  messageType={msg.messageType}
                  direction="in"
                  renderText={renderHighlightedText}
                />
                <time className="isi-msg-time">{msg.time}</time>
              </div>
            ) : (
              <div className="isi-msg isi-msg--out">
                <ChatMessageBubbleContent
                  messageId={msg.id}
                  text={msg.text}
                  attachments={msg.attachments}
                  attachmentName={msg.attachmentName}
                  messageType={msg.messageType}
                  direction="out"
                  renderText={renderHighlightedText}
                />
                <ChatMessageReadStatus
                  time={msg.time}
                  deliveryStatus={msg.deliveryStatus}
                  seenTime={msg.seenTime}
                  seenLabel={seenLabelFor?.(msg)}
                />
              </div>
            )}
          </div>
        );
      })}
      {typing ? (
        <div className="isi-typing-indicator text-xs text-[var(--admin-text-muted)] px-4 pb-2">
          {typingLabel ?? t('admin.chat.typingIndicator', { defaultValue: "En train d'écrire…" })}
        </div>
      ) : null}
    </>
  );
};

export default StandardChatMessageThread;
