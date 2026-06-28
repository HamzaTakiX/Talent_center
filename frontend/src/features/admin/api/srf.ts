import apiClient from '../../../shared/api/client';

import type { ApiEnvelope } from './types';



export type StudentFinancialRowStatus =

  | 'Paid'

  | 'Unpaid'

  | 'Partially Paid'

  | 'Pending Validation'

  | 'Late';



export interface StudentFinancialTableRow {

  id: string;

  studentName: string;

  className: string;

  amountDue: number;

  amountPaid: number;

  status: StudentFinancialRowStatus;

  financialStatus?: string;

  paymentPlanType?: string;

  canTakeExams?: boolean;

  canDownloadConvention?: boolean;
  pendingProofId?: number | null;
}



export interface SrfKpiCard {

  key: string;

  label_key: string;

  value: number;

}



export interface PaymentProofSubmission {

  id: number;

  uuid: string;

  account: number;

  installment: number | null;

  amount: string;

  currency: string;

  reference_number: string;

  proof_file: string;

  proof_file_url: string;

  status: string;

  student_name: string;

  rejection_reason: string;

  admin_notes: string;

  created_at: string;

  reviewed_at?: string | null;

  linked_payment_id?: number | null;

  audit_timeline?: SrfAuditEvent[];

}



export interface SrfAuditEvent {

  at?: string;

  action?: string;

  type?: string;

  status?: string;

  amount?: string;

  actor_name?: string;

  admin_notes?: string;

  rejection_reason?: string;

  proof_id?: number;

}



export interface SrfStudentSummary {

  student_id: number;

  student_number: string;

  email: string;

  first_name: string;

  last_name: string;

  full_name: string;

  program: string;

  filiere_code: string;

  academic_level: string;

  class_group: string;

  academic_year: string;

}



export interface SrfFinancialAccount {

  id: number;

  account_number: string;

  student_profile: number;

  student_name: string;

  student_email: string;

  class_name: string;

  payment_plan_type: string;

  financial_status: string;

  total_amount: string;

  paid_amount: string;

  remaining_amount: string;

  currency: string;

  current_academic_year: string;

  balance: string;

  last_payment_at: string | null;

  installments: SrfInstallment[];

}



export interface SrfInstallment {

  id: number;

  installment_number: number;

  label: string;

  amount: string;

  currency: string;

  due_date: string;

  semester: number;

  academic_year: string;

  payment_status: string;

  paid_amount?: string;

}



export interface SrfAcademicAccess {

  can_take_exams: boolean;

  can_download_convention: boolean;

  internship_eligible: boolean;

  financial_clearance: boolean;

  blocking_reasons: string[];

  financial_status?: string;

  payment_plan_type?: string;

  remaining_amount?: string;

}



export interface SrfInstallmentProgress {

  total_installments: number;

  paid_installments: number;

  overdue_installments: number;

  blocking_overdue_installments?: number;

  completion_pct: number;

}



export interface SrfRiskAlert {

  id: number;

  alert_type: string;

  severity: string;

  title: string;

  message: string;

  is_resolved: boolean;

  created_at: string;

}



export interface SrfStudentFinancialDetail {

  student: SrfStudentSummary;

  account: SrfFinancialAccount;

  academic_access: SrfAcademicAccess;

  table_row: StudentFinancialTableRow;

  installment_progress: SrfInstallmentProgress;

  restrictions: {

    active_holds: { hold_type: string; reason: string; placed_at: string }[];

    blocking_reasons: string[];

    is_overdue: boolean;

    is_access_blocked?: boolean;

    pending_proof_count: number;

  };

  payment_proofs: PaymentProofSubmission[];

  payments: {

    id: number;

    uuid: string;

    amount: string;

    currency: string;

    status: string;

    payment_date: string;

    reference_number: string;

    notes: string;

  }[];

  risk_alerts: SrfRiskAlert[];

  audit_timeline: SrfAuditEvent[];

}



export interface SrfPaymentProofDetail {

  proof: PaymentProofSubmission;

  student: SrfStudentSummary;

  account: SrfFinancialAccount;

  academic_access: SrfAcademicAccess;

  installment: {

    id: number;

    installment_number: number;

    label: string;

    amount: string;

    paid_amount?: string;

    currency: string;

    due_date: string;

    payment_status: string;

    academic_year: string;

  } | null;

  installment_progress: SrfInstallmentProgress;

  linked_payment: {

    id: number;

    amount: string;

    status: string;

    payment_date: string;

  } | null;

  audit_timeline: SrfAuditEvent[];

