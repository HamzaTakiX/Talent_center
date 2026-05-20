import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Shield, XCircle } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import AdminBadge from '../../ui/AdminBadge';
import { srfApi, srfRoutes, type SrfPaymentProofDetail } from '../../api/srf';
import SrfReceiptViewer from '../components/SrfReceiptViewer';
import { SrfErrorState } from '../components/SrfModuleStates';
import { formatMad } from '../utils/srfFormat';
import { invalidateSrfData } from '../utils/srfDataSync';

const PANEL = 'admin-module-panel rounded-2xl border border-[var(--admin-border)] p-5 shadow-sm';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50';

const PaymentValidationPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const [detail, setDetail] = useState<SrfPaymentProofDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    if (!paymentId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await srfApi.getPaymentProofDetail(Number(paymentId));
      setDetail(data);
      setNotes(data.proof.admin_notes || '');
      setRejectionReason(data.proof.rejection_reason || '');
    } catch {
      setError(true);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReview = async (status: string) => {
    if (!paymentId || !detail) return;
    setActionError('');
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      setActionError(t('admin.modules.srf.validation.rejectionRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await srfApi.reviewPaymentProof(Number(paymentId), {
        status,
        admin_notes: notes,
        rejection_reason: rejectionReason,
      });
      invalidateSrfData();
      navigate(srfRoutes.student(detail.account.id));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setActionError(err.response?.data?.message || t('admin.modules.srf.validation.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminModulePageShell width="wide">
        <div className="flex min-h-[40vh] items-center justify-center gap-3 text-[var(--admin-text-secondary)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-brand)]" />
          {t('admin.modules.srf.validation.loading')}
        </div>
      </AdminModulePageShell>
    );
  }

  if (error || !detail) {
    return (
      <AdminModulePageShell width="wide">
        <AdminBackButton
          onClick={() => navigate(srfRoutes.hub)}
          label={t('admin.modules.srf.validation.back')}
        />
        <SrfErrorState onRetry={() => void load()} />
      </AdminModulePageShell>
    );
  }

  const { proof, student, account, installment } = detail;
  const backUrl = srfRoutes.student(account.id);

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton
        onClick={() => navigate(backUrl)}
        label={t('admin.modules.srf.validation.backToStudent')}
        className="mb-4"
      />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <Shield className="h-6 w-6 text-[var(--admin-brand)]" />
        <div>
          <h1 className="admin-module-title text-2xl">{t('admin.modules.srf.validation.title')}</h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">{student.full_name}</p>
        </div>
        <AdminBadge variant="info" className="ms-auto">
          {proof.status}
        </AdminBadge>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <section className={PANEL}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
              {t('admin.modules.srf.validation.studentInfo')}
            </h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Info label={t('admin.modules.srf.detail.program')} value={student.program || '—'} />
              <Info label={t('admin.table.studentName')} value={student.full_name} />
              <Info label={t('admin.modules.srf.validation.reference')} value={proof.reference_number || '—'} />
              <Info
                label={t('admin.modules.srf.validation.submittedAt')}
                value={new Date(proof.created_at).toLocaleString()}
              />
            </dl>
          </section>

          <section className={PANEL}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
              {t('admin.modules.srf.validation.paymentInfo')}
            </h2>
            <p className="text-2xl font-bold tabular-nums text-[var(--admin-text)]">
              {formatMad(proof.amount, proof.currency)}
            </p>
            <p className="mt-2 text-sm text-[var(--admin-text-secondary)]">
              {t('admin.modules.srf.detail.remaining')}: {formatMad(account.remaining_amount, account.currency)}
            </p>
            {installment ? (
              <p className="mt-2 text-sm">
                {t('admin.modules.srf.validation.installment', {
                  n: installment.installment_number,
                  status: installment.payment_status,
                })}
              </p>
            ) : null}
          </section>

          {detail.can_review ? (
            <section className={PANEL}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
                {t('admin.modules.srf.validation.adminActions')}
              </h2>
              <label className="mb-3 block text-sm">
                <span className="text-[var(--admin-text-secondary)]">
                  {t('admin.modules.srf.validation.internalNote')}
                </span>
                <textarea
                  className="admin-form-input mt-1 min-h-[80px] w-full"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <label className="mb-4 block text-sm">
                <span className="text-[var(--admin-text-secondary)]">
                  {t('admin.modules.srf.validation.rejectionReason')}
                </span>
                <textarea
                  className="admin-form-input mt-1 min-h-[72px] w-full"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </label>
              {actionError ? (
                <p className="mb-3 text-sm text-red-400" role="alert">
                  {actionError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  className={`${BTN} border border-[var(--admin-border)]`}
                  onClick={() => void submitReview('UNDER_REVIEW')}
                >
                  {t('admin.modules.srf.validation.markUnderReview')}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className={`${BTN} bg-amber-600 text-white`}
                  onClick={() => void submitReview('REQUIRES_CORRECTION')}
                >
                  {t('admin.modules.srf.validation.requestCorrection')}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className={`${BTN} bg-red-600 text-white`}
                  onClick={() => void submitReview('REJECTED')}
                >
                  <XCircle className="h-4 w-4" />
                  {t('admin.modules.srf.validation.reject')}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className={`${BTN} bg-emerald-600 text-white`}
                  onClick={() => void submitReview('APPROVED')}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {t('admin.modules.srf.validation.approve')}
                </button>
              </div>
            </section>
          ) : (
            <section className={PANEL}>
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('admin.modules.srf.validation.alreadyReviewed')}
              </p>
            </section>
          )}
        </div>

        <section className="min-h-[420px]">
          {proof.proof_file_url ? (
            <SrfReceiptViewer fileUrl={proof.proof_file_url} className="h-full min-h-[420px]" />
          ) : (
            <div
              className={`${PANEL} flex min-h-[320px] items-center justify-center text-sm text-[var(--admin-text-secondary)]`}
            >
              {t('admin.modules.srf.validation.noFile')}
            </div>
          )}
        </section>
      </div>
    </AdminModulePageShell>
  );
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--admin-text-secondary)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default PaymentValidationPage;
