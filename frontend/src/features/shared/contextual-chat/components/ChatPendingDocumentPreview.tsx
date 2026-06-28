import { FunctionComponent } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatChatFileSize } from '../utils/chatAttachmentUtils';
import { getChatFilePresentation } from '../utils/chatAttachmentPresentation';
import type { ChatAttachmentKind } from '../utils/chatAttachmentUtils';

type Props = {
  file: File;
  kind: ChatAttachmentKind;
  onRemove: () => void;
  uploadProgress?: number;
};

const ChatPendingDocumentPreview: FunctionComponent<Props> = ({
  file,
  kind,
  onRemove,
  uploadProgress,
}) => {
  const { t } = useTranslation();
  const presentation = getChatFilePresentation(file.name, kind);
  const Icon = presentation.icon;
  const showProgress = uploadProgress != null;

  return (
    <article
      className={`chat-pending-doc chat-pending-doc--${presentation.accent}`}
      aria-label={file.name}
    >
      <div className="chat-pending-doc__main">
        <div className={`chat-pending-doc__icon chat-pending-doc__icon--${presentation.accent}`}>
          <Icon className="size-[1.25rem]" strokeWidth={1.85} aria-hidden />
        </div>
        <div className="chat-pending-doc__body">
          <p className="chat-pending-doc__type">
            {t(presentation.typeLabelKey, { defaultValue: presentation.typeLabelDefault })}
          </p>
          <p className="chat-pending-doc__name" title={file.name}>
            {file.name}
          </p>
          <p className="chat-pending-doc__size">{formatChatFileSize(file.size)}</p>
        </div>
        <button
          type="button"
          className="chat-pending-doc__remove"
          onClick={onRemove}
          aria-label={t('shared.chat.attachments.remove', {
            name: file.name,
            defaultValue: 'Remove {{name}}',
          })}
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      {showProgress ? (
        <div
          className="chat-pending-doc__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={uploadProgress}
        >
          <span
            className="chat-pending-doc__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
          />
        </div>
      ) : null}
    </article>
  );
};

export default ChatPendingDocumentPreview;
