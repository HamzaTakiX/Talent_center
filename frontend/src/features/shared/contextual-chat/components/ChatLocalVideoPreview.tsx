import { FunctionComponent, useCallback, useEffect, useState, type SyntheticEvent } from 'react';
import { Play } from 'lucide-react';
import { formatMediaDuration } from '../utils/formatMediaDuration';

type Props = {
  src: string;
  alt: string;
  className?: string;
  onPlay?: () => void;
};

const ChatLocalVideoPreview: FunctionComponent<Props> = ({ src, alt, className, onPlay }) => {
  const [duration, setDuration] = useState<number | null>(null);

  const onMetadata = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    if (Number.isFinite(seconds) && seconds > 0) setDuration(seconds);
  }, []);

  return (
    <button
      type="button"
      className={`chat-att-video-btn ${className ?? ''}`}
      onClick={onPlay}
      aria-label={alt}
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

export default ChatLocalVideoPreview;
