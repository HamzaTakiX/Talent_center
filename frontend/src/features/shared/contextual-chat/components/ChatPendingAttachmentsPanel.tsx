import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { classifyChatAttachment } from '../utils/chatAttachmentUtils';
import ChatPendingAttachmentCard from './ChatPendingAttachmentCard';

export type ChatPendingAttachmentsPanelProps = {
  files: File[];
  onRemove: (index: number) => void;
  /** Per-file upload progress keyed by index; omit entries to hide bars. */
  uploadProgressByIndex?: Record<number, number>;
};

const ChatPendingAttachmentsPanel: FunctionComponent<ChatPendingAttachmentsPanelProps> = ({
  files,
  onRemove,
  uploadProgressByIndex,
}) => {
  const { t } = useTranslation();

  const { mediaItems, documentItems } = useMemo(() => {
    const media: { file: File; index: number }[] = [];
    const docs: { file: File; index: number }[] = [];
    files.forEach((file, index) => {
      const kind = classifyChatAttachment(file.name, file.type);
      if (kind === 'image' || kind === 'video') {
        media.push({ file, index });
      } else {
        docs.push({ file, index });
      }
    });
    return { mediaItems: media, documentItems: docs };
  }, [files]);

  if (!files.length) return null;

  return (
    <div
      className="chat-pending-att-panel"
      aria-label={t('shared.chat.attachments.pending', { defaultValue: 'Pending attachments' })}
    >
      {mediaItems.length > 0 ? (
        <div className="chat-pending-att-panel__media-strip" role="list">
          {mediaItems.map(({ file, index }) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} role="listitem">
              <ChatPendingAttachmentCard
                file={file}
                onRemove={() => onRemove(index)}
                uploadProgress={uploadProgressByIndex?.[index]}
              />
            </div>
          ))}
        </div>
      ) : null}

      {documentItems.length > 0 ? (
        <div className="chat-pending-att-panel__docs" role="list">
          {documentItems.map(({ file, index }) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} role="listitem">
              <ChatPendingAttachmentCard
                file={file}
                onRemove={() => onRemove(index)}
                uploadProgress={uploadProgressByIndex?.[index]}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ChatPendingAttachmentsPanel;
