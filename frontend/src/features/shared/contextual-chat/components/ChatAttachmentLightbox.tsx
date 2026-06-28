import { FunctionComponent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchChatAttachmentBlob } from '../api/chatAttachmentApi';

type Props = {
  attachmentId?: number;
  previewSrc?: string;
  onClose: () => void;
};

const ChatAttachmentLightbox: FunctionComponent<Props> = ({
  attachmentId,
  previewSrc,
  onClose,
}) => {
  const [src, setSrc] = useState<string | null>(previewSrc ?? null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (previewSrc) {
      setSrc(previewSrc);
      return;
    }
    if (attachmentId == null || attachmentId < 0) return;

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
  }, [attachmentId, previewSrc]);

  return (
    <div
      className="chat-att-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <button type="button" className="chat-att-lightbox__close" onClick={onClose} aria-label="Close">
        <X className="size-5" />
      </button>
      {src ? (
        <img
          src={src}
          alt=""
          className="chat-att-lightbox__img"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
    </div>
  );
};

export default ChatAttachmentLightbox;
