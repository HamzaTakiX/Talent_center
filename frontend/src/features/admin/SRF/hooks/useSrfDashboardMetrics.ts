import { useCallback, useEffect, useMemo, useState } from 'react';
import { srfApi, type SrfDashboardSummary, type StudentFinancialTableRow } from '../../api/srf';

export interface SrfDashboardMetrics {
  students: number;
  pendingPayments: number;
  paid: number;
  overdue: number;
  outstandingAmount: number;
  averagePaymentRate: number;
}

function computeFromRows(rows: StudentFinancialTableRow[]): SrfDashboardMetrics {
  const students = rows.length;
  const pendingPayments = rows.filter((row) => row.status === 'Pending Validation').length;
  const paid = rows.filter((row) => row.status === 'Paid').length;
  const overdue = rows.filter((row) => row.status === 'Late').length;
  const outstandingAmount = rows.reduce(
    (acc, row) => acc + Math.max(row.amountDue - row.amountPaid, 0),
    0,
  );
  const totalDue = rows.reduce((acc, row) => acc + row.amountDue, 0);
  const totalPaid = rows.reduce((acc, row) => acc + row.amountPaid, 0);
  const averagePaymentRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  return {
    students,
    pendingPayments,
    paid,
    overdue,
    outstandingAmount,
    averagePaymentRate,
  };
}

function metricsFromSummary(summary: SrfDashboardSummary): SrfDashboardMetrics {
  const students = summary.paid_students + summary.unpaid_students;
  return {
    students,
    pendingPayments: summary.pending_validations,
    paid: summary.paid_students,
    overdue: summary.overdue_installments,
    outstandingAmount: 0,
    averagePaymentRate: students > 0 ? Math.round((summary.paid_students / students) * 100) : 0,
  };
}

const EMPTY_METRICS: SrfDashboardMetrics = {
  students: 0,
  pendingPayments: 0,
  paid: 0,
  overdue: 0,
  outstandingAmount: 0,
  averagePaymentRate: 0,
};

export function useSrfDashboardMetrics(rows: StudentFinancialTableRow[]) {
  const [summary, setSummary] = useState<SrfDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await srfApi.getDashboardSummary();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const metrics = useMemo(() => {
    if (rows.length > 0) {
      return computeFromRows(rows);
    }
    if (summary) {
      return metricsFromSummary(summary);
    }
    return EMPTY_METRICS;
  }, [rows, summary]);

  return { metrics, loading, reload };
}
