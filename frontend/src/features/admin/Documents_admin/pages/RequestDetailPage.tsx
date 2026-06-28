import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  GitBranch,
  MessageSquareText,
  Paperclip,
  Sparkles,
  Timer,
  User,
  XCircle,
} from 'lucide-react';
import { adminDocumentsApi } from '../../api/documents';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import DocumentsWorkflowTimeline from '../components/DocumentsWorkflowTimeline';
import DocumentsSlaBar from '../components/DocumentsSlaBar';
import DocumentRequestGeneratedPreviewPanel from '../components/DocumentRequestGeneratedPreviewPanel';
import DocumentRequestDetailHero from '../components/DocumentRequestDetailHero';
import DocumentRequestDetailPanel from '../components/DocumentRequestDetailPanel';
import DocumentRequestStudentProfileCard from '../components/DocumentRequestStudentProfileCard';
import { documentRequestHasFilePreview } from '../hooks/useDocumentRequestFilePreview';
import DocumentsPageSkeleton from '../components/skeletons/DocumentsPageSkeleton';
import { useDocumentRequestDetail } from '../hooks/useDocumentsAdmin';
import {
  adminFormBtnDangerClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../shared/forms/adminFormClasses';
import '../styles/admin-documents.css';

const ACTIONABLE_STATUSES = new Set(['submitted', 'under_verification']);

function formatDateTime(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const RequestDetailPage: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('documents');
  const { data, loading, error, refresh } = useDocumentRequestDetail(id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const goBack = () => navigate('/admin/documents/requests');

  const runAction = useCallback(
    async (action: 'approve' | 'reject', payload?: Record<string, unknown>) => {
      if (!id) return;
      setActionLoading(true);
      setActionError(null);
      try {
        await adminDocumentsApi.action(id, action, payload);
        await refresh();
      } catch (err) {
        const message = isAxiosError(err)
          ? (typeof err.response?.data?.message === 'string' ? err.response.data.message : err.message)
          : t('admin.documentsModule.detail.actionError');
        setActionError(message);
      } finally {
        setActionLoading(false);
      }
    },
    [id, refresh, t],
  );

  const handleApprove = () => runAction('approve');

  const handleReject = () => {
    const reason = window.prompt(t('admin.documentsModule.detail.rejectReasonPrompt'));
    if (!reason?.trim()) return;
    runAction('reject', { reason: reason.trim() });
  };

  if (loading) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <DocumentsPageSkeleton />
      </AdminFormPageShell>
    );
  }

  if (!data) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <div className="admin-doc-detail-empty" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
          <p>{error ?? t('admin.forms.reviewDocument.messages.notFound')}</p>
        </div>
      </AdminFormPageShell>
    );
  }

  const canAct = ACTIONABLE_STATUSES.has(data.status);

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.documents'), onClick: goBack },
        { label: data.reference },
      ]}
      heroContent={<DocumentRequestDetailHero data={data} />}
    >
      <div className="admin-doc-detail-grid">
        <div className="admin-doc-detail-main">
          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.studentSummary')} icon={User}>
            <DocumentRequestStudentProfileCard data={data} />
          </DocumentRequestDetailPanel>

          {documentRequestHasFilePreview(data) ? <DocumentRequestGeneratedPreviewPanel data={data} /> : null}

          {data.reason ? (
            <DocumentRequestDetailPanel
              title={t('admin.documentsModule.detail.reason')}
              icon={MessageSquareText}
              accent="brand"
            >
              <p className="admin-doc-detail-note">{data.reason}</p>
            </DocumentRequestDetailPanel>
          ) : null}

          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.timeline')} icon={GitBranch}>
            <DocumentsWorkflowTimeline steps={data.workflowSteps} />
          </DocumentRequestDetailPanel>

          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.attachments')} icon={Paperclip}>
            {data.attachments.length === 0 ? (
              <p className="admin-doc-detail-empty-inline">{t('admin.documentsModule.detail.noAttachments')}</p>
            ) : (
              <ul className="admin-doc-detail-list">
                {data.attachments.map((a) => (
                  <li key={a.id} className="admin-doc-detail-list__item">
                    <span className="admin-doc-detail-list__icon" aria-hidden>
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <strong>{a.name}</strong>
                      <small>{formatDateTime(a.uploadedAt)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DocumentRequestDetailPanel>
        </div>

        <aside className="admin-doc-detail-aside">
          <DocumentRequestDetailPanel
            title={t('admin.documentsModule.detail.slaCountdown')}
            icon={Timer}
            accent="warning"
            className="admin-doc-detail-panel--sticky"
          >
            <DocumentsSlaBar percent={data.slaPercent} deadline={data.slaDeadline} />
            {data.slaDeadline ? (
              <p className="admin-doc-detail-sla-deadline">
                {t('admin.documentsModule.table.slaDeadline', {
                  date: formatDateTime(data.slaDeadline),
                })}
              </p>
            ) : null}
          </DocumentRequestDetailPanel>

          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.reservation')} icon={Calendar}>
            {data.reservation ? (
              <div className="admin-doc-detail-reservation">
                <span className="admin-doc-detail-list__icon" aria-hidden>
                  <Calendar className="h-4 w-4" />
                </span>
                <div>
                  <strong>{data.reservation.resourceName}</strong>
                  <p>{formatDateTime(data.reservation.startAt)}</p>
                  {data.reservation.location ? <small>{data.reservation.location}</small> : null}
                </div>
              </div>
            ) : (
              <p className="admin-doc-detail-empty-inline">{t('admin.documentsModule.detail.noReservation')}</p>
            )}
          </DocumentRequestDetailPanel>

          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.insights')} icon={Sparkles} accent="brand">
            <div className="admin-doc-insights">
              {data.insights.length === 0 ? (
                <p className="admin-doc-detail-empty-inline">{t('admin.documentsModule.detail.noInsights')}</p>
              ) : (
                data.insights.map((key) => (
                  <p key={key} className="admin-doc-insight">
                    {t(key)}
                  </p>
                ))
              )}
            </div>
          </DocumentRequestDetailPanel>

          {data.rejectionReason ? (
            <DocumentRequestDetailPanel
              title={t('admin.documentsModule.detail.rejectionReason')}
              icon={AlertCircle}
              accent="danger"
            >
              <p className="admin-doc-detail-note admin-doc-detail-note--danger">{data.rejectionReason}</p>
            </DocumentRequestDetailPanel>
          ) : null}

          <DocumentRequestDetailPanel title={t('admin.documentsModule.detail.actions')} icon={CheckCircle}>
            {actionError ? (
              <div className="admin-doc-detail-alert" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                <p>{actionError}</p>
              </div>
            ) : null}
            <div className="admin-doc-detail-actions">
              <div className="admin-doc-detail-actions__decisions">
                <button
                  type="button"
                  className={adminFormBtnDangerClass}
                  disabled={!canAct || actionLoading}
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {t('admin.documentsModule.detail.reject')}
                </button>
                <button
                  type="button"
                  className={adminFormBtnPrimaryClass}
                  disabled={!canAct || actionLoading}
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {t('admin.documentsModule.detail.approve')}
                </button>
              </div>
              <button type="button" className={adminFormBtnSecondaryClass} onClick={goBack}>
                {t('admin.common.actions.cancel')}
              </button>
            </div>
          </DocumentRequestDetailPanel>
        </aside>
      </div>
    </AdminFormPageShell>
  );
};

export default RequestDetailPage;
