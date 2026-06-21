import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { Mic, Paperclip, Send } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  showAttach?: boolean;
  showVoice?: boolean;
}

const SupportMessageComposer: FunctionComponent<Props> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Écrire un message…',
  showAttach = true,
  showVoice = true,
}) => {
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const adjustComposer = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 24), 120)}px`;
  }, []);

  useEffect(() => {
    adjustComposer();
  }, [value, adjustComposer]);

  return (
    <footer className="isi-composer-wrap">
      <div className="isi-composer">
        {showAttach ? (
          <button type="button" className="isi-composer-action" aria-label="Pièce jointe">
            <Paperclip className="size-4" strokeWidth={1.85} />
          </button>
        ) : null}
        <textarea
          ref={composerRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="isi-composer-input"
          aria-label="Message"
        />
        {showVoice ? (
          <button type="button" className="isi-composer-action" aria-label="Note vocale">
            <Mic className="size-4" strokeWidth={1.85} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="isi-composer-send"
          aria-label="Envoyer"
        >
          <Send className="size-4" strokeWidth={2} />
        </button>
      </div>
    </footer>
  );
};

export default SupportMessageComposer;
