import { FunctionComponent } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { formatChatFileSize } from '../utils/chatAttachmentUtils';

type Props = {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
};

const ChatPendingImagePreview: FunctionComponent<Props> = ({
  file,
  onRemove,
  uploadProgress,
}) => {
  const { t } = useTranslation();
  const previewUrl = useObjectUrl(file);
  const showProgress = uploadProgress != null;

  return (
    <article className="chat-pending-media chat-pending-media--image" aria-label={file.name}>
      <div className="chat-pending-media__frame">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="chat-pending-media__img" />
        ) : (
          <div className="chat-pending-media__shimmer" aria-hidden />
        )}
        <button
          type="button"
          className="chat-pending-media__remove"
          onClick={onRemove}
          aria-label={t('shared.chat.attachments.remove', {
            name: file.name,
            defaultValue: 'Remove {{name}}',
          })}
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
        <span className="chat-pending-media__size-badge">{formatChatFileSize(file.size)}</span>
      </div>
      {showProgress ? (
        <div
          className="chat-pending-media__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={uploadProgress}
        >
          <span
            className="chat-pending-media__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
          />
        </div>
      ) : null}
    </article>
  );
};

export default ChatPendingImagePreview;
