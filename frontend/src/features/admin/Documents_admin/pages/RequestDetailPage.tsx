import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import { Calendar, CheckCircle, FileText, Sparkles, XCircle } from 'lucide-react';
import { adminDocumentsApi } from '../../api/documents';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import DocumentsStatusBadge from '../components/DocumentsStatusBadge';
import DocumentsWorkflowTimeline from '../components/DocumentsWorkflowTimeline';
import DocumentsSlaBar from '../components/DocumentsSlaBar';
import DocumentsPageSkeleton from '../components/skeletons/DocumentsPageSkeleton';
import { useDocumentRequestDetail } from '../hooks/useDocumentsAdmin';
import {
  adminFormActionsFooterClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../shared/forms/adminFormClasses';
import '../styles/admin-documents.css';

const ACTIONABLE_STATUSES = new Set(['submitted', 'under_verification']);

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
        <p className="text-sm text-[var(--admin-text-secondary)]">
          {error ?? t('admin.forms.reviewDocument.messages.notFound')}
        </p>
      </AdminFormPageShell>
    );
  }

  const canAct = ACTIONABLE_STATUSES.has(data.status);

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t('admin.documentsModule.detail.title')}
      heroSubtitle={data.reference}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.documents'), onClick: goBack },
        { label: data.reference },
      ]}
    >
      <div className="admin-doc-detail-grid">
        <div className="flex flex-col gap-4">
          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.studentSummary')}</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[var(--admin-text-secondary)]">{data.student.fullName}</dt>
                <dd>{data.student.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-secondary)]">{data.student.program}</dt>
                <dd>
                  {data.student.classGroup} · {data.student.academicYear}
                </dd>
              </div>
            </dl>
            <div className="mt-3">
              <DocumentsStatusBadge status={data.status} />
            </div>
          </section>

          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.timeline')}</h2>
            <DocumentsWorkflowTimeline steps={data.workflowSteps} />
          </section>

          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.attachments')}</h2>
            {data.attachments.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('admin.documentsModule.detail.noAttachments')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-[var(--admin-brand)]" />
                    {a.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.slaCountdown')}</h2>
            <DocumentsSlaBar percent={data.slaPercent} />
          </section>

          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.reservation')}</h2>
            {data.reservation ? (
              <div className="flex gap-2 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" />
                <div>
                  <strong>{data.reservation.resourceName}</strong>
                  <p className="text-[var(--admin-text-secondary)]">
                    {new Date(data.reservation.startAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('admin.documentsModule.detail.noReservation')}
              </p>
            )}
          </section>

          <section className="admin-doc-panel">
            <h2 className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" />
              {t('admin.documentsModule.detail.insights')}
            </h2>
            <div className="admin-doc-insights">
              {data.insights.length === 0 ? (
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  {t('admin.documentsModule.detail.noInsights')}
                </p>
              ) : (
                data.insights.map((key) => (
                  <p key={key} className="admin-doc-insight">
                    {t(key)}
                  </p>
                ))
              )}
            </div>
          </section>

          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.actions')}</h2>
            {actionError ? (
              <p className="mb-3 text-sm text-[var(--admin-danger)]">{actionError}</p>
            ) : null}
            <div className={adminFormActionsFooterClass}>
              <button type="button" className={adminFormBtnSecondaryClass} onClick={goBack}>
                {t('admin.common.actions.cancel')}
              </button>
              <button
                type="button"
                className="admin-btn-danger admin-form-btn inline-flex items-center gap-2"
                disabled={!canAct || actionLoading}
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4" />
                {t('admin.documentsModule.detail.reject')}
              </button>
              <button
                type="button"
                className={adminFormBtnPrimaryClass}
                disabled={!canAct || actionLoading}
                onClick={handleApprove}
              >
                <CheckCircle className="h-4 w-4" />
                {t('admin.documentsModule.detail.approve')}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </AdminFormPageShell>
  );
};

export default RequestDetailPage;
