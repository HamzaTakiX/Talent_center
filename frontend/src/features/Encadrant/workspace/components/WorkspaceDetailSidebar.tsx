import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceDocument } from '../../../shared/workspace-documents';
import {
  WORKSPACE_DETAIL_ACTIVITY_ACTION,
  WORKSPACE_DETAIL_ACTIVITY_DOT,
  WORKSPACE_DETAIL_ACTIVITY_ITEM,
  WORKSPACE_DETAIL_ACTIVITY_LIST,
  WORKSPACE_DETAIL_ACTIVITY_TIME,
  WORKSPACE_DETAIL_PANEL,
  WORKSPACE_DETAIL_PANEL_TITLE,
  WORKSPACE_DETAIL_SIDEBAR,
} from '../constants/workspaceDetailLayout';
import type { WorkspaceRecentActivity } from '../types';
import WorkspaceDocumentReviewCard from './WorkspaceDocumentReviewCard';

interface WorkspaceDetailSidebarProps {
  documents: WorkspaceDocument[];
  documentsLoading?: boolean;
  documentsError?: string | null;
  savingId?: number | null;
  recentActivity: WorkspaceRecentActivity[];
  onSaveReview: (documentId: number, comment: string, grade: string) => Promise<void>;
  onOpenDocument: (document: WorkspaceDocument, download?: boolean) => void;
}

const WorkspaceDetailSidebar: FunctionComponent<WorkspaceDetailSidebarProps> = ({
  documents,
  documentsLoading = false,
  documentsError,
  savingId,
  recentActivity,
  onSaveReview,
  onOpenDocument,
}) => {
  const { t } = useTranslation();

  return (
    <aside className={WORKSPACE_DETAIL_SIDEBAR}>
      <section className={WORKSPACE_DETAIL_PANEL} aria-label={t('encadrant.workspace.sharedFiles')}>
        <h2 className={WORKSPACE_DETAIL_PANEL_TITLE}>{t('encadrant.workspace.sharedFiles')}</h2>
        {documentsError ? (
          <p className="m-0 text-sm text-[var(--admin-danger,#b91c1c)]">
            {t('encadrant.workspace.documents.loadError')}
          </p>
        ) : null}
        {documentsLoading ? (
          <p className="m-0 text-sm text-[var(--admin-text-muted)]">
            {t('encadrant.workspace.documents.loading')}
          </p>
        ) : documents.length === 0 ? (
          <p className="m-0 text-sm text-[var(--admin-text-muted)]">
            {t('encadrant.workspace.documents.empty')}
          </p>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-2.5">
            {documents.map((document) => (
              <WorkspaceDocumentReviewCard
                key={document.id}
                document={document}
                saving={savingId === document.id}
                onSaveReview={onSaveReview}
                onOpen={onOpenDocument}
              />
            ))}
          </div>
        )}
      </section>

      <section className={WORKSPACE_DETAIL_PANEL} aria-label={t('encadrant.workspace.recentActivity')}>
        <h2 className={WORKSPACE_DETAIL_PANEL_TITLE}>{t('encadrant.workspace.recentActivity')}</h2>
        <ul className={WORKSPACE_DETAIL_ACTIVITY_LIST}>
          {recentActivity.map((item) => (
            <li key={item.id} className={WORKSPACE_DETAIL_ACTIVITY_ITEM}>
              <span className={WORKSPACE_DETAIL_ACTIVITY_DOT} aria-hidden />
              <p className={WORKSPACE_DETAIL_ACTIVITY_ACTION}>{item.action}</p>
              <p className={WORKSPACE_DETAIL_ACTIVITY_TIME}>{item.timeAgo}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default WorkspaceDetailSidebar;
