import { FunctionComponent, useEffect, useState } from 'react';
import { fetchChatAttachmentBlob } from '../api/chatAttachmentApi';

type Props = {
  attachmentId: number;
  alt: string;
  className?: string;
  onClick?: () => void;
};

const ChatAuthenticatedImage: FunctionComponent<Props> = ({
  attachmentId,
  alt,
  className,
  onClick,
}) => {
  const [src, setSrc] = useState<string | null>(null);

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
    };
  }, [attachmentId]);

  if (!src) {
    return <div className={`chat-att-image-placeholder ${className ?? ''}`} aria-hidden />;
  }

  if (onClick) {
    return (
      <button type="button" className="chat-att-image-btn" onClick={onClick} aria-label={alt}>
        <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
      </button>
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
};

export default ChatAuthenticatedImage;
