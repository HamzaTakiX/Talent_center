import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SrfStudentFinancialDetail, SrfInstallment, PaymentProofSubmission } from '../../../admin/api/srf';
import type {
  SrfFeeRow,
  SrfFeeRowStatus,
  SrfFeeTab,
  SrfPaymentHistoryRow,
  SrfUpcomingDeadline,
} from '../types';
import { studentSrfApi } from '../services/studentSrfApi';

function formatDate(dateLike: string): string {
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR').format(parsed);
}

function parseTimestamp(dateLike: string): number {
  const parsed = new Date(dateLike);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function installmentLabel(
  installmentId: number | null,
  installments: SrfInstallment[],
): string | null {
  if (!installmentId) return null;
  return installments.find((item) => item.id === installmentId)?.label ?? null;
}

function buildProofDescription(
  proof: PaymentProofSubmission,
  installments: SrfInstallment[],
  phase: 'submitted' | 'reviewed',
): string {
  const label = installmentLabel(proof.installment, installments);
  const reference = proof.reference_number?.trim();
  const base = label ? `${label}` : 'Paiement';
  if (phase === 'submitted') {
    return reference ? `Demande de verification — ${base} (${reference})` : `Demande de verification — ${base}`;
  }
  return reference ? `${base} (${reference})` : base;
}

function mapProofReviewStatus(status: string): SrfPaymentHistoryRow['status'] {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'REQUIRES_CORRECTION':
      return 'correction';
    default:
      return 'pending';
  }
}

function buildProofHistoryRows(
  proof: PaymentProofSubmission,
  installments: SrfInstallment[],
): SrfPaymentHistoryRow[] {
  const amount = Number(proof.amount);
  const rows: SrfPaymentHistoryRow[] = [
    {
      id: `proof-${proof.id}-submitted`,
      date: formatDate(proof.created_at),
      sortAt: parseTimestamp(proof.created_at),
      type: 'verification',
      description: buildProofDescription(proof, installments, 'submitted'),
      amount,
      status: 'pending',
    },
  ];

  const reviewedAt = proof.reviewed_at;
  const reviewStatus = mapProofReviewStatus(proof.status);
  if (reviewedAt && reviewStatus !== 'pending') {
    rows.push({
      id: `proof-${proof.id}-reviewed`,
      date: formatDate(reviewedAt),
      sortAt: parseTimestamp(reviewedAt),
      type: 'verification',
      description: buildProofDescription(proof, installments, 'reviewed'),
      amount,
      status: reviewStatus,
    });
  }

  return rows;
}

function buildPaymentHistoryRows(detail: SrfStudentFinancialDetail): SrfPaymentHistoryRow[] {
  const installments = detail.account.installments;
  const linkedPaymentIds = new Set(
    detail.payment_proofs
      .map((proof) => proof.linked_payment_id)
      .filter((id): id is number => id != null),
  );

  const proofRows = detail.payment_proofs.flatMap((proof) =>
    buildProofHistoryRows(proof, installments),
  );

  const paymentRows: SrfPaymentHistoryRow[] = detail.payments
    .filter((payment) => !linkedPaymentIds.has(payment.id))
    .map((payment) => ({
      id: `payment-${payment.id}`,
      date: formatDate(payment.payment_date),
      sortAt: parseTimestamp(payment.payment_date),
      type: 'payment' as const,
      description: payment.reference_number || 'Paiement enregistre',
      amount: Number(payment.amount),
      status: 'validated' as const,
    }));

  return [...proofRows, ...paymentRows].sort((a, b) => b.sortAt - a.sortAt);
}

function mapInstallmentStatus(paymentStatus: string): SrfFeeRowStatus {
  switch (paymentStatus.toUpperCase()) {
    case 'PAID':
      return 'paid';
    case 'PENDING_VALIDATION':
      return 'pending';
    case 'PARTIAL':
      return 'partial';
    case 'OVERDUE':
      return 'late';
    default:
      return 'unpaid';
  }
}

function mapInstallmentToFeeRow(installment: SrfInstallment): SrfFeeRow {
  const expected = Number(installment.amount);
  const paid = Number(installment.paid_amount ?? 0);
  const remaining = Math.max(0, expected - paid);
  const status = mapInstallmentStatus(installment.payment_status);

  return {
    id: `inst-${installment.id}`,
    installmentId: installment.id,
    feeType: installment.label,
    dueDate: formatDate(installment.due_date),
    amountExpected: expected,
    amountPaid: paid,
    amountRemaining: remaining,
    status,
    canPay: status !== 'paid' && status !== 'pending',
  };
}

