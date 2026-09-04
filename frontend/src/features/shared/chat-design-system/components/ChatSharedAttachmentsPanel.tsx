import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileArchive, FileSpreadsheet, FileText, Image, Paperclip, Presentation, Video, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatAuthenticatedImage from '../../contextual-chat/components/ChatAuthenticatedImage';
import { downloadChatAttachment } from '../../contextual-chat/api/chatAttachmentApi';
import { isLocalChatAttachment } from '../../contextual-chat/utils/mapMessageAttachments';
import type { ChatAttachmentKind } from '../../contextual-chat/utils/chatAttachmentUtils';
import type { SharedAttachmentItem } from '../types/chatConversationToolsTypes';

type Props = {
  open: boolean;
  items: SharedAttachmentItem[];
  onClose: () => void;
};

function attachmentIcon(kind: ChatAttachmentKind) {
  if (kind === 'image') return Image;
  if (kind === 'video') return Video;
  if (kind === 'archive') return FileArchive;
  if (kind === 'document') {
    return FileText;
  }
  return FileText;
}

function refinedDocIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['xls', 'xlsx'].includes(ext)) return FileSpreadsheet;
  if (['ppt', 'pptx'].includes(ext)) return Presentation;
  if (ext === 'pdf') return FileText;
  return null;
}

const ChatSharedAttachmentsPanel: FunctionComponent<Props> = ({ open, items, onClose }) => {
  const { t } = useTranslation();

  const handleDownload = (item: SharedAttachmentItem) => {
    const { attachment } = item;
    if (isLocalChatAttachment(attachment)) {
      const anchor = document.createElement('a');
      anchor.href = attachment.fileUrl;
      anchor.download = attachment.filename;
      anchor.click();
      return;
    }
    void downloadChatAttachment(attachment.id, attachment.filename);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="chat-conversation-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label={t('admin.chat.closePanel')}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('admin.chat.sharedAttachments')}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="chat-conversation-panel chat-conversation-panel--attachments"
          >
            <header className="chat-conversation-panel__header">
              <div className="chat-conversation-panel__header-copy">
                <h3 className="chat-conversation-panel__title">{t('admin.chat.sharedAttachments')}</h3>
                <p className="chat-conversation-panel__subtitle">
                  {items.length === 0
                    ? t('admin.chat.noAttachmentsCount', { defaultValue: 'Aucun fichier pour le moment' })
                    : t('admin.chat.attachmentsCount', {
                        count: items.length,
                        defaultValue: '{{count}} fichier(s) partagé(s)',
                      })}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="chat-conversation-panel__close"
                aria-label={t('admin.chat.closePanel')}
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </header>

            <div className="chat-conversation-panel__body">
              {items.length === 0 ? (
                <div className="chat-conversation-panel__empty">
                  <span className="chat-conversation-panel__empty-icon" aria-hidden>
                    <Paperclip className="size-5" strokeWidth={1.75} />
                  </span>
                  <p>{t('admin.chat.noAttachments')}</p>
                </div>
              ) : (
                <ul className="chat-shared-attachments-list">
                  {items.map((item) => {
                    const DocIcon = refinedDocIcon(item.attachment.filename);
                    const Icon = DocIcon ?? attachmentIcon(item.attachment.kind);
                    const isImage = item.attachment.kind === 'image';
                    const isLocal = isLocalChatAttachment(item.attachment);

                    return (
                      <li key={item.key} className="chat-shared-attachments-item">
                        <div className="chat-shared-attachments-item__thumb">
                          {isImage && item.attachment.fileUrl ? (
                            isLocal ? (
                              <img
                                src={item.attachment.fileUrl}
                                alt=""
                                className="chat-shared-attachments-item__image"
                              />
                            ) : (
                              <ChatAuthenticatedImage
                                attachmentId={item.attachment.id}
                                alt=""
                                className="chat-shared-attachments-item__image"
                              />
                            )
                          ) : (
                            <span className="chat-shared-attachments-item__icon-wrap">
                              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                            </span>
                          )}
                        </div>
                        <div className="chat-shared-attachments-item__meta">
                          <p className="chat-shared-attachments-item__name">{item.attachment.filename}</p>
                          <p className="chat-shared-attachments-item__sub">
                            {item.senderLabel}
                            <span aria-hidden> · </span>
                            {item.dateLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="chat-shared-attachments-item__download"
                          onClick={() => handleDownload(item)}
                          aria-label={t('admin.chat.downloadAttachment', {
                            name: item.attachment.filename,
                          })}
                        >
                          <Download className="size-4" strokeWidth={2} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default ChatSharedAttachmentsPanel;
