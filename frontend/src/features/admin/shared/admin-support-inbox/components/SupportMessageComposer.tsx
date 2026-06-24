import { FunctionComponent, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Mic, Paperclip, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SupportMessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  inputAriaLabel?: string;
  attachAriaLabel?: string;
  voiceAriaLabel?: string;
  sendAriaLabel?: string;
  showAttach?: boolean;
  showVoice?: boolean;
  showHint?: boolean;
  maxLength?: number;
  disabled?: boolean;
  extraActions?: ReactNode;
  onTyping?: (isTyping: boolean) => void;
}

const SupportMessageComposer: FunctionComponent<SupportMessageComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Écrire un message…',
  inputAriaLabel,
  attachAriaLabel,
  voiceAriaLabel,
  sendAriaLabel,
  showAttach = true,
  showVoice = false,
  showHint = true,
  maxLength,
  disabled = false,
  extraActions,
  onTyping,
}) => {
  const { t } = useTranslation();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();
  const canSend = Boolean(trimmed) && !disabled;
  const nearLimit = maxLength ? value.length >= maxLength * 0.85 : false;

  const adjustComposer = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 22), 128)}px`;
  }, []);

  useEffect(() => {
    adjustComposer();
  }, [value, adjustComposer]);

  const handleChange = (next: string) => {
    onChange(maxLength ? next.slice(0, maxLength) : next);
    onTyping?.(Boolean(next.trim()));
  };

  return (
    <footer className="isi-composer-wrap">
      <div
        className={`isi-composer${canSend ? ' isi-composer--ready' : ''}${disabled ? ' isi-composer--disabled' : ''}`}
      >
        {(showAttach || extraActions) ? (
          <div className="isi-composer-tools" aria-hidden={false}>
            {showAttach ? (
              <button
                type="button"
                className="isi-composer-action"
                aria-label={attachAriaLabel ?? t('admin.chat.attachFile')}
                disabled={disabled}
              >
                <Paperclip className="size-[1.05rem]" strokeWidth={1.85} />
              </button>
            ) : null}
            {extraActions}
          </div>
        ) : null}

        <textarea
          ref={composerRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={placeholder}
          className="isi-composer-input"
          aria-label={inputAriaLabel ?? placeholder}
          maxLength={maxLength}
        />

        {showVoice ? (
          <button
            type="button"
            className="isi-composer-action isi-composer-action--voice"
            aria-label={voiceAriaLabel ?? t('admin.chat.voiceNote', { defaultValue: 'Note vocale' })}
            disabled={disabled}
          >
            <Mic className="size-[1.05rem]" strokeWidth={1.85} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className="isi-composer-send"
          aria-label={sendAriaLabel ?? t('admin.chat.sendMessage')}
        >
          <Send className="size-[1.05rem]" strokeWidth={2.25} />
        </button>
      </div>

      {(showHint || (maxLength && nearLimit)) ? (
        <div className="isi-composer-meta">
          {showHint ? (
            <p className="isi-composer-hint">{t('admin.chat.composerHint')}</p>
          ) : (
            <span className="isi-composer-hint" aria-hidden />
          )}
          {maxLength && nearLimit ? (
            <span
              className={`isi-composer-counter${value.length >= maxLength ? ' isi-composer-counter--limit' : ''}`}
              aria-live="polite"
            >
              {value.length}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
};

export default SupportMessageComposer;