export interface SrfFinancialSummary {
  totalDue: number;
  paid: number;
  remaining: number;
  financialStatus: string;
  canTakeExams: boolean;
  canDownloadConvention: boolean;
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  completionPct: number;
}

const EMPTY_SUMMARY: SrfFinancialSummary = {
  totalDue: 0,
  paid: 0,
  remaining: 0,
  financialStatus: '',
  canTakeExams: false,
  canDownloadConvention: false,
  totalInstallments: 0,
  paidInstallments: 0,
  overdueInstallments: 0,
  completionPct: 0,
};

function mapDetail(detail: SrfStudentFinancialDetail): {
  feeRows: SrfFeeRow[];
  feeTabs: SrfFeeTab[];
  paymentHistoryRows: SrfPaymentHistoryRow[];
  upcomingDeadline: SrfUpcomingDeadline | null;
  summary: SrfFinancialSummary;
} {
  const installments = [...detail.account.installments].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  const feeRows: SrfFeeRow[] = installments.map(mapInstallmentToFeeRow);

  const paymentHistoryRows = buildPaymentHistoryRows(detail);

  const upcomingInstallment = installments.find(
    (installment) => mapInstallmentStatus(installment.payment_status) !== 'paid',
  );
  const upcomingDeadline = upcomingInstallment
    ? (() => {
        const dueDate = new Date(upcomingInstallment.due_date);
        const days = Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000);
        return {
          id: `deadline-${upcomingInstallment.id}`,
          feeType: upcomingInstallment.label,
          dueLabel: `Echeance: ${formatDate(upcomingInstallment.due_date)}`,
          amount: Number(upcomingInstallment.amount),
          daysLabel: days <= 0 ? 'Echu' : `Dans ${days} jours`,
        };
      })()
    : null;

  const unpaid = feeRows.filter((row) => row.status === 'unpaid' || row.status === 'late').length;
  const partial = feeRows.filter((row) => row.status === 'partial').length;
  const paid = feeRows.filter((row) => row.status === 'paid').length;
  const late = feeRows.filter((row) => row.status === 'late').length;
  const feeTabs: SrfFeeTab[] = [
    { id: 'all', label: 'Tout', count: feeRows.length },
    { id: 'unpaid', label: 'Non paye', count: unpaid },
    { id: 'partial', label: 'Partiellement paye', count: partial },
    { id: 'paid', label: 'Paye', count: paid },
    { id: 'late', label: 'En retard', count: late },
  ];

  const summary: SrfFinancialSummary = {
    totalDue: Number(detail.account.total_amount),
    paid: Number(detail.account.paid_amount),
    remaining: Number(detail.account.remaining_amount),
    financialStatus: detail.account.financial_status,
    canTakeExams: detail.academic_access.can_take_exams,
    canDownloadConvention: detail.academic_access.can_download_convention,
    totalInstallments: detail.installment_progress.total_installments,
    paidInstallments: detail.installment_progress.paid_installments,
    overdueInstallments: detail.installment_progress.overdue_installments,
    completionPct: detail.installment_progress.completion_pct,
  };

  return { feeRows, feeTabs, paymentHistoryRows, upcomingDeadline, summary };
}

export function useStudentSrfData() {
  const [detail, setDetail] = useState<SrfStudentFinancialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentSrfApi.getMyFinancialDetail();
      setDetail(data);
    } catch {
      setError('load_failed');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitPaymentProof = useCallback(
    async (payload: { amount: number; reference?: string; installmentId?: number; file: File }) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        await studentSrfApi.submitPaymentProof({
          amount: payload.amount,
          reference_number: payload.reference ?? '',
          installment_id: payload.installmentId,
          proof_file: payload.file,
        });
        await refresh();
        return true;
      } catch {
        setSubmitError('submit_failed');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const mapped = useMemo(
    () =>
      detail
        ? mapDetail(detail)
        : {
            feeRows: [],
            feeTabs: [],
            paymentHistoryRows: [],
            upcomingDeadline: null,
            summary: EMPTY_SUMMARY,
          },
    [detail],
  );

  return {
    ...mapped,
    loading,
    isInitialLoad: loading && detail === null,
    error,
    submitting,
    submitError,
    submitPaymentProof,
    refresh,
  };
}
