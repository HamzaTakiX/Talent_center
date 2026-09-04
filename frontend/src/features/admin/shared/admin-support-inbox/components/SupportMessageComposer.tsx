import { FunctionComponent, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Mic, Paperclip, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CHAT_ACCEPTED_FILE_TYPES,
  validateChatFiles,
} from '../../../../shared/contextual-chat/utils/chatAttachmentUtils';
import ChatComposerTooltip from '../../../../shared/contextual-chat/components/ChatComposerTooltip';
import ChatEntityBadge from '../../../../shared/contextual-chat/components/ChatEntityBadge';
import ChatPendingAttachmentsPanel from '../../../../shared/contextual-chat/components/ChatPendingAttachmentsPanel';
import type { ChatComposerPendingTag } from '../../../../shared/contextual-chat/types/chatTagTypes';
import type { ChatComposerPendingEntity } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import '../../../../shared/contextual-chat/styles/chat-message-attachments.css';
import '../../../../shared/contextual-chat/styles/chat-composer-tags.css';

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
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
  attachError?: string | null;
  onAttachError?: (message: string | null) => void;
  pendingTags?: ChatComposerPendingTag[];
  onRemovePendingTag?: (code: string) => void;
  pendingEntities?: ChatComposerPendingEntity[];
  onRemovePendingEntity?: (entityType: string, entityId: string) => void;
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
  pendingFiles = [],
  onPendingFilesChange,
  attachError,
  onAttachError,
  pendingTags = [],
  onRemovePendingTag,
  pendingEntities = [],
  onRemovePendingEntity,
}) => {
  const { t } = useTranslation();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const trimmed = value.trim();
  const canSend = (Boolean(trimmed) || pendingFiles.length > 0) && !disabled;
  const nearLimit = maxLength ? value.length >= maxLength * 0.85 : false;
  const resolvedAttachLabel =
    attachAriaLabel ?? t('admin.chat.attachFile', { defaultValue: 'Attach file' });

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

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (!list.length || !onPendingFilesChange) return;
      const merged = [...pendingFiles, ...list];
      const err = validateChatFiles(merged);
      if (err) {
        onAttachError?.(err);
        return;
      }
      onAttachError?.(null);
      onPendingFilesChange(merged);
    },
    [onAttachError, onPendingFilesChange, pendingFiles],
  );

  const removeFile = (index: number) => {
    if (!onPendingFilesChange) return;
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
    onAttachError?.(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && showAttach) setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !showAttach) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <footer
      className={`isi-composer-wrap${dragOver ? ' isi-composer-wrap--drag' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {pendingEntities.length > 0 ? (
        <div
          className="isi-composer-pending-tags isi-composer-pending-entities"
          aria-label={t('admin.chat.selectedEntities', { defaultValue: 'Éléments référencés' })}
        >
          {pendingEntities.map((entity) => (
            <ChatEntityBadge
              key={`${entity.entity_type}:${entity.entity_id}`}
              entity={entity}
              variant="composer"
              onRemove={onRemovePendingEntity}
            />
          ))}
        </div>
      ) : null}

      {pendingTags.length > 0 ? (
        <div className="isi-composer-pending-tags" aria-label={t('admin.chat.selectedTags', { defaultValue: 'Contexte sélectionné' })}>
          {pendingTags.map((tag) => (
            <span
              key={tag.code}
              className="isi-composer-tag-chip"
              style={{ ['--chip-color' as string]: tag.color }}
            >
              <span className="isi-composer-tag-chip__dot" aria-hidden />
              <span className="isi-composer-tag-chip__label">{tag.name}</span>
              {onRemovePendingTag ? (
                <button
                  type="button"
                  className="isi-composer-tag-chip__remove"
                  aria-label={t('admin.chat.removeTag', { name: tag.name, defaultValue: 'Retirer {{name}}' })}
                  onClick={() => onRemovePendingTag(tag.code)}
                >
                  <X className="size-3" strokeWidth={2.25} aria-hidden />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      {pendingFiles.length > 0 ? (
        <ChatPendingAttachmentsPanel files={pendingFiles} onRemove={removeFile} />
      ) : null}

      {attachError ? <p className="isi-composer-error" role="alert">{attachError}</p> : null}

      <div
        className={`isi-composer${canSend ? ' isi-composer--ready' : ''}${disabled ? ' isi-composer--disabled' : ''}`}
      >
        {(showAttach || extraActions) ? (
          <div className="isi-composer-tools" aria-hidden={false}>
            {showAttach ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  multiple
                  accept={CHAT_ACCEPTED_FILE_TYPES}
                  disabled={disabled}
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <ChatComposerTooltip label={resolvedAttachLabel} disabled={disabled}>
                  <button
                    type="button"
                    className="isi-composer-action isi-composer-action--attach"
                    aria-label={resolvedAttachLabel}
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="size-[1.05rem]" strokeWidth={1.85} />
                  </button>
                </ChatComposerTooltip>
              </>
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