  can_review: boolean;

}



export interface SrfDashboardSummary {

  total_revenue: string;

  pending_validations: number;

  overdue_installments: number;

  blocked_from_exams: number;

  convention_restricted: number;

  at_risk_students: number;

  paid_students: number;

  unpaid_students: number;

  status_distribution: Record<string, number>;

}



export const srfRoutes = {

  hub: '/admin/srf',

  student: (accountId: string | number) => `/admin/srf/student/${accountId}`,

  validation: (proofId: string | number) => `/admin/srf/validation/${proofId}`,

  chat: (params?: { account?: string | number; conversation?: string | number; opening?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.account != null) search.set('account', String(params.account));
    if (params?.conversation != null) search.set('conversation', String(params.conversation));
    if (params?.opening) search.set('opening', '1');
    const qs = search.toString();
    return qs ? `/admin/srf/chat?${qs}` : '/admin/srf/chat';
  },

};



export const srfApi = {

  getKpiCards: async (academicYear?: string): Promise<SrfKpiCard[]> => {

    const response = await apiClient.get<ApiEnvelope<SrfKpiCard[]>>('/srf/dashboard/kpi', {

      params: academicYear ? { academic_year: academicYear } : undefined,

    });

    return response.data.data;

  },



  getStudentRows: async (params?: {

    academic_year?: string;

    queue?: string;

    financial_status?: string;

  }): Promise<{ rows: StudentFinancialTableRow[]; count: number }> => {

    const response = await apiClient.get<

      ApiEnvelope<{ rows: StudentFinancialTableRow[]; count: number }>

    >('/srf/students', {

      params: {

        academic_year: params?.academic_year,

        queue: params?.queue,

        financial_status: params?.financial_status,

      },

    });

    return response.data.data;

  },



  getStudentDetail: async (accountId: number): Promise<SrfStudentFinancialDetail> => {

    const response = await apiClient.get<ApiEnvelope<SrfStudentFinancialDetail>>(

      `/srf/students/${accountId}`,

    );

    return response.data.data;

  },



  getPaymentProofDetail: async (proofId: number): Promise<SrfPaymentProofDetail> => {

    const response = await apiClient.get<ApiEnvelope<SrfPaymentProofDetail>>(

      `/srf/payment-proofs/${proofId}`,

    );

    return response.data.data;

  },



  getDashboardSummary: async (academicYear?: string): Promise<SrfDashboardSummary> => {

    const response = await apiClient.get<ApiEnvelope<SrfDashboardSummary>>(

      '/srf/dashboard/summary',

      { params: academicYear ? { academic_year: academicYear } : undefined },

    );

    return response.data.data;

  },



  getAnalytics: async (academicYear?: string) => {

    const response = await apiClient.get<ApiEnvelope<unknown>>('/srf/analytics', {

      params: academicYear ? { academic_year: academicYear } : undefined,

    });

    return response.data.data;

  },



  getPaymentProofQueue: async (status?: string): Promise<PaymentProofSubmission[]> => {

    const response = await apiClient.get<ApiEnvelope<PaymentProofSubmission[]>>(

      '/srf/payment-proofs',

      { params: status ? { status } : undefined },

    );

    return response.data.data;

  },



  reviewPaymentProof: async (

    proofId: number,

    payload: { status: string; rejection_reason?: string; admin_notes?: string; approved_amount?: number },

  ): Promise<SrfPaymentProofDetail | PaymentProofSubmission> => {

    const response = await apiClient.post<ApiEnvelope<SrfPaymentProofDetail | PaymentProofSubmission>>(

      `/srf/payment-proofs/${proofId}/review`,

      payload,

    );

    return response.data.data;

  },



  runRiskScan: async () => {

    const response = await apiClient.post<ApiEnvelope<unknown>>('/srf/risk-scan');

    return response.data.data;

  },



  getStudentAccess: async (studentId?: number) => {

    const path = studentId ? `/srf/access/${studentId}` : '/srf/access';

    const response = await apiClient.get<ApiEnvelope<unknown>>(path);

    return response.data.data;

  },

  openChat: async (
    accountId: number,
    message?: string,
  ): Promise<{ conversation_id: number }> => {
    const response = await apiClient.post<ApiEnvelope<{ conversation_id: number }>>(
      `/srf/students/${accountId}/chat/open`,
      message ? { message } : {},
    );
    const body = response.data;
    if (!body.success || !body.data?.conversation_id) {
      throw new Error(body.message || 'Failed to open SRF chat');
    }
    return body.data;
  },

};


