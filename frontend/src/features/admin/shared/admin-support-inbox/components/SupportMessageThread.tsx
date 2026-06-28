import { FunctionComponent, ReactNode } from 'react';
import StandardChatMessageThread from '../../../../shared/chat-design-system/components/StandardChatMessageThread';
import type { SupportMessage } from '../types/supportInboxTypes';

interface Props {
  messages: SupportMessage[];
  typing?: boolean;
  typingLabel?: string;
  inboxMode?: 'admin' | 'student';
  getMessageBlockProps?: (messageId: string) => {
    'data-chat-msg-id': string;
    className: string;
  };
  renderHighlightedText?: (messageId: string, text: string) => ReactNode;
}

const SupportMessageThread: FunctionComponent<Props> = ({
  messages,
  typing = false,
  typingLabel,
  inboxMode = 'admin',
  getMessageBlockProps,
  renderHighlightedText,
}) => (
  <StandardChatMessageThread
    messages={messages}
    inboxMode={inboxMode}
    typing={typing}
    typingLabel={typingLabel}
    getMessageBlockProps={getMessageBlockProps}
    renderHighlightedText={renderHighlightedText}
  />
);

export default SupportMessageThread;
