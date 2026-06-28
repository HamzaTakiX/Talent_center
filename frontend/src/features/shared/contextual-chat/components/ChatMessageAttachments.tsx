import { FunctionComponent, useState } from 'react';
import '../styles/chat-message-attachments.css';
import type { ChatAttachmentView } from '../utils/chatAttachmentUtils';
import { downloadChatAttachment } from '../api/chatAttachmentApi';
import { isLocalChatAttachment } from '../utils/mapMessageAttachments';
import ChatAttachmentLightbox from './ChatAttachmentLightbox';
import ChatAuthenticatedImage from './ChatAuthenticatedImage';
import ChatAuthenticatedVideo from './ChatAuthenticatedVideo';
import ChatFileAttachmentCard from './ChatFileAttachmentCard';
import ChatLocalVideoPreview from './ChatLocalVideoPreview';

type Props = {
  attachments: ChatAttachmentView[];
  direction?: 'in' | 'out';
};

type LightboxState =
  | { mode: 'id'; attachmentId: number }
  | { mode: 'src'; previewSrc: string }
  | null;

const ChatMessageAttachments: FunctionComponent<Props> = ({ attachments, direction = 'in' }) => {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  if (!attachments.length) return null;

  return (
    <div className={`chat-att-list chat-att-list--${direction}`}>
      {attachments.map((att) => {
        if (att.kind === 'image') {
          const isLocal = isLocalChatAttachment(att);

          return (
            <div key={att.id} className="chat-att-card chat-att-card--image">
              {isLocal ? (
                <button
                  type="button"
                  className="chat-att-image-btn"
                  onClick={() => setLightbox({ mode: 'src', previewSrc: att.fileUrl })}
                  aria-label={att.filename}
                >
                  <img
                    src={att.fileUrl}
                    alt={att.filename}
                    className="chat-att-image-thumb"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ) : (
                <ChatAuthenticatedImage
                  attachmentId={att.id}
                  alt={att.filename}
                  className="chat-att-image-thumb"
                  onClick={() => setLightbox({ mode: 'id', attachmentId: att.id })}
                />
              )}
            </div>
          );
        }

        if (att.kind === 'video') {
          const isLocal = isLocalChatAttachment(att);

          return (
            <div key={att.id} className="chat-att-card chat-att-card--video">
              {isLocal ? (
                <ChatLocalVideoPreview
                  src={att.fileUrl}
                  alt={att.filename}
                  className="chat-att-video-preview"
                  onPlay={() => {
                    const anchor = document.createElement('a');
                    anchor.href = att.fileUrl;
                    anchor.download = att.filename;
                    anchor.click();
                  }}
                />
              ) : (
                <ChatAuthenticatedVideo
                  attachmentId={att.id}
                  className="chat-att-video-preview"
                  onPlay={() => void downloadChatAttachment(att.id, att.filename)}
                />
              )}
            </div>
          );
        }

        return (
          <ChatFileAttachmentCard
            key={att.id}
            filename={att.filename}
            sizeBytes={att.sizeBytes}
            kind={att.kind}
            onDownload={
              isLocalChatAttachment(att)
                ? () => {
                    const anchor = document.createElement('a');
                    anchor.href = att.fileUrl;
                    anchor.download = att.filename;
                    anchor.click();
                  }
                : () => void downloadChatAttachment(att.id, att.filename)
            }
          />
        );
      })}

      {lightbox != null ? (
        <ChatAttachmentLightbox
          attachmentId={lightbox.mode === 'id' ? lightbox.attachmentId : undefined}
          previewSrc={lightbox.mode === 'src' ? lightbox.previewSrc : undefined}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
};

export default ChatMessageAttachments;
