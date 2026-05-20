import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';

export type ImportMode = 'CREATE_ONLY' | 'UPDATE' | 'MERGE' | 'DRY_RUN';

export interface FinancialImportBatch {
  id: number;
  uuid: string;
  status: string;
  import_mode: ImportMode;
  file_format: string;
  source_filename: string;
  file_size_bytes: number;
  academic_year: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  warning_rows: number;
  success_rows: number;
  affected_students: number;
  column_mapping_json: Record<string, string>;
  preview_json: Record<string, unknown>;
  validation_json: ValidationResult | Record<string, unknown>;
  errors_json: Array<{ row?: number; message?: string }>;
  progress_percent: number;
  progress_message: string;
  started_by_name: string;
  started_at: string | null;
  completed_at: string | null;
  rolled_back_at: string | null;
  can_rollback: boolean;
  can_retry_rollback: boolean;
  created_at: string;
}

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
}

export interface ValidationRow {
  row_number: number;
  student_key: string;
  student_name: string;
  errors: string[];
  warnings: string[];
  conflict: boolean;
  valid: boolean;
}

export interface ValidationResult {
  summary: {
    total_rows: number;
    valid_rows: number;
    error_rows: number;
    warning_rows: number;
    conflict_rows: number;
    affected_students: number;
    can_execute: boolean;
  };
  rows: ValidationRow[];
  preview_sample: ValidationRow[];
}

export interface ImportMappingProfile {
  id: number;
  name: string;
  description: string;
  source_system: string;
  column_mapping_json: Record<string, string>;
  is_default: boolean;
}

export interface UploadResponse {
  batch: FinancialImportBatch;
  headers: string[];
  suggested_mapping: Record<string, string>;
  row_count: number;
  sample_rows: Record<string, unknown>[];
}

export const srfImportApi = {
  getSchema: async () => {
    const res = await apiClient.get<
      ApiEnvelope<{
        target_fields: TargetField[];
        import_modes: { value: string; label: string }[];
        supported_formats: string[];
      }>
    >('/srf/imports/schema');
    return res.data.data;
  },

  listBatches: async (): Promise<FinancialImportBatch[]> => {
    const res = await apiClient.get<ApiEnvelope<FinancialImportBatch[]>>('/srf/imports/batches');
    return res.data.data;
  },

  getBatch: async (uuid: string): Promise<FinancialImportBatch> => {
    const res = await apiClient.get<ApiEnvelope<FinancialImportBatch>>(`/srf/imports/batches/${uuid}`);
    return res.data.data;
  },

  upload: async (
    file: File,
    options?: { academic_year?: string; import_mode?: ImportMode },
  ): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    if (options?.academic_year) form.append('academic_year', options.academic_year);
    if (options?.import_mode) form.append('import_mode', options.import_mode);
    const res = await apiClient.post<ApiEnvelope<UploadResponse>>('/srf/imports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  preview: async (
    uuid: string,
    payload: { column_mapping: Record<string, string>; import_mode?: ImportMode; academic_year?: string },
  ) => {
    const res = await apiClient.post<ApiEnvelope<{ batch: FinancialImportBatch; validation: ValidationResult }>>(
      `/srf/imports/batches/${uuid}/preview`,
      payload,
    );
    return res.data.data;
  },

  execute: async (uuid: string): Promise<FinancialImportBatch> => {
    const res = await apiClient.post<ApiEnvelope<FinancialImportBatch>>(
      `/srf/imports/batches/${uuid}/execute`,
    );
    return res.data.data;
  },

  rollback: async (uuid: string, options?: { force?: boolean }) => {
    const res = await apiClient.post<ApiEnvelope<{ restored_accounts: number; batch_uuid: string }>>(
      `/srf/imports/batches/${uuid}/rollback`,
      {},
      { params: options?.force ? { force: 'true' } : undefined },
    );
    return res.data;
  },

  deleteBatch: async (
    uuid: string,
    options?: { force?: boolean; purgeFinancial?: boolean },
  ) => {
    const params: Record<string, string> = {};
    if (options?.force) params.force = 'true';
    if (options?.purgeFinancial) params.purge_financial = 'true';
    const res = await apiClient.delete<ApiEnvelope<null>>(`/srf/imports/batches/${uuid}`, {
      params: Object.keys(params).length ? params : undefined,
    });
    return res.data;
  },

  clearHistory: async (options?: { force?: boolean; purgeFinancial?: boolean }) => {
    const params: Record<string, string> = {};
    if (options?.force) params.force = 'true';
    if (options?.purgeFinancial) params.purge_financial = 'true';
    const res = await apiClient.delete<
      ApiEnvelope<{ deleted: number; skipped: number; errors: string[] }>
    >('/srf/imports/batches', {
      params: Object.keys(params).length ? params : undefined,
    });
    return res.data;
  },

  wipeFinancialModule: async (confirmPhrase: string) => {
    const res = await apiClient.post<ApiEnvelope<Record<string, number>>>(
      '/srf/imports/reset-financial-module',
      { confirm_phrase: confirmPhrase },
    );
    return res.data;
  },

  listProfiles: async (): Promise<ImportMappingProfile[]> => {
    const res = await apiClient.get<ApiEnvelope<ImportMappingProfile[]>>('/srf/imports/profiles');
    return res.data.data;
  },

  createProfile: async (payload: {
    name: string;
    description?: string;
    source_system?: string;
    column_mapping_json: Record<string, string>;
  }) => {
    const res = await apiClient.post<ApiEnvelope<ImportMappingProfile>>('/srf/imports/profiles', payload);
    return res.data.data;
  },
};
