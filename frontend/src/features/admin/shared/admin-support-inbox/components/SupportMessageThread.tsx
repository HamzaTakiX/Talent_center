import { FunctionComponent } from 'react';
import { CheckCheck, Paperclip } from 'lucide-react';
import type { SupportMessage } from '../types/supportInboxTypes';

interface Props {
  messages: SupportMessage[];
  typing?: boolean;
  typingLabel?: string;
}

const SupportMessageThread: FunctionComponent<Props> = ({
  messages,
  typing = false,
  typingLabel = "En train d'écrire…",
}) => (
  <>
    {messages.map((msg) => (
      <div key={msg.id} className="isi-msg-block">
        {msg.separatorBefore ? (
          <div className="isi-date-sep">
            <span>{msg.separatorBefore}</span>
          </div>
        ) : null}
        {msg.direction === 'in' ? (
          <div className="isi-msg isi-msg--in">
            <div className="isi-bubble isi-bubble--in">{msg.text}</div>
            {msg.attachmentName ? (
              <div className="isi-file-preview">
                <Paperclip className="size-4 shrink-0" />
                <span>{msg.attachmentName}</span>
              </div>
            ) : null}
            <time className="isi-msg-time">{msg.time}</time>
          </div>
        ) : (
          <div className="isi-msg isi-msg--out">
            <div className="isi-bubble isi-bubble--out">{msg.text}</div>
            <div className="isi-msg-meta">
              <time className="isi-msg-time">{msg.time}</time>
              <CheckCheck className="size-3.5 opacity-60" strokeWidth={2.25} />
            </div>
          </div>
        )}
      </div>
    ))}
    {typing ? (
      <div className="isi-typing">
        <span />
        <span />
        <span />
        <span>{typingLabel}</span>
      </div>
    ) : null}
  </>
);

export default SupportMessageThread;
