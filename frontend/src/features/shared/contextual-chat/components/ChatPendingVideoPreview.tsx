import { FunctionComponent, useCallback, useState, type SyntheticEvent } from 'react';
import { Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { formatChatFileSize } from '../utils/chatAttachmentUtils';
import { formatMediaDuration } from '../utils/formatMediaDuration';

type Props = {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
};

const ChatPendingVideoPreview: FunctionComponent<Props> = ({
  file,
  onRemove,
  uploadProgress,
}) => {
  const { t } = useTranslation();
  const previewUrl = useObjectUrl(file);
  const [duration, setDuration] = useState<number | null>(null);
  const showProgress = uploadProgress != null;

  const onMetadata = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    if (Number.isFinite(seconds) && seconds > 0) setDuration(seconds);
  }, []);

  return (
    <article className="chat-pending-media chat-pending-media--video" aria-label={file.name}>
      <div className="chat-pending-media__frame">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="chat-pending-media__img"
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={onMetadata}
            aria-hidden
          />
        ) : (
          <div className="chat-pending-media__shimmer" aria-hidden />
        )}
        <span className="chat-pending-media__play" aria-hidden>
          <Play className="size-5 fill-current" />
        </span>
        {duration != null ? (
          <span className="chat-pending-media__duration">{formatMediaDuration(duration)}</span>
        ) : (
          <span className="chat-pending-media__duration">{formatChatFileSize(file.size)}</span>
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

export default ChatPendingVideoPreview;
