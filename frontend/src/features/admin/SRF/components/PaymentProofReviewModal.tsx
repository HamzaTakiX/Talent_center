import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { PaymentProofSubmission } from '../../api/srf';
import { srfApi } from '../../api/srf';
import AdminBadge from '../../ui/AdminBadge';

interface PaymentProofReviewModalProps {
  proof: PaymentProofSubmission | null;
  onClose: () => void;
  onReviewed: () => void;
}

const PaymentProofReviewModal: FunctionComponent<PaymentProofReviewModalProps> = ({
  proof,
  onClose,
  onReviewed,
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!proof) return null;

  const handleReview = async (status: string) => {
    setSubmitting(true);
    try {
      await srfApi.reviewPaymentProof(proof.id, {
        status,
        admin_notes: notes,
        rejection_reason: rejectionReason,
      });
      onReviewed();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-proof-review-title"
    >
      <div className="relative w-full max-w-2xl rounded-xl bg-background shadow-xl border border-border">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 rounded-lg p-1 hover:bg-muted"
          aria-label={t('common.close', 'Close')}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="p-6 space-y-4 text-start">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 id="payment-proof-review-title" className="text-lg font-semibold">
              {t('admin.srf.paymentReview.title', 'Payment verification')}
            </h2>
            <AdminBadge variant="info">{proof.status}</AdminBadge>
          </div>
          <p className="text-sm text-muted-foreground">{proof.student_name}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">{t('admin.srf.amount', 'Amount')}</dt>
            <dd className="font-medium">
              {proof.amount} {proof.currency}
            </dd>
            <dt className="text-muted-foreground">{t('admin.srf.reference', 'Reference')}</dt>
            <dd>{proof.reference_number || '—'}</dd>
          </dl>
          {proof.proof_file_url ? (
            <div className="rounded-lg border border-border overflow-hidden max-h-80">
              {proof.proof_file_url.match(/\.(pdf)$/i) ? (
                <iframe
                  title={t('admin.srf.receiptPreview', 'Receipt preview')}
                  src={proof.proof_file_url}
                  className="w-full h-72"
                />
              ) : (
                <img
                  src={proof.proof_file_url}
                  alt={t('admin.srf.receiptPreview', 'Receipt preview')}
                  className="w-full object-contain max-h-72"
                />
              )}
            </div>
          ) : null}
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[72px]"
            placeholder={t('admin.srf.adminNotes', 'Admin notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[56px]"
            placeholder={t('admin.srf.rejectionReason', 'Rejection reason (if applicable)')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReview('UNDER_REVIEW')}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {t('admin.srf.markUnderReview', 'Under review')}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReview('REQUIRES_CORRECTION')}
              className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
            >
              {t('admin.srf.requiresCorrection', 'Requires correction')}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReview('REJECTED')}
              className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {t('admin.srf.reject', 'Reject')}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReview('APPROVED')}
              className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {t('admin.srf.approve', 'Approve')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofReviewModal;
