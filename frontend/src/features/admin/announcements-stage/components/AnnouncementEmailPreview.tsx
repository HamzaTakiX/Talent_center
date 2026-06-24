import { FunctionComponent, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Expand, FileText, ImageIcon, Link2, Mail, MailX, RefreshCw } from 'lucide-react';
import { adminAnnouncementsApi } from '../../api/announcements';
import AdminButton from '../../ui/AdminButton';
import AdminModal from '../../ui/AdminModal';
import { formatFileSize } from '../utils/announcementDetailViewModel';
import AnnouncementDetailSectionEmpty from './AnnouncementDetailSectionEmpty';
const PREFIX = 'admin.announcementsModule.detail.emailPreview';

const SAMPLE_STUDENT = {
  name: 'Amina Benali',
  email: 'amina.benali@etu.emsi.ma',
};

export interface AnnouncementEmailPreviewData {
  subject: string;
  body_html: string;
  body_text: string;
  action_url: string;
  sender_name: string;
  sender_email: string;
  template_code: string;
  language: string;
  has_rich_content: boolean;
  cover_image_url: string | null;
  attachments: {
    id: number;
    label: string;
    originalFilename?: string;
    fileUrl: string | null;
    externalUrl: string | null;
    mimeType: string;
    fileSizeBytes: number;
    kind?: string;
  }[];
}

type EmailPreviewAttachment = AnnouncementEmailPreviewData['attachments'][number];

function attachmentHref(att: EmailPreviewAttachment): string | null {
  return att.fileUrl ?? att.externalUrl ?? null;
}

function attachmentDisplayName(att: EmailPreviewAttachment): string {
  return att.label || att.originalFilename || 'file';
}

function attachmentIsExternal(att: EmailPreviewAttachment): boolean {
  return att.kind === 'EXTERNAL_LINK' || Boolean(!att.fileUrl && att.externalUrl);
}

function attachmentIsImage(att: EmailPreviewAttachment): boolean {
  return Boolean(att.mimeType?.startsWith('image/') && att.fileUrl);
}

function attachmentTypeBadge(att: EmailPreviewAttachment): { letter: string; tone: 'word' | 'pdf' | 'image' | 'link' | 'file' } {
  if (attachmentIsExternal(att)) return { letter: 'URL', tone: 'link' };
  const name = attachmentDisplayName(att).toLowerCase();
  const mime = (att.mimeType || '').toLowerCase();
  if (attachmentIsImage(att) || mime.startsWith('image/')) return { letter: 'IMG', tone: 'image' };
  if (mime.includes('pdf') || name.endsWith('.pdf')) return { letter: 'PDF', tone: 'pdf' };
  if (
    mime.includes('word')
    || mime.includes('document')
    || name.endsWith('.doc')
    || name.endsWith('.docx')
  ) {
    return { letter: 'W', tone: 'word' };
  }
  return { letter: 'FILE', tone: 'file' };
}

interface EmailPreviewAttachmentsProps {
  attachments: EmailPreviewAttachment[];
  countLabel: string;
  scannedLabel: string;
}

