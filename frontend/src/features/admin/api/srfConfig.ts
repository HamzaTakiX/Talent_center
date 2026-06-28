import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';

export interface SrfConfigAnalytics {
  students_approaching_restriction: number;
  pending_financial_risks: number;
  upcoming_exam_periods: number;
  active_warning_campaigns: number;
  blocked_students_count: number;
  at_risk_students_count: number;
  open_alerts_by_severity: Record<string, number>;
  active_exam_periods: number;
  active_warning_tiers: number;
  active_installment_plans: number;
}

export interface SrfWarningTier {
  id: number;
  sort_order: number;
  label: string;
  days_before_exam_start: number;
  severity: string;
  reminder_interval_days: number;
  max_reminders: number | null;
  cooldown_hours: number;
  block_convention: boolean;
  convention_block_days_before: number | null;
  block_exams: boolean;
  is_active: boolean;
}

export type SrfExamGateMode = 'FULL_CLEARANCE' | 'DUE_TRANCHES';

export interface SrfRestrictionPolicy {
  id: number;
  singleton_key: string;
  stop_reminders_on_payment: boolean;
  mark_at_risk_on_warning: boolean;
  escalate_unresolved_after_days: number;
  enable_email_notifications: boolean;
  enable_in_app_notifications: boolean;
  enable_critical_alerts: boolean;
  unpaid_blocks_exams: boolean;
  unpaid_blocks_convention: boolean;
  exam_gate_mode: SrfExamGateMode;
  notes: string;
}

export interface SrfInstallmentPlanTranche {
  id?: number;
  tranche_number: number;
  label: string;
  percentage: string | number;
  due_date: string;
  semester: number;
}

export interface SrfInstallmentPlanTemplate {
  id: number;
  name: string;
  description: string;
  filiere: number | null;
  filiere_name: string | null;
  academic_level: number | null;
  academic_level_label: string | null;
  academic_year: number | null;
  academic_year_code: string | null;
  number_of_tranches: number;
  split_mode: 'EQUAL' | 'CUSTOM';
  currency: string;
  is_mandatory: boolean;
  is_active: boolean;
  notes: string;
  tranches: SrfInstallmentPlanTranche[];
  total_percentage: number;
}

export interface SrfNotificationTemplate {
  id: number;
  code: string;
  name: string;
  channel: string;
  severity: string;
  subject_template: string;
  body_template: string;
  is_active: boolean;
}

export interface SrfExamPeriodConfig {
  id: number;
  filiere: number;
  filiere_code: string;
  filiere_name: string;
  academic_level: number | null;
  academic_level_code: string | null;
  academic_level_label: string | null;
  academic_year: number;
  academic_year_code: string;
  semester: number;
  exam_start: string;
  exam_end: string;
  convention_block_date: string | null;
  payment_deadline: string | null;
  warning_days_before: number;
  is_active: boolean;
  notes: string;
}

export interface SrfConfigAuditEntry {
  uuid: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_email: string;
  message: string;
  created_at: string;
}

export interface SrfConfigWorkspace {
  analytics: SrfConfigAnalytics;
  restriction_policy: SrfRestrictionPolicy;
  warning_tiers: SrfWarningTier[];
  templates: SrfNotificationTemplate[];
  exam_periods: SrfExamPeriodConfig[];
  installment_plans: SrfInstallmentPlanTemplate[];
}

export interface SimulationResult {
  days_until_exam: number;
  financial_status: string;
  active_tier: { id: number; label: string; severity: string } | null;
  timeline: { day_offset: number; severity: string; action: string; channel?: string }[];
  policy: Record<string, boolean>;
}

export const srfConfigApi = {
  getWorkspace: async (): Promise<SrfConfigWorkspace> => {
    const res = await apiClient.get<ApiEnvelope<SrfConfigWorkspace>>('/srf/config/workspace');
    return res.data.data;
  },

  updateRestrictionPolicy: async (payload: Partial<SrfRestrictionPolicy>): Promise<SrfRestrictionPolicy> => {
    const res = await apiClient.put<ApiEnvelope<SrfRestrictionPolicy>>(
      '/srf/config/restriction-policy',
      payload,
    );
    return res.data.data;
  },

  createWarningTier: async (payload: Partial<SrfWarningTier>): Promise<SrfWarningTier> => {
    const res = await apiClient.post<ApiEnvelope<SrfWarningTier>>('/srf/config/warning-tiers', payload);
    return res.data.data;
  },

  updateWarningTier: async (id: number, payload: Partial<SrfWarningTier>): Promise<SrfWarningTier> => {
    const res = await apiClient.patch<ApiEnvelope<SrfWarningTier>>(
      `/srf/config/warning-tiers/${id}`,
      payload,
    );
    return res.data.data;
  },

  deleteWarningTier: async (id: number): Promise<void> => {
    await apiClient.delete(`/srf/config/warning-tiers/${id}`);
  },

  createExamPeriod: async (payload: Record<string, unknown>): Promise<SrfExamPeriodConfig> => {
    const res = await apiClient.post<ApiEnvelope<SrfExamPeriodConfig>>(
      '/srf/config/exam-periods',
      payload,
    );
    return res.data.data;
  },

  updateExamPeriod: async (id: number, payload: Record<string, unknown>): Promise<SrfExamPeriodConfig> => {
    const res = await apiClient.patch<ApiEnvelope<SrfExamPeriodConfig>>(
      `/srf/config/exam-periods/${id}`,
      payload,
    );
    return res.data.data;
  },

  deleteExamPeriod: async (id: number): Promise<void> => {
    await apiClient.delete(`/srf/config/exam-periods/${id}`);
  },

  createInstallmentPlan: async (
    payload: Record<string, unknown>,
  ): Promise<SrfInstallmentPlanTemplate> => {
    const res = await apiClient.post<ApiEnvelope<SrfInstallmentPlanTemplate>>(
      '/srf/config/installment-plans',
      payload,
    );
    return res.data.data;
  },

  updateInstallmentPlan: async (
    id: number,
    payload: Record<string, unknown>,
  ): Promise<SrfInstallmentPlanTemplate> => {
    const res = await apiClient.patch<ApiEnvelope<SrfInstallmentPlanTemplate>>(
      `/srf/config/installment-plans/${id}`,
      payload,
    );
    return res.data.data;
  },

  deleteInstallmentPlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/srf/config/installment-plans/${id}`);
  },

  updateTemplate: async (id: number, payload: Partial<SrfNotificationTemplate>): Promise<SrfNotificationTemplate> => {
    const res = await apiClient.patch<ApiEnvelope<SrfNotificationTemplate>>(
      `/srf/config/templates/${id}`,
      payload,
    );
    return res.data.data;
  },

  getAuditLog: async (): Promise<SrfConfigAuditEntry[]> => {
    const res = await apiClient.get<ApiEnvelope<SrfConfigAuditEntry[]>>('/srf/config/audit-log');
    return res.data.data;
  },

  simulate: async (payload: { days_until_exam: number; financial_status?: string }): Promise<SimulationResult> => {
    const res = await apiClient.post<ApiEnvelope<SimulationResult>>('/srf/config/simulate', payload);
    return res.data.data;
  },

  previewTemplate: async (payload: {
    template_id?: number;
    subject_template?: string;
    body_template?: string;
    variables?: Record<string, string>;
  }): Promise<{ subject: string; body: string }> => {
    const res = await apiClient.post<ApiEnvelope<{ subject: string; body: string }>>(
      '/srf/config/preview-template',
      payload,
    );
    return res.data.data;
  },
};
