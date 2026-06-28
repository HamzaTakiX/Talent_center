import { FunctionComponent, ReactNode } from 'react';
import ChatMessageAttachments from './ChatMessageAttachments';
import ChatFileAttachmentCard from './ChatFileAttachmentCard';
import { resolveChatMessageBubbleText } from '../utils/chatAttachmentUtils';
import type { ChatAttachmentView } from '../utils/chatAttachmentUtils';

export type ChatMessageBubbleContentProps = {
  messageId: string;
  text: string;
  attachments?: ChatAttachmentView[];
  attachmentName?: string;
  messageType?: string;
  direction: 'in' | 'out';
  renderText?: (messageId: string, text: string) => ReactNode;
};

/** Shared bubble text + attachment cards for all contextual chat surfaces. */
const ChatMessageBubbleContent: FunctionComponent<ChatMessageBubbleContentProps> = ({
  messageId,
  text,
  attachments,
  attachmentName,
  messageType,
  direction,
  renderText,
}) => {
  const bubbleText = resolveChatMessageBubbleText(
    text,
    attachments,
    attachmentName,
    messageType,
  );

  return (
    <>
      {bubbleText ? (
        <div className={`isi-bubble isi-bubble--${direction}`}>
          {renderText?.(messageId, bubbleText) ?? bubbleText}
        </div>
      ) : null}
      {attachments?.length ? (
        <ChatMessageAttachments attachments={attachments} direction={direction} />
      ) : attachmentName ? (
        <div className={`chat-att-list chat-att-list--${direction}`}>
          <ChatFileAttachmentCard filename={attachmentName} displayOnly />
        </div>
      ) : null}
    </>
  );
};

export default ChatMessageBubbleContent;
