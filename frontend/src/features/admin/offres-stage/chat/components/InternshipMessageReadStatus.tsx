import { FunctionComponent } from 'react';
import ChatMessageReadStatus from '../../../../shared/chat-design-system/components/ChatMessageReadStatus';
import type { InternshipMessage } from '../types/internshipChatTypes';

type Props = {
  message: Pick<InternshipMessage, 'time' | 'deliveryStatus' | 'seenTime'>;
  seenLabel?: string;
};

const InternshipMessageReadStatus: FunctionComponent<Props> = ({ message, seenLabel }) => (
  <ChatMessageReadStatus
    time={message.time}
    deliveryStatus={message.deliveryStatus}
    seenTime={message.seenTime}
    seenLabel={seenLabel}
  />
);

export default InternshipMessageReadStatus;
