import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../api/types';
import type {
  AdvancedSettings,
  AnalyticsOverview,
  AuditEntry,
  CategoryConfig,
  EmailEventCatalogItem,
  EmailTemplateDetail,
  EmailTemplateRow,
  GeneralSettings,
  ProviderConfig,
  QueueItem,
  SenderIdentity,
  TemplateVariable,
} from '../types/emailSystemTypes';

const BASE = '/admin/email-system';

export const emailSystemApi = {
  bootstrap: async () => {
    const res = await apiClient.get<ApiEnvelope<unknown>>(BASE);
    return res.data.data;
  },

  getGeneral: async (): Promise<GeneralSettings> => {
    const res = await apiClient.get<ApiEnvelope<GeneralSettings>>(`${BASE}/general/`);
    return res.data.data;
  },

  saveGeneral: async (payload: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    const res = await apiClient.patch<ApiEnvelope<GeneralSettings>>(`${BASE}/general/`, payload);
    return res.data.data;
  },

  getProvider: async (): Promise<ProviderConfig> => {
    const res = await apiClient.get<ApiEnvelope<ProviderConfig>>(`${BASE}/provider/`);
    return res.data.data;
  },

  saveProvider: async (payload: Partial<ProviderConfig>): Promise<ProviderConfig> => {
    const res = await apiClient.patch<ApiEnvelope<ProviderConfig>>(`${BASE}/provider/`, payload);
    return res.data.data;
  },

  validateProvider: async () => {
    const res = await apiClient.post<ApiEnvelope<{ details: Record<string, unknown>; provider: ProviderConfig }>>(
      `${BASE}/provider/validate/`,
    );
    return res.data;
  },

  connectProvider: async () => {
    const res = await apiClient.post<ApiEnvelope<{ details: Record<string, unknown> }>>(`${BASE}/provider/connect/`);
    return res.data;
  },

  disconnectProvider: async () => {
    const res = await apiClient.post<ApiEnvelope<unknown>>(`${BASE}/provider/disconnect/`);
    return res.data;
  },

  testProvider: async (recipient_email?: string) => {
    const res = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(`${BASE}/provider/test/`, {
      recipient_email,
    });
    return res.data;
  },

  listSenders: async (): Promise<SenderIdentity[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: SenderIdentity[] }>>(`${BASE}/senders/`);
    return res.data.data.items;
  },

  createSender: async (payload: Partial<SenderIdentity>): Promise<SenderIdentity> => {
    const res = await apiClient.post<ApiEnvelope<SenderIdentity>>(`${BASE}/senders/`, payload);
    return res.data.data;
  },

  updateSender: async (id: number, payload: Partial<SenderIdentity>): Promise<SenderIdentity> => {
    const res = await apiClient.patch<ApiEnvelope<SenderIdentity>>(`${BASE}/senders/${id}/`, payload);
    return res.data.data;
  },

  deleteSender: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/senders/${id}/`);
  },

  setDefaultSender: async (id: number): Promise<SenderIdentity> => {
    const res = await apiClient.post<ApiEnvelope<SenderIdentity>>(`${BASE}/senders/${id}/default/`);
    return res.data.data;
  },

  verifySender: async (id: number): Promise<SenderIdentity> => {
    const res = await apiClient.post<ApiEnvelope<SenderIdentity>>(`${BASE}/senders/${id}/verify/`);
    return res.data.data;
  },

  listCategories: async (): Promise<CategoryConfig[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: CategoryConfig[] }>>(`${BASE}/categories/`);
    return res.data.data.items;
  },

  saveCategories: async (items: Partial<CategoryConfig>[]): Promise<CategoryConfig[]> => {
    const res = await apiClient.patch<ApiEnvelope<{ items: CategoryConfig[] }>>(`${BASE}/categories/`, { items });
    return res.data.data.items;
  },

  listTemplates: async (): Promise<EmailTemplateRow[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: EmailTemplateRow[] }>>(`${BASE}/templates/`);
    return res.data.data.items;
  },

  getTemplate: async (code: string): Promise<EmailTemplateDetail> => {
    const res = await apiClient.get<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/${code}/`);
    return res.data.data;
  },

  updateTemplate: async (
    code: string,
    payload: { language: string; subject_template: string; body_html_template?: string; body_text_template?: string },
  ): Promise<EmailTemplateDetail> => {
    const res = await apiClient.patch<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/${code}/`, payload);
    return res.data.data;
  },

  previewTemplate: async (code: string, language: string) => {
    const res = await apiClient.post<ApiEnvelope<{ subject: string; body_html: string; body_text: string }>>(
      `${BASE}/templates/${code}/preview/`,
      { language },
    );
    return res.data.data;
  },

  testTemplate: async (code: string, payload: { recipient_email: string; language: string }) => {
    const res = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(`${BASE}/templates/${code}/test/`, payload);
    return res.data;
  },

  safePreviewTemplate: async (code: string, language: string) => {
    const res = await apiClient.post<
      ApiEnvelope<{ subject: string; body_html: string; body_text: string; event_code: string; is_test_preview: boolean }>
    >(`${BASE}/templates/${code}/safe-preview/`, { language });
    return res.data.data;
  },

  safeTestTemplate: async (code: string, payload: { recipient_email: string; language: string }) => {
    const res = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      `${BASE}/templates/${code}/safe-test/`,
      payload,
    );
    return res.data;
  },

  createTemplate: async (payload: {
    code: string;
    name: string;
    event_code: string;
    category: string;
    language?: string;
    subject_template: string;
    body_html_template?: string;
    body_text_template?: string;
    set_as_selected?: boolean;
    set_as_default?: boolean;
  }): Promise<EmailTemplateDetail> => {
    const res = await apiClient.post<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/create/`, payload);
    return res.data.data;
  },

  duplicateTemplate: async (code: string, payload: { new_code: string; new_name?: string }) => {
    const res = await apiClient.post<ApiEnvelope<EmailTemplateDetail>>(
      `${BASE}/templates/${code}/duplicate/`,
      payload,
    );
    return res.data.data;
  },

  archiveTemplate: async (code: string) => {
    const res = await apiClient.post<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/${code}/archive/`);
    return res.data.data;
  },

  selectTemplate: async (code: string) => {
    const res = await apiClient.post<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/${code}/select/`);
    return res.data.data;
  },

  setDefaultTemplate: async (code: string) => {
    const res = await apiClient.post<ApiEnvelope<EmailTemplateDetail>>(`${BASE}/templates/${code}/default/`);
    return res.data.data;
  },

  listEvents: async (): Promise<EmailEventCatalogItem[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: EmailEventCatalogItem[] }>>(`${BASE}/events/`);
    return res.data.data.items;
  },

  getEventVariables: async (
    eventCode: string,
  ): Promise<{ event_code: string; variables: TemplateVariable[]; sample_context: Record<string, string> }> => {
    const res = await apiClient.get<
      ApiEnvelope<{ event_code: string; variables: TemplateVariable[]; sample_context: Record<string, string> }>
    >(`${BASE}/events/${encodeURIComponent(eventCode)}/variables/`);
    return res.data.data;
  },

  getAnalytics: async (days: number): Promise<AnalyticsOverview> => {
    const res = await apiClient.get<ApiEnvelope<AnalyticsOverview>>(`${BASE}/analytics/`, { params: { days } });
    return res.data.data;
  },

  getQueue: async (status?: string): Promise<{ items: QueueItem[]; stats: Record<string, number> }> => {
    const res = await apiClient.get<ApiEnvelope<{ items: QueueItem[]; stats: Record<string, number> }>>(
      `${BASE}/queue/`,
      { params: status ? { status } : {} },
    );
    return res.data.data;
  },

  retryQueueItem: async (id: number): Promise<void> => {
    await apiClient.post(`${BASE}/queue/${id}/retry/`);
  },

  cancelQueueItem: async (id: number): Promise<void> => {
    await apiClient.post(`${BASE}/queue/${id}/cancel/`);
  },

  sendTest: async (payload: {
    recipient_email: string;
    template_code?: string;
    language: string;
    subject?: string;
    body_html?: string;
  }) => {
    const res = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(`${BASE}/test/`, payload);
    return res.data;
  },

  getAdvanced: async (): Promise<AdvancedSettings> => {
    const res = await apiClient.get<ApiEnvelope<AdvancedSettings>>(`${BASE}/advanced/`);
    return res.data.data;
  },

  saveAdvanced: async (payload: Partial<AdvancedSettings>): Promise<AdvancedSettings> => {
    const res = await apiClient.patch<ApiEnvelope<AdvancedSettings>>(`${BASE}/advanced/`, payload);
    return res.data.data;
  },

  getAudit: async (changeType?: string): Promise<AuditEntry[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: AuditEntry[] }>>(`${BASE}/audit/`, {
      params: changeType ? { change_type: changeType } : {},
    });
    return res.data.data.items;
  },
};
