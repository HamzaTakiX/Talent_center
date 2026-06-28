import { FunctionComponent } from 'react';
import { classifyChatAttachment } from '../utils/chatAttachmentUtils';
import ChatPendingImagePreview from './ChatPendingImagePreview';
import ChatPendingVideoPreview from './ChatPendingVideoPreview';
import ChatPendingDocumentPreview from './ChatPendingDocumentPreview';

export type ChatPendingAttachmentCardProps = {
  file: File;
  onRemove: () => void;
  /** 0–100; omit to hide the progress track (future upload wiring). */
  uploadProgress?: number;
};

const ChatPendingAttachmentCard: FunctionComponent<ChatPendingAttachmentCardProps> = ({
  file,
  onRemove,
  uploadProgress,
}) => {
  const kind = classifyChatAttachment(file.name, file.type);

  if (kind === 'image') {
    return (
      <ChatPendingImagePreview
        file={file}
        onRemove={onRemove}
        uploadProgress={uploadProgress}
      />
    );
  }

  if (kind === 'video') {
    return (
      <ChatPendingVideoPreview
        file={file}
        onRemove={onRemove}
        uploadProgress={uploadProgress}
      />
    );
  }

  return (
    <ChatPendingDocumentPreview
      file={file}
      kind={kind}
      onRemove={onRemove}
      uploadProgress={uploadProgress}
    />
  );
};

export default ChatPendingAttachmentCard;
