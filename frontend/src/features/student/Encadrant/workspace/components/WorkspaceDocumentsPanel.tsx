import { FunctionComponent } from 'react';
import { Download, Eye, FileDown, FileText, Grid, List, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workspaceDocuments } from '../data/workspacePlatformMock';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';

interface WorkspaceDocumentsPanelProps {
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
}

const WorkspaceDocumentsPanel: FunctionComponent<WorkspaceDocumentsPanelProps> = ({
  view,
  onViewChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="student-workspace-documents">
      <div className="student-workspace-documents__header">
        <div className="student-workspace-documents__title-wrap">
          <h3 className="student-workspace-documents__title">
            {t('student.encadrant.workspace.platform.documents.sectionTitle')}
          </h3>
          <p className="student-workspace-documents__subtitle">
            {t('student.encadrant.workspace.platform.documents.sectionSubtitle')}
          </p>
        </div>
        <div className="student-workspace-documents__controls">
          <label className="student-workspace-documents__btn-import">
            <input
              type="file"
              className="sr-only"
              multiple
              accept=".pdf,.doc,.docx,.md,.txt"
              onChange={() => {
                /* hook API upload later */
              }}
            />
            <FileDown className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t('student.encadrant.workspace.platform.documents.import')}</span>
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

      {workspaceDocuments.length === 0 ? (
        <StudentSearchEmptyState
          titleKey="student.encadrant.workspace.platform.empty.documentsTitle"
          descriptionKey="student.encadrant.workspace.platform.empty.documentsDesc"
          variant="inline"
        />
      ) : (
        <div
          className={
            view === 'grid'
              ? 'student-workspace-documents__grid'
              : 'student-workspace-documents__list'
          }
        >
          {workspaceDocuments.map((doc) => (
            <article
              key={doc.id}
              className={`student-workspace-doc-card student-workspace-doc-card--${doc.category} ${view === 'list' ? 'student-workspace-doc-card--list' : ''}`}
            >
              <div className="student-workspace-doc-card__main">
                <div className="student-workspace-doc-card__head">
                  <span className="student-workspace-doc-card__icon-wrap" aria-hidden>
                    <FileText className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className={`student-workspace-doc-card__category student-workspace-doc-card__category--${doc.category}`}>
                    {t(`student.encadrant.workspace.platform.documents.categories.${doc.category}`)}
                  </span>
                </div>
                <h3 className="student-workspace-doc-card__title">{t(doc.nameKey)}</h3>
                <p className="student-workspace-doc-card__meta">
                  <span>{t(doc.authorKey)}</span>
                  <span className="student-workspace-doc-card__dot" aria-hidden>·</span>
                  <span>{doc.date}</span>
                  <span className="student-workspace-doc-card__dot" aria-hidden>·</span>
                  <span>{doc.size}</span>
                  <span className="student-workspace-doc-card__dot" aria-hidden>·</span>
                  <span className="student-workspace-doc-card__version">{doc.version}</span>
                </p>
              </div>
              <div className="student-workspace-doc-card__actions">
                <button type="button" className="student-workspace-doc-card__btn">
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  <span>{t('student.encadrant.workspace.platform.documents.actions.preview')}</span>
                </button>
                <button type="button" className="student-workspace-doc-card__btn">
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  <span>{t('student.encadrant.workspace.platform.documents.actions.download')}</span>
                </button>
                <button type="button" className="student-workspace-doc-card__btn">
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  <span>{t('student.encadrant.workspace.platform.documents.actions.share')}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceDocumentsPanel;
