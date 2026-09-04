import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ChatMessageBubbleContent from '../../contextual-chat/components/ChatMessageBubbleContent';
import ChatMessageTags from '../../contextual-chat/components/ChatMessageTags';
import ChatMessageEntityRefs from '../../contextual-chat/components/ChatMessageEntityRefs';
import type { ChatEntityReference } from '../../contextual-chat/types/chatEntityTypes';
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
  tags?: string[];
  entityRefs?: ChatEntityReference[];
  meetingRequest?: {
    requestId: string;
    mode: 'video' | 'voice';
    status: 'pending' | 'accepted' | 'declined';
    title?: string;
  };
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
  renderMeetingRequest?: (message: StandardChatMessage) => ReactNode;
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
  renderMeetingRequest,
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

        const coveredTagCodes = new Set(
          (msg.entityRefs ?? []).map((ref) => ref.entity_type).filter(Boolean),
        );
        const visibleTags = msg.tags?.filter((code) => !coveredTagCodes.has(code));

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
            ) : msg.messageType === 'MEETING_REQUEST' && msg.meetingRequest && renderMeetingRequest ? (
              <div className={`isi-msg isi-msg--${msg.direction ?? 'in'}`}>
                {renderMeetingRequest(msg)}
                {msg.direction === 'in' ? (
                  <time className="isi-msg-time">{msg.time}</time>
                ) : (
                  <ChatMessageReadStatus time={msg.time} deliveryStatus={msg.deliveryStatus} />
                )}
              </div>
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
                <ChatMessageEntityRefs entityRefs={msg.entityRefs} />
                <ChatMessageTags tags={visibleTags} />
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
                <ChatMessageEntityRefs entityRefs={msg.entityRefs} />
                <ChatMessageTags tags={visibleTags} />
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
