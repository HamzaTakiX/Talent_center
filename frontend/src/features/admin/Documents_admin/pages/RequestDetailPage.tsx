import { FunctionComponent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle, FileText, Sparkles, XCircle } from 'lucide-react';
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

const RequestDetailPage: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const backLabel = useAdminBackLabel('documents');
  const { data, loading } = useDocumentRequestDetail(id);
  const goBack = () => navigate('/admin/documents/requests');

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
          {t('admin.forms.reviewDocument.messages.notFound')}
        </p>
      </AdminFormPageShell>
    );
  }

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
              {data.insights.map((key) => (
                <p key={key} className="admin-doc-insight">
                  {t(key)}
                </p>
              ))}
            </div>
          </section>

          <section className="admin-doc-panel">
            <h2>{t('admin.documentsModule.detail.actions')}</h2>
            <div className={adminFormActionsFooterClass}>
              <button type="button" className={adminFormBtnSecondaryClass} onClick={goBack}>
                {t('admin.common.actions.cancel')}
              </button>
              <button
                type="button"
                className="admin-btn-danger admin-form-btn inline-flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t('admin.documentsModule.detail.reject')}
              </button>
              <button type="button" className={adminFormBtnPrimaryClass}>
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
