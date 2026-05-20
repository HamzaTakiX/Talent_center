import type { TFunction } from 'i18next';
import type { SrfStudentFinancialDetail } from '../../api/srf';

export type InsightTone = 'info' | 'warning' | 'danger' | 'success';

export interface SrfInsight {
  id: string;
  tone: InsightTone;
  message: string;
}

export function buildSrfInsights(detail: SrfStudentFinancialDetail, t: TFunction): SrfInsight[] {
  const insights: SrfInsight[] = [];
  const { account, academic_access: access, restrictions, installment_progress: prog } = detail;
  const remaining = parseFloat(account.remaining_amount) || 0;
  const total = parseFloat(account.total_amount) || 0;
  const paidPct = total > 0 ? ((parseFloat(account.paid_amount) || 0) / total) * 100 : 0;

  if (!access.can_take_exams) {
    insights.push({
      id: 'exams-blocked',
      tone: 'danger',
      message: t('admin.modules.srf.detail.insights.examsBlocked'),
    });
  } else if (remaining > 0 && paidPct < 100) {
    insights.push({
      id: 'exams-risk',
      tone: 'warning',
      message: t('admin.modules.srf.detail.insights.examsRisk'),
    });
  }

  if (!access.can_download_convention) {
    insights.push({
      id: 'convention-blocked',
      tone: 'warning',
      message: t('admin.modules.srf.detail.insights.conventionBlocked'),
    });
  }

  if (!access.internship_eligible) {
    insights.push({
      id: 'internship-blocked',
      tone: 'info',
      message: t('admin.modules.srf.detail.insights.internshipBlocked'),
    });
  }

  if (restrictions.is_overdue || prog.overdue_installments > 0) {
    insights.push({
      id: 'overdue',
      tone: 'danger',
      message: t('admin.modules.srf.detail.insights.overdue', { count: prog.overdue_installments }),
    });
  }

  if (restrictions.pending_proof_count > 0) {
    insights.push({
      id: 'pending-proof',
      tone: 'info',
      message: t('admin.modules.srf.detail.insights.pendingProof', {
        count: restrictions.pending_proof_count,
      }),
    });
  }

  if (access.financial_clearance && remaining <= 0) {
    insights.push({
      id: 'clear',
      tone: 'success',
      message: t('admin.modules.srf.detail.insights.clear'),
    });
  }

  if (detail.risk_alerts.length > 0) {
    const critical = detail.risk_alerts.find((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    if (critical) {
      insights.push({
        id: `alert-${critical.id}`,
        tone: 'danger',
        message: critical.title,
      });
    }
  }

  return insights.slice(0, 6);
}

export function computeRiskScore(detail: SrfStudentFinancialDetail): number {
  let score = 0;
  if (detail.restrictions.is_overdue) score += 35;
  score += Math.min(detail.risk_alerts.length * 12, 36);
  score += detail.restrictions.pending_proof_count * 8;
  score += detail.installment_progress.overdue_installments * 10;
  if (!detail.academic_access.can_take_exams) score += 15;
  return Math.min(100, score);
}

export function paymentCompletionPct(detail: SrfStudentFinancialDetail): number {
  const total = parseFloat(detail.account.total_amount) || 0;
  if (total <= 0) return detail.installment_progress.completion_pct || 0;
  const paid = parseFloat(detail.account.paid_amount) || 0;
  return Math.min(100, Math.round((paid / total) * 1000) / 10);
}
