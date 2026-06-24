import {
  FunctionComponent,
  useEffect,
  useState,
  type MouseEvent,
} from 'react';
import { Download, FileText, ImageIcon } from 'lucide-react';
import {
  attachmentDisplayName,
  attachmentPreviewKind,
  attachmentTypeBadge,
  TEXT_PREVIEW_MAX_CHARS,
  toProxiedMediaUrl,
  type AttachmentPreviewKind,
} from '../utils/announcementAttachmentUtils';
import { formatFileSize, type AnnouncementAttachmentView } from '../utils/announcementDetailViewModel';

interface Props {
  attachment: AnnouncementAttachmentView;
  downloadLabel: string;
  previewTruncatedLabel: string;
  previewLoadingLabel: string;
  previewUnavailableLabel: string;
  onDownloadClick?: (
    event: MouseEvent<HTMLAnchorElement>,
    payload: { url: string; label: string; source: 'attachment' },
  ) => void;
}

function useTextPreviewSnippet(fileUrl: string | null, enabled: boolean) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !fileUrl) {
      setSnippet(null);
      setLoading(false);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setSnippet(null);

    const src = toProxiedMediaUrl(fileUrl);

    void fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error('fetch failed');
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        const normalized = text.replace(/\s+/g, ' ').trim();
        const clipped =
          normalized.length > TEXT_PREVIEW_MAX_CHARS
            ? `${normalized.slice(0, TEXT_PREVIEW_MAX_CHARS)}…`
            : normalized;
        setSnippet(clipped || null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, fileUrl]);

  return { snippet, loading, failed };
}

interface PreviewPaneProps {
  attachment: AnnouncementAttachmentView;
  kind: AttachmentPreviewKind;
  previewLoadingLabel: string;
  previewUnavailableLabel: string;
}

const AttachmentPreviewPane: FunctionComponent<PreviewPaneProps> = ({
  attachment,
  kind,
  previewLoadingLabel,
  previewUnavailableLabel,
}) => {
  const fileUrl = attachment.fileUrl;
  const name = attachmentDisplayName(attachment);
  const proxiedUrl = fileUrl ? toProxiedMediaUrl(fileUrl) : null;
  const textPreview = useTextPreviewSnippet(fileUrl, kind === 'text');

  if (!proxiedUrl) {
    return (
      <div className="admin-ann-detail-att-preview__placeholder">
        <FileText className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        <p>{previewUnavailableLabel}</p>
      </div>
    );
  }

  if (kind === 'image') {
    return (
      <img
        src={proxiedUrl}
        alt=""
        className="admin-ann-detail-att-preview__image"
        loading="lazy"
      />
    );
  }

  if (kind === 'pdf') {
    return (
      <iframe
        src={`${proxiedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={name}
        className="admin-ann-detail-att-preview__pdf"
        tabIndex={-1}
      />
    );
  }

  if (kind === 'text') {
    if (textPreview.loading) {
      return (
        <div className="admin-ann-detail-att-preview__placeholder admin-ann-detail-att-preview__placeholder--loading">
          <span className="admin-shimmer admin-ann-detail-att-preview__shimmer" aria-hidden />
          <p>{previewLoadingLabel}</p>
        </div>
      );
    }
    if (textPreview.snippet) {
      return <pre className="admin-ann-detail-att-preview__text">{textPreview.snippet}</pre>;
    }
    return (
      <div className="admin-ann-detail-att-preview__doc">
        <FileText className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        <p className="admin-ann-detail-att-preview__doc-title">{name}</p>
        <p className="admin-ann-detail-att-preview__doc-meta">
          {textPreview.failed ? previewUnavailableLabel : formatFileSize(attachment.fileSizeBytes)}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-ann-detail-att-preview__doc">
      <FileText className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      <p className="admin-ann-detail-att-preview__doc-title">{name}</p>
      {attachment.fileSizeBytes > 0 ? (
        <p className="admin-ann-detail-att-preview__doc-meta">{formatFileSize(attachment.fileSizeBytes)}</p>
      ) : null}
    </div>
  );
};

const AnnouncementAttachmentPreviewCard: FunctionComponent<Props> = ({
  attachment,
  downloadLabel,
  previewTruncatedLabel,
  previewLoadingLabel,
  previewUnavailableLabel,
  onDownloadClick,
}) => {
  const href = attachment.fileUrl || attachment.externalUrl;
  const name = attachmentDisplayName(attachment);
  const kind = attachmentPreviewKind(attachment);
  const badge = attachmentTypeBadge(attachment);

  if (!href) return null;

  return (
    <article className="admin-ann-detail-att-card">
      <div className="admin-ann-detail-att-preview" aria-hidden>
        <AttachmentPreviewPane
          attachment={attachment}
          kind={kind}
          previewLoadingLabel={previewLoadingLabel}
          previewUnavailableLabel={previewUnavailableLabel}
        />
        <span className="admin-ann-detail-att-preview__fade" aria-hidden />
        <p className="admin-ann-detail-att-preview__hint">{previewTruncatedLabel}</p>
      </div>

      <div className="admin-ann-detail-att-card__foot">
        <span className={`admin-ann-detail-att-card__badge admin-ann-detail-att-card__badge--${badge.tone}`}>
          {badge.tone === 'image' ? (
            <ImageIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
          ) : (
            badge.letter
          )}
        </span>
        <div className="admin-ann-detail-att-card__info">
          <p className="admin-ann-detail-att-card__name" title={name}>
            {name}
          </p>
          <p className="admin-ann-detail-att-card__meta">
            {formatFileSize(attachment.fileSizeBytes)}
            {attachment.mimeType ? ` · ${attachment.mimeType}` : ''}
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-ann-detail-att-card__download"
          aria-label={downloadLabel}
          onClick={(event) =>
            onDownloadClick?.(event, {
              url: href,
              label: name,
              source: 'attachment',
            })
          }
        >
          <Download className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </article>
  );
};

export default AnnouncementAttachmentPreviewCard;
