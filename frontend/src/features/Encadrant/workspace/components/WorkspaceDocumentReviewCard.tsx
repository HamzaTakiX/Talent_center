import { FunctionComponent, useState } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceDocument } from '../../../shared/workspace-documents';
import {
  formatWorkspaceDocumentDate,
  openWorkspaceDocumentFile,
} from '../../../shared/workspace-documents';
import {
  WORKSPACE_DETAIL_DOWNLOAD_BTN,
  WORKSPACE_DETAIL_FILE_CARD,
  WORKSPACE_DETAIL_FILE_MAIN,
  WORKSPACE_DETAIL_FILE_META,
  WORKSPACE_DETAIL_FILE_NAME,
  WORKSPACE_DETAIL_FILE_UPLOADER,
} from '../constants/workspaceDetailLayout';

interface WorkspaceDocumentReviewCardProps {
  document: WorkspaceDocument;
  saving?: boolean;
  onSaveReview: (documentId: number, comment: string, grade: string) => Promise<void>;
  onOpen: (document: WorkspaceDocument, download?: boolean) => void;
}

const WorkspaceDocumentReviewCard: FunctionComponent<WorkspaceDocumentReviewCardProps> = ({
  document,
  saving = false,
  onSaveReview,
  onOpen,
}) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState(document.review?.comment ?? '');
  const [grade, setGrade] = useState(document.review?.grade ?? '');

  return (
    <article className={`${WORKSPACE_DETAIL_FILE_CARD} flex-col items-stretch`}>
      <div className="flex w-full min-w-0 items-start gap-3">
        <div className={WORKSPACE_DETAIL_FILE_MAIN}>
          <h3 className={WORKSPACE_DETAIL_FILE_NAME}>{document.name}</h3>
          <p className={WORKSPACE_DETAIL_FILE_META}>
            {document.sizeLabel} · {document.version}
          </p>
          <p className={WORKSPACE_DETAIL_FILE_UPLOADER}>
            {document.uploadedBy.name} · {formatWorkspaceDocumentDate(document.uploadedAt)}
          </p>
          <p
            className={`m-0 mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
              document.viewedByEncadrant ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-muted)]'
            }`}
          >
            {document.viewedByEncadrant ? (
              <Eye className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
            )}
            {document.viewedByEncadrant
              ? t('encadrant.workspace.documents.seen', {
                  date: formatWorkspaceDocumentDate(document.viewedByEncadrantAt),
                })
              : t('encadrant.workspace.documents.unseen')}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            className={WORKSPACE_DETAIL_DOWNLOAD_BTN}
            aria-label={t('encadrant.workspace.documents.previewNamed', { name: document.name })}
            onClick={() => onOpen(document)}
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className={WORKSPACE_DETAIL_DOWNLOAD_BTN}
            aria-label={t('encadrant.common.downloadNamed', { name: document.name })}
            onClick={() => onOpen(document, true)}
          >
            <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <form
        className="mt-3 flex w-full min-w-0 flex-col gap-2 border-t border-solid border-[var(--admin-border)] pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          void onSaveReview(document.id, comment, grade);
        }}
      >
        <label className="m-0 text-xs font-semibold text-[var(--admin-text)]">
          {t('encadrant.workspace.documents.feedbackLabel')}
          <textarea
            className="mt-1 min-h-[4.5rem] w-full resize-y rounded-[8px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t('encadrant.workspace.documents.feedbackPlaceholder')}
          />
        </label>
        <label className="m-0 text-xs font-semibold text-[var(--admin-text)]">
          {t('encadrant.workspace.documents.gradeLabel')}
          <input
            type="text"
            className="mt-1 w-full rounded-[8px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            placeholder={t('encadrant.workspace.documents.gradePlaceholder')}
            maxLength={32}
          />
        </label>
        <button
          type="submit"
          disabled={saving || (!comment.trim() && !grade.trim())}
          className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[var(--admin-brand)] px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving
            ? t('encadrant.workspace.documents.saving')
            : t('encadrant.workspace.documents.saveReview')}
        </button>
      </form>
    </article>
  );
};

export default WorkspaceDocumentReviewCard;
