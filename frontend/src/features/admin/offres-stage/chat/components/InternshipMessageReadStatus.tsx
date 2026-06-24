import { FunctionComponent } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { InternshipMessage } from '../types/internshipChatTypes';

type Props = {
  message: Pick<InternshipMessage, 'time' | 'deliveryStatus' | 'seenTime'>;
  seenLabel?: string;
};

const InternshipMessageReadStatus: FunctionComponent<Props> = ({ message, seenLabel }) => {
  const isRead = message.deliveryStatus === 'read';
  const isDelivered = message.deliveryStatus === 'delivered' || isRead;
  const seenHint = isRead
    ? message.seenTime
      ? (seenLabel ?? `Vu à ${message.seenTime}`)
      : (seenLabel ?? 'Lu')
    : undefined;

  return (
    <div className="isi-msg-meta" title={seenHint}>
      <time className="isi-msg-time">{message.time}</time>
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

export default InternshipMessageReadStatus;
