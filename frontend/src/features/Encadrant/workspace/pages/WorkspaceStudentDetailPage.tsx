import { FunctionComponent, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EncadrantLayout from '../../components/EncadrantLayout';
import WorkspaceDetailBoard from '../components/WorkspaceDetailBoard';
import WorkspaceDetailSidebar from '../components/WorkspaceDetailSidebar';
import WorkspaceMeetingLaunchPanel from '../components/WorkspaceMeetingLaunchPanel';
import { ENCADRANT_WORKSPACE_PATH } from '../constants/routes';
import { WORKSPACE_DETAIL_PAGE_ROOT, WORKSPACE_DETAIL_TOP_GRID } from '../constants/workspaceDetailLayout';
import { getWorkspaceDetail } from '../data/workspaceDetailMock';
import { useEncadrantWorkspaceDocuments } from '../hooks/useEncadrantWorkspaceDocuments';
import { useCollaborationContext } from '../../../shared/meeting-room/hooks/useCollaborationContext';
import { useEncadrantStudentProfileId } from '../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import {
  openWorkspaceDocumentFile,
  WorkspaceDocumentPreviewModal,
  type WorkspaceDocument,
} from '../../../shared/workspace-documents';

const WorkspaceStudentDetailPage: FunctionComponent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { context } = useCollaborationContext();
  const realStudent = context?.students?.find((student) => String(student.profile_id) === studentId);
  const detail = studentId ? getWorkspaceDetail(studentId, realStudent?.display_name) : undefined;
  const resolvedFromName = useEncadrantStudentProfileId(detail?.studentName);
  const profileId =
    studentId && /^\d+$/.test(studentId) ? Number(studentId) : resolvedFromName;

  const { t } = useTranslation();
  const { documents, loading, error, savingId, saveReview, markViewed } =
    useEncadrantWorkspaceDocuments(profileId);
  const [previewDocument, setPreviewDocument] = useState<WorkspaceDocument | null>(null);

  if (!detail) {
    return <Navigate to={ENCADRANT_WORKSPACE_PATH} replace />;
  }

  const handleOpen = (document: WorkspaceDocument, download = false) => {
    if (download) {
      openWorkspaceDocumentFile(document.fileUrl, document.name);
    } else {
      setPreviewDocument(document);
    }
    void markViewed(document.id);
  };

  return (
    <EncadrantLayout>
      <div id="encadrant-workspace-detail-root" className={WORKSPACE_DETAIL_PAGE_ROOT}>
        <div className={WORKSPACE_DETAIL_TOP_GRID}>
          <WorkspaceDetailBoard stickyNotes={detail.stickyNotes} />
          <WorkspaceDetailSidebar
            documents={documents}
            documentsLoading={loading}
            documentsError={error}
            savingId={savingId}
            recentActivity={detail.recentActivity}
            onSaveReview={async (documentId, comment, grade) => {
              await saveReview(documentId, { comment, grade, status: 'in_review' });
            }}
            onOpenDocument={handleOpen}
          />
        </div>
        <WorkspaceMeetingLaunchPanel studentName={detail.studentName} />
      </div>
      <WorkspaceDocumentPreviewModal
        workspaceDocument={previewDocument}
        onClose={() => setPreviewDocument(null)}
        onDownload={(doc) => openWorkspaceDocumentFile(doc.fileUrl, doc.name)}
        labels={{
          title: t('encadrant.workspace.documents.preview.title'),
          loading: t('encadrant.workspace.documents.preview.loading'),
          error: t('encadrant.workspace.documents.preview.error'),
          unsupported: t('encadrant.workspace.documents.preview.unsupported'),
          close: t('encadrant.workspace.documents.preview.close'),
          download: t('encadrant.common.download', { defaultValue: 'Télécharger' }),
        }}
      />
    </EncadrantLayout>
  );
};

export default WorkspaceStudentDetailPage;
