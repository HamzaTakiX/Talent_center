import { FunctionComponent } from 'react';
import { Download, FileText, Image as ImageIcon, Paperclip } from 'lucide-react';
import type { AnnouncementAttachmentView } from '../../utils/announcementDetailViewModel';
import { formatFileSize } from '../../utils/announcementDetailViewModel';

type Props = {
  attachments: AnnouncementAttachmentView[];
  loading?: boolean;
  title?: string;
  emptyLabel?: string;
  listAriaLabel?: string;
};

function attachmentIcon(attachment: AnnouncementAttachmentView) {
  if (attachment.mimeType.startsWith('image/')) return ImageIcon;
  return FileText;
}

const AnnouncementInspectorAttachments: FunctionComponent<Props> = ({
  attachments,
  loading = false,
  title = 'Pièces jointes',
  emptyLabel = 'Aucune pièce jointe',
  listAriaLabel = "Pièces jointes de l'annonce",
}) => (
  <>
    <div className="isi-inspector-section-title">{title}</div>
    {loading ? (
      <div className="isi-inspector-attachments" aria-busy="true" aria-live="polite">
        <div className="isi-inspector-attachment isi-inspector-attachment--skeleton">
          <div className="admin-shimmer h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="admin-shimmer h-3.5 w-[70%] rounded-md" />
            <div className="admin-shimmer h-2.5 w-[40%] rounded-md" />
          </div>
        </div>
      </div>
    ) : attachments.length === 0 ? (
      <p className="isi-inspector-attachments-empty">{emptyLabel}</p>
    ) : (
      <ul className="isi-inspector-attachments" aria-label={listAriaLabel}>
        {attachments.map((attachment) => {
          const Icon = attachmentIcon(attachment);
          const href = attachment.fileUrl || attachment.externalUrl;
          const name = attachment.label || attachment.originalFilename || 'Fichier';

          return (
            <li key={attachment.id} className="isi-inspector-attachment">
              <div className="isi-inspector-attachment__icon" aria-hidden>
                <Icon className="size-4" strokeWidth={2} />
              </div>
              <div className="isi-inspector-attachment__body">
                <p className="isi-inspector-attachment__name">{name}</p>
                <p className="isi-inspector-attachment__meta">
                  {attachment.fileSizeBytes > 0 ? formatFileSize(attachment.fileSizeBytes) : null}
                  {attachment.fileSizeBytes > 0 && attachment.mimeType ? ' · ' : null}
                  {attachment.mimeType || null}
                </p>
              </div>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="isi-inspector-attachment__action"
                  aria-label={`Télécharger ${name}`}
                >
                  <Download className="size-4" strokeWidth={2} />
                </a>
              ) : (
                <span className="isi-inspector-attachment__action isi-inspector-attachment__action--muted" aria-hidden>
                  <Paperclip className="size-4" strokeWidth={2} />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </>
);

export default AnnouncementInspectorAttachments;