const EmailPreviewAttachments: FunctionComponent<EmailPreviewAttachmentsProps> = ({
  attachments,
  countLabel,
  scannedLabel,
}) => {
  const visible = attachments.filter((att) => attachmentHref(att));
  if (visible.length === 0) return null;

  return (
    <div className="admin-ann-email-preview__attachments">
      <div className="admin-ann-email-preview__attachments-head">
        <p className="admin-ann-email-preview__attachments-summary">
          {countLabel}
          <span className="admin-ann-email-preview__attachments-dot" aria-hidden>
            •
          </span>
          {scannedLabel}
        </p>
        <Download className="admin-ann-email-preview__attachments-download-icon h-4 w-4" aria-hidden />
      </div>
      <div className="admin-ann-email-preview__attachments-track" role="list">
        {visible.map((att) => {
          const href = attachmentHref(att)!;
          const name = attachmentDisplayName(att);
          const badge = attachmentTypeBadge(att);
          const isExternal = attachmentIsExternal(att);
          const isImage = attachmentIsImage(att);

          return (
            <a
              key={att.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-ann-email-preview__att-card"
              role="listitem"
              title={name}
            >
              <div className="admin-ann-email-preview__att-preview">
                {isImage ? (
                  <img
                    src={att.fileUrl!}
                    alt=""
                    className="admin-ann-email-preview__att-thumb"
                  />
                ) : (
                  <div className="admin-ann-email-preview__att-doc">
                    <p className="admin-ann-email-preview__att-doc-title">{name}</p>
                    {isExternal ? (
                      <p className="admin-ann-email-preview__att-doc-url">{att.externalUrl}</p>
                    ) : att.fileSizeBytes > 0 ? (
                      <p className="admin-ann-email-preview__att-doc-meta">{formatFileSize(att.fileSizeBytes)}</p>
                    ) : null}
                  </div>
                )}
                <span className="admin-ann-email-preview__att-fold" aria-hidden />
              </div>
              <div className="admin-ann-email-preview__att-foot">
                <span className={`admin-ann-email-preview__att-badge admin-ann-email-preview__att-badge--${badge.tone}`}>
                  {badge.tone === 'link' ? (
                    <Link2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                  ) : badge.tone === 'image' ? (
                    <ImageIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
                  ) : (
                    badge.letter
                  )}
                </span>
                <span className="admin-ann-email-preview__att-name">{name}</span>
                {isExternal ? (
                  <Link2 className="admin-ann-email-preview__att-type-icon h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                ) : (
                  <FileText className="admin-ann-email-preview__att-type-icon h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

interface EmailPreviewChromeProps {
  preview: AnnouncementEmailPreviewData;
  ctaLabel: string;
  fromLabel: string;
  toLabel: string;
  subjectLabel: string;
  footerText: string;
  attachmentsCountLabel: string;
  attachmentsScannedLabel: string;
  className?: string;
}
const EmailPreviewChrome: FunctionComponent<EmailPreviewChromeProps> = ({
  preview,
  ctaLabel,
  fromLabel,
  toLabel,
  subjectLabel,
  footerText,
  attachmentsCountLabel,
  attachmentsScannedLabel,
  className = '',
}) => (  <div className={`admin-ann-email-preview__frame ${className}`.trim()}>
    <div className="admin-ann-email-preview__envelope">
      <div className="admin-ann-email-preview__meta">
        <div className="admin-ann-email-preview__meta-row">
          <span className="admin-ann-email-preview__meta-label">{fromLabel}</span>
          <span className="admin-ann-email-preview__meta-value">
            {preview.sender_name} &lt;{preview.sender_email}&gt;
          </span>
        </div>
        <div className="admin-ann-email-preview__meta-row">
          <span className="admin-ann-email-preview__meta-label">{toLabel}</span>
          <span className="admin-ann-email-preview__meta-value">
            {SAMPLE_STUDENT.name} &lt;{SAMPLE_STUDENT.email}&gt;
          </span>
        </div>
        <div className="admin-ann-email-preview__meta-row">
          <span className="admin-ann-email-preview__meta-label">{subjectLabel}</span>
          <span className="admin-ann-email-preview__meta-value admin-ann-email-preview__subject">
            {preview.subject}
          </span>
        </div>
      </div>

      <div className="admin-ann-email-preview__letter">
        <div className="admin-ann-email-preview__letter-header">
          <h3 className="admin-ann-email-preview__platform">{preview.sender_name}</h3>
        </div>
        <div
          className="admin-ann-email-preview__letter-body admin-ann-email-preview__letter-body--rich"
          dangerouslySetInnerHTML={{ __html: preview.body_html }}
        />
        {preview.action_url ? (
          <div className="admin-ann-email-preview__cta-wrap">
            <span className="admin-ann-email-preview__cta">{ctaLabel}</span>
          </div>
        ) : null}
        <EmailPreviewAttachments
          attachments={preview.attachments}
          countLabel={attachmentsCountLabel}
          scannedLabel={attachmentsScannedLabel}
        />
        <div className="admin-ann-email-preview__letter-footer">{footerText}</div>      </div>
    </div>
  </div>
);

interface Props {
  announcementId: string;
  hasContent: boolean;
  sectionHeader: ReactNode;
}

const AnnouncementEmailPreview: FunctionComponent<Props> = ({
  announcementId,
  hasContent,
  sectionHeader,
}) => {
  const { t, i18n } = useTranslation();
  const [previewLang, setPreviewLang] = useState(
    i18n.language?.startsWith('en') ? 'en' : i18n.language?.startsWith('ar') ? 'ar' : 'fr',
  );
  const [preview, setPreview] = useState<AnnouncementEmailPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminAnnouncementsApi.emailPreview(announcementId, previewLang);
      setPreview(data);
    } catch {
      setPreview(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [announcementId, previewLang]);

  useEffect(() => {
    if (!hasContent) {
      setPreview(null);
      setLoading(false);
      setError(false);
      return;
    }
    void loadPreview();
  }, [hasContent, loadPreview]);

  const showPreviewChrome = Boolean(preview?.has_rich_content && preview.body_html);

  const chromeLabels = {
    fromLabel: t(`${PREFIX}.from`),
    toLabel: t(`${PREFIX}.to`),
    subjectLabel: t(`${PREFIX}.subject`),
    ctaLabel: t(`${PREFIX}.cta`),
    footerText: t(`${PREFIX}.footer`, { platform: preview?.sender_name ?? 'Digital Talent Center' }),
    attachmentsCountLabel: t(`${PREFIX}.attachmentsCount`, {
      count: preview?.attachments?.filter((att) => attachmentHref(att)).length ?? 0,
    }),
    attachmentsScannedLabel: t(`${PREFIX}.attachmentsScanned`),
  };
  return (
    <section className="admin-ann-detail-panel admin-ann-detail-panel--email-preview">
      <div className="admin-ann-detail-email-preview__head">
        {sectionHeader}
        <div
          className={`admin-ann-detail-email-preview__toolbar${!hasContent ? ' admin-ann-detail-email-preview__toolbar--disabled' : ''}`}
        >
          <div
            className="admin-ann-detail-email-preview__langs"
            role="tablist"
            aria-label={t(`${PREFIX}.language`)}
          >
            {(['fr', 'en', 'ar'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={previewLang === lang}
                className={`admin-ann-detail-email-preview__lang${previewLang === lang ? ' is-active' : ''}`}
                onClick={() => setPreviewLang(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="admin-ann-detail-email-preview__actions">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => void loadPreview()}
              disabled={loading || !hasContent}
              aria-label={t(`${PREFIX}.refresh`)}
            >
              <RefreshCw className={`h-4 w-4${loading ? ' animate-spin' : ''}`} aria-hidden />
            </AdminButton>
            {showPreviewChrome ? (
              <AdminButton variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                <Expand className="h-4 w-4" aria-hidden />
                {t(`${PREFIX}.expand`)}
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>

      <p className="admin-ann-detail-email-preview__hint">{t(`${PREFIX}.hint`)}</p>

      {loading && hasContent ? (
        <div className="admin-ann-email-preview__skeleton admin-shimmer" aria-busy="true" />
      ) : !hasContent || (preview && !preview.has_rich_content) ? (
        <AnnouncementDetailSectionEmpty
          icon={MailX}
          title={t(`${PREFIX}.noContentTitle`)}
          subtitle={t(`${PREFIX}.noContentSubtitle`)}
          accent="#6366f1"
        />
      ) : error ? (
        <div className="admin-ann-detail-email-preview__error">
          <Mail className="h-5 w-5 shrink-0" aria-hidden />
          <p>{t(`${PREFIX}.loadError`)}</p>
          <AdminButton variant="outline" size="sm" onClick={() => void loadPreview()}>
            {t(`${PREFIX}.retry`)}
          </AdminButton>
        </div>
      ) : showPreviewChrome && preview ? (
        <EmailPreviewChrome preview={preview} {...chromeLabels} />
      ) : null}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t(`${PREFIX}.modalTitle`)}
        description={t(`${PREFIX}.modalSubtitle`)}
        maxWidthClass="max-w-3xl"
      >
        {showPreviewChrome && preview ? (
          <EmailPreviewChrome
            preview={preview}
            {...chromeLabels}
            className="admin-ann-email-preview__frame--modal"
          />
        ) : null}
      </AdminModal>
    </section>
  );
};

export default AnnouncementEmailPreview;
