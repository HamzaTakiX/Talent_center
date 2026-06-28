import { FunctionComponent, useCallback, useEffect, useState, type SyntheticEvent } from 'react';
import { Play } from 'lucide-react';
import { fetchChatAttachmentBlob } from '../api/chatAttachmentApi';
import { formatMediaDuration } from '../utils/formatMediaDuration';

type Props = {
  attachmentId: number;
  className?: string;
  onPlay?: () => void;
};

const ChatAuthenticatedVideo: FunctionComponent<Props> = ({
  attachmentId,
  className,
  onPlay,
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void fetchChatAttachmentBlob(attachmentId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setDuration(null);
    };
  }, [attachmentId]);

  const onMetadata = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    if (Number.isFinite(seconds) && seconds > 0) setDuration(seconds);
  }, []);

  if (!src) {
    return <div className={`chat-att-video-placeholder ${className ?? ''}`} aria-hidden />;
  }

  return (
    <button
      type="button"
      className={`chat-att-video-btn ${className ?? ''}`}
      onClick={onPlay}
      aria-label="Play video"
    >
      <video
        src={src}
        className="chat-att-video-frame"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={onMetadata}
        aria-hidden
      />
      <span className="chat-att-video-play" aria-hidden>
        <Play className="size-6 fill-current" />
      </span>
      {duration != null ? (
        <span className="chat-att-video-duration">{formatMediaDuration(duration)}</span>
      ) : null}
    </button>
  );
};

export default ChatAuthenticatedVideo;
