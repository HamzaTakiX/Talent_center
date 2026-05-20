import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import { documentRequestsMockData } from '../data/documentRequestsMockData';
import { documentStatusTableBadge } from '../../ui/adminStatusBadges';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import {
  adminFormActionsFooterClass,
  adminFormBodyScrollClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormPanelFlexClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';

const FORM_PREFIX = 'admin.forms.reviewDocument';

const ReviewDocumentPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { documentStatus } = useAdminTableValues();
  const backLabel = useAdminBackLabel('documents');
  const goBack = () => navigate('/admin/documents');

  useEffect(() => {
    if (id) navigate(`/admin/documents/requests/${id}`, { replace: true });
  }, [id, navigate]);

  const row = useMemo(
    () => documentRequestsMockData.find((d) => d.id === id),
    [id],
  );

  const [reviewNote, setReviewNote] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const handleDecision = (decision: 'approved' | 'rejected') => {
    setSavedMessage(
      decision === 'approved'
        ? t(`${FORM_PREFIX}.messages.approved`)
        : t(`${FORM_PREFIX}.messages.rejected`),
    );
    setTimeout(goBack, 800);
  };

  if (!row) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t(`${FORM_PREFIX}.messages.notFound`)}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.title`)}
      heroSubtitle={t(`${FORM_PREFIX}.subtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.documents'), onClick: goBack },
        { label: row.documentType },
      ]}
    >
      <div className={adminFormPanelFlexClass}>
        <div className={adminFormBodyScrollClass}>
          {savedMessage && (
            <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {savedMessage}
            </p>
          )}

          <div className={adminFormSectionsStackClass}>
            <AdminFormSection
              sectionKey="request"
              title={t(`${FORM_PREFIX}.sections.request`)}
              description={t(`${FORM_PREFIX}.sections.requestHint`)}
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-[var(--admin-text-secondary)]">
                    {t(`${FORM_PREFIX}.fields.type`)}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--admin-text)]">{row.documentType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--admin-text-secondary)]">
                    {t(`${FORM_PREFIX}.fields.student`)}
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--admin-text)]">{row.studentName}</dd>
                </div>
                {row.studentClass && (
                  <div>
                    <dt className="text-xs font-medium text-[var(--admin-text-secondary)]">
                      {t(`${FORM_PREFIX}.fields.class`)}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--admin-text)]">{row.studentClass}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-[var(--admin-text-secondary)]">
                    {t(`${FORM_PREFIX}.fields.submittedAt`)}
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--admin-text)]">{row.submissionDate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--admin-text-secondary)]">
                    {t(`${FORM_PREFIX}.fields.status`)}
                  </dt>
                  <dd className="mt-1">
                    <span className={documentStatusTableBadge(row.status)}>
                      {documentStatus(row.status)}
                    </span>
                  </dd>
                </div>
              </dl>
            </AdminFormSection>

            <AdminFormSection
              sectionKey="file"
              title={t(`${FORM_PREFIX}.sections.file`)}
              description={t(`${FORM_PREFIX}.sections.fileHint`)}
            >
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/20 px-4 py-6">
                <FileText className="h-8 w-8 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.5} aria-hidden />
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  {t(`${FORM_PREFIX}.previewPlaceholder`)}
                </p>
              </div>
            </AdminFormSection>

            <AdminFormSection
              sectionKey="note"
              title={t(`${FORM_PREFIX}.sections.note`)}
              description={t(`${FORM_PREFIX}.sections.noteHint`)}
            >
              <textarea
                className="admin-form-textarea admin-field admin-form-textarea--with-icon min-h-[120px] w-full"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={t(`${FORM_PREFIX}.placeholders.note`)}
              />
            </AdminFormSection>
          </div>
        </div>

        <div className={adminFormActionsFooterClass}>
          <button type="button" onClick={goBack} className={adminFormBtnSecondaryClass}>
            {t('admin.common.actions.cancel')}
          </button>
          {row.status === 'Pending' ? (
            <>
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="admin-btn-danger admin-form-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-admin-sm text-sm font-semibold"
              >
                <XCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {t(`${FORM_PREFIX}.actions.reject`)}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className={`${adminFormBtnPrimaryClass} md:col-span-1`}
              >
                <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {t(`${FORM_PREFIX}.actions.approve`)}
              </button>
            </>
          ) : (
            <button type="button" onClick={goBack} className={adminFormBtnPrimaryClass}>
              {t(`${FORM_PREFIX}.actions.backToList`)}
            </button>
          )}
        </div>
      </div>
    </AdminFormPageShell>
  );
};

export default ReviewDocumentPage;
