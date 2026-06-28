import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../../admin/api/types';
import type {
  PaymentProofSubmission,
  SrfStudentFinancialDetail,
} from '../../../admin/api/srf';

export interface SubmitStudentPaymentProofPayload {
  amount: number;
  reference_number?: string;
  installment_id?: number;
  proof_file: File;
}

export const studentSrfApi = {
  getMyFinancialDetail: async (): Promise<SrfStudentFinancialDetail> => {
    const response = await apiClient.get<ApiEnvelope<SrfStudentFinancialDetail>>('/srf/student/me');
    if (!response.data.data) {
      throw new Error('SRF detail unavailable');
    }
    return response.data.data;
  },

  submitPaymentProof: async (
    payload: SubmitStudentPaymentProofPayload,
  ): Promise<PaymentProofSubmission> => {
    const formData = new FormData();
    formData.append('amount', String(payload.amount));
    if (payload.reference_number) {
      formData.append('reference_number', payload.reference_number);
    }
    if (payload.installment_id) {
      formData.append('installment_id', String(payload.installment_id));
    }
    formData.append('proof_file', payload.proof_file);

    const response = await apiClient.post<ApiEnvelope<PaymentProofSubmission>>(
      '/srf/payment-proofs/submit',
      formData,
    );
    if (!response.data.data) {
      throw new Error('Payment proof submission failed');
    }
    return response.data.data;
  },

  openChat: async (message?: string): Promise<{ conversation_id: number }> => {
    const response = await apiClient.post<ApiEnvelope<{ conversation_id: number }>>(
      '/srf/chat/open',
      message ? { message } : {},
    );
    if (!response.data.data?.conversation_id) {
      throw new Error('SRF chat unavailable');
    }
    return response.data.data;
  },
};
