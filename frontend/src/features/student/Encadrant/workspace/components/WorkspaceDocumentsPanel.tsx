import { FunctionComponent, useMemo, useState } from 'react';
import { Download, Eye, EyeOff, FileDown, FileText, Grid, List, MessageSquareText, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminPagination from '../../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../../admin/shared/hooks/useAdminPagination';
import {
  WorkspaceDocumentPreviewModal,
  type WorkspaceDocument,
} from '../../../../shared/workspace-documents';
import { WORKSPACE_DOCUMENTS_PAGE_SIZE } from '../constants/workspaceLayout';
import type { UseWorkspaceDocumentsResult } from '../hooks/useWorkspaceDocuments';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import {
  isWorkspaceSearchActive,
  matchesWorkspaceSearch,
} from '../utils/workspaceSearch';
import {
  formatWorkspaceDocumentDate,
  openWorkspaceDocumentFile,
} from '../utils/workspaceDocumentDisplay';
import { resolveWorkspaceFileKind } from '../utils/workspaceFileType';
import WorkspaceFileTypeIcon from './WorkspaceFileTypeIcon';

interface WorkspaceDocumentsPanelProps {
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
  search: string;
  documentsState: UseWorkspaceDocumentsResult;
}

const WorkspaceDocumentsPanel: FunctionComponent<WorkspaceDocumentsPanelProps> = ({
  view,
  onViewChange,
  search,
  documentsState,
}) => {
  const { t } = useTranslation();
  const { documents, loading, error, uploading, uploadFiles } = documentsState;
  const [previewDocument, setPreviewDocument] = useState<WorkspaceDocument | null>(null);
  const isSearching = isWorkspaceSearchActive(search);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        matchesWorkspaceSearch(search, [
          doc.name,
          doc.uploadedBy.name,
          t(`student.encadrant.workspace.platform.documents.categories.${doc.category}`),
          doc.sizeLabel,
          doc.version,
          doc.review?.comment,
          doc.review?.grade,
        ]),
      ),
    [documents, search, t],
  );

  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } =
    useAdminPagination(filteredDocuments, WORKSPACE_DOCUMENTS_PAGE_SIZE);

  return (
    <div className="student-workspace-documents">
      <div className="student-workspace-documents__header">
        <div className="student-workspace-documents__title-wrap">
          <div className="student-workspace-documents__title-row">
            <span className="student-workspace-documents__title-icon" aria-hidden>
              <FileText className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h3 className="student-workspace-documents__title">
                {t('student.encadrant.workspace.platform.documents.sectionTitle')}
              </h3>
              <p className="student-workspace-documents__subtitle">
                {t('student.encadrant.workspace.platform.documents.sectionSubtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="student-workspace-documents__controls">
          <label className="student-workspace-documents__btn-import">
            <input
              type="file"
              className="sr-only"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.md,.txt"
              disabled={uploading}
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) void uploadFiles(files);
                event.target.value = '';
              }}
            />
            <FileDown className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              {uploading
                ? t('student.encadrant.workspace.platform.documents.importing')
                : t('student.encadrant.workspace.platform.documents.import')}
            </span>
          </label>
          <div
            className="student-workspace-documents__view-toggle"
            role="group"
            aria-label={t('student.encadrant.workspace.platform.documents.viewToggle')}
          >
            <button
              type="button"
              className={`student-workspace-documents__view-btn ${view === 'grid' ? 'is-active' : ''}`}
              onClick={() => onViewChange('grid')}
              aria-pressed={view === 'grid'}
              aria-label={t('student.encadrant.workspace.platform.documents.gridView')}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`student-workspace-documents__view-btn ${view === 'list' ? 'is-active' : ''}`}
              onClick={() => onViewChange('list')}
              aria-pressed={view === 'list'}
              aria-label={t('student.encadrant.workspace.platform.documents.listView')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="student-workspace-documents__error" role="alert">
          {t('student.encadrant.workspace.platform.documents.errors.load')}
        </p>
      ) : null}

      {loading ? (
        <p className="student-workspace-documents__status">
          {t('student.encadrant.workspace.platform.loading', { defaultValue: 'Chargement…' })}
        </p>
      ) : totalItems === 0 ? (
        <StudentSearchEmptyState
          titleKey={
            isSearching
              ? undefined
              : 'student.encadrant.workspace.platform.empty.documentsTitle'
          }
          descriptionKey={
            isSearching
              ? undefined
              : 'student.encadrant.workspace.platform.empty.documentsDesc'
          }
          variant="inline"
          className="student-workspace-hub-empty"
        />
      ) : (
        <>
          <div
            className={
              view === 'grid'
                ? 'student-workspace-documents__grid'
                : 'student-workspace-documents__list'
            }
          >
            {paginatedItems.map((doc) => {
              const fileKind = resolveWorkspaceFileKind(doc.name);
              const viewed = doc.viewedByEncadrant;
              const review = doc.review;

              return (
                <article
                  key={doc.id}
                  className={`student-workspace-doc-card student-workspace-doc-card--${doc.category} ${view === 'list' ? 'student-workspace-doc-card--list' : ''}`}
                >
                  <div className="student-workspace-doc-card__main">
                    <div className="student-workspace-doc-card__head">
                      <span
                        className={`student-workspace-doc-card__icon-wrap student-workspace-doc-card__icon-wrap--${fileKind}`}
                      >
                        <WorkspaceFileTypeIcon
                          kind={fileKind}
                          className="student-workspace-doc-card__file-icon"
                        />
                      </span>
                      <div className="student-workspace-doc-card__head-badges">
                        <span
                          className={`student-workspace-doc-card__seen ${viewed ? 'is-seen' : 'is-unseen'}`}
                          title={
                            viewed
                              ? t('student.encadrant.workspace.platform.documents.seen', {
                                  date: formatWorkspaceDocumentDate(doc.viewedByEncadrantAt),
                                })
                              : t('student.encadrant.workspace.platform.documents.unseen')
                          }
                          aria-label={
                            viewed
                              ? t('student.encadrant.workspace.platform.documents.seen', {
                                  date: formatWorkspaceDocumentDate(doc.viewedByEncadrantAt),
                                })
                              : t('student.encadrant.workspace.platform.documents.unseen')
                          }
                        >
                          {viewed ? (
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </span>
                        <span
                          className={`student-workspace-doc-card__category student-workspace-doc-card__category--${doc.category}`}
                        >
                          {t(
                            `student.encadrant.workspace.platform.documents.categories.${doc.category}`,
                          )}
                        </span>
                      </div>
                    </div>
                    <h3 className="student-workspace-doc-card__title">{doc.name}</h3>
                    <p className="student-workspace-doc-card__meta">
                      <span>{doc.uploadedBy.name}</span>
                      <span className="student-workspace-doc-card__dot" aria-hidden>
                        ·
                      </span>
                      <span>{formatWorkspaceDocumentDate(doc.uploadedAt)}</span>
                      <span className="student-workspace-doc-card__dot" aria-hidden>
                        ·
                      </span>
                      <span>{doc.sizeLabel}</span>
                      <span className="student-workspace-doc-card__dot" aria-hidden>
                        ·
                      </span>
                      <span className="student-workspace-doc-card__version">{doc.version}</span>
                    </p>

                    {review?.grade ? (
                      <div className="student-workspace-doc-card__stats">
                        <span className="student-workspace-doc-card__grade">
                          <Star className="h-3.5 w-3.5" aria-hidden />
                          <span>
                            {t('student.encadrant.workspace.platform.documents.grade', {
                              grade: review.grade,
                            })}
                          </span>
                        </span>
                      </div>
                    ) : null}

                    {review?.comment ? (
                      <div className="student-workspace-doc-card__review">
                        <div className="student-workspace-doc-card__review-head">
                          <MessageSquareText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>
                            {t('student.encadrant.workspace.platform.documents.reviewTitle')}
                          </span>
                          <span
                            className={`student-workspace-doc-card__review-status student-workspace-doc-card__review-status--${review.status}`}
                          >
                            {t(
                              `student.encadrant.workspace.platform.feedback.status.${review.status}`,
                            )}
                          </span>
                        </div>
                        <p className="student-workspace-doc-card__review-text">{review.comment}</p>
                      </div>
                    ) : (
                      <p className="student-workspace-doc-card__review-empty">
                        {t('student.encadrant.workspace.platform.documents.noReview')}
                      </p>
                    )}
                  </div>
                  <div className="student-workspace-doc-card__actions">
                    <button
                      type="button"
                      className="student-workspace-doc-card__btn"
                      onClick={() => setPreviewDocument(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      <span>
                        {t('student.encadrant.workspace.platform.documents.actions.preview')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="student-workspace-doc-card__btn"
                      onClick={() => openWorkspaceDocumentFile(doc.fileUrl, doc.name)}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      <span>
                        {t('student.encadrant.workspace.platform.documents.actions.download')}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('student.encadrant.workspace.platform.documents.paginationItems')}
          />
        </>
      )}

      <WorkspaceDocumentPreviewModal
        workspaceDocument={previewDocument}
        onClose={() => setPreviewDocument(null)}
        onDownload={(doc) => openWorkspaceDocumentFile(doc.fileUrl, doc.name)}
        labels={{
          title: t('student.encadrant.workspace.platform.documents.preview.title'),
          loading: t('student.encadrant.workspace.platform.documents.preview.loading'),
          error: t('student.encadrant.workspace.platform.documents.preview.error'),
          unsupported: t('student.encadrant.workspace.platform.documents.preview.unsupported'),
          close: t('student.encadrant.workspace.platform.documents.preview.close'),
          download: t('student.encadrant.workspace.platform.documents.actions.download'),
        }}
      />
    </div>
  );
};

export default WorkspaceDocumentsPanel;
