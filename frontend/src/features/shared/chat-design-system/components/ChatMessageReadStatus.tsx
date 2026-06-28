import { FunctionComponent } from 'react';
import { Check, CheckCheck } from 'lucide-react';

export type ChatMessageReadStatusProps = {
  time: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenTime?: string;
  seenLabel?: string;
};

const ChatMessageReadStatus: FunctionComponent<ChatMessageReadStatusProps> = ({
  time,
  deliveryStatus,
  seenTime,
  seenLabel,
}) => {
  const isRead = deliveryStatus === 'read';
  const isDelivered = deliveryStatus === 'delivered' || isRead;
  const seenHint = isRead
    ? seenTime
      ? (seenLabel ?? `Vu à ${seenTime}`)
      : (seenLabel ?? 'Lu')
    : undefined;

  return (
    <div className="isi-msg-meta" title={seenHint}>
      <time className="isi-msg-time">{time}</time>
      {isRead ? (
        <CheckCheck
          className="isi-msg-check isi-msg-check--read size-3.5"
          strokeWidth={2.25}
          aria-label={seenHint}
        />
      ) : isDelivered ? (
        <CheckCheck
          className="isi-msg-check isi-msg-check--delivered size-3.5"
          strokeWidth={2.25}
          aria-hidden
        />
      ) : (
        <Check className="isi-msg-check isi-msg-check--sent size-3.5" strokeWidth={2.25} aria-hidden />
      )}
    </div>
  );
};

export default ChatMessageReadStatus;
