import { FunctionComponent, type KeyboardEvent } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatChatFileSize } from '../utils/chatAttachmentUtils';
import { getChatFilePresentation } from '../utils/chatAttachmentPresentation';
import type { ChatAttachmentKind } from '../utils/chatAttachmentUtils';

export type ChatFileAttachmentCardProps = {
  filename: string;
  sizeBytes?: number;
  kind?: ChatAttachmentKind;
  onDownload?: () => void;
  /** Display-only mode when attachment metadata is incomplete (legacy mock data). */
  displayOnly?: boolean;
};

const ChatFileAttachmentCard: FunctionComponent<ChatFileAttachmentCardProps> = ({
  filename,
  sizeBytes,
  kind,
  onDownload,
  displayOnly = false,
}) => {
  const { t } = useTranslation();
  const presentation = getChatFilePresentation(filename, kind);
  const Icon = presentation.icon;
  const canDownload = !displayOnly && Boolean(onDownload);

  const handleActivate = () => {
    if (canDownload) onDownload?.();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!canDownload) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDownload?.();
    }
  };

  return (
    <article
      className={`chat-file-att-card chat-file-att-card--${presentation.accent}${canDownload ? ' chat-file-att-card--interactive' : ''}`}
      onClick={canDownload ? handleActivate : undefined}
      onKeyDown={canDownload ? handleKeyDown : undefined}
      role={canDownload ? 'button' : undefined}
      tabIndex={canDownload ? 0 : undefined}
    >
      <div className="chat-file-att-card__header">
        <div className={`chat-file-att-card__icon chat-file-att-card__icon--${presentation.accent}`}>
          <Icon className="size-[1.125rem]" strokeWidth={1.85} aria-hidden />
        </div>
        <div className="chat-file-att-card__meta">
          <span className="chat-file-att-card__type">
            {t(presentation.typeLabelKey, { defaultValue: presentation.typeLabelDefault })}
          </span>
          <span className="chat-file-att-card__name" title={filename}>
            {filename}
          </span>
          {sizeBytes != null && sizeBytes > 0 ? (
            <span className="chat-file-att-card__size">{formatChatFileSize(sizeBytes)}</span>
          ) : null}
        </div>
      </div>

      {canDownload ? (
        <div className="chat-file-att-card__footer">
          <span className="chat-file-att-card__action">
            <Download className="size-3.5" strokeWidth={2.25} aria-hidden />
            {t('shared.chat.attachments.downloadAction', { defaultValue: 'Download' })}
          </span>
        </div>
      ) : null}
    </article>
  );
};

export default ChatFileAttachmentCard;
