import { useCallback, useEffect, useRef, useState } from 'react';
import { invalidateSrfData } from '../../utils/srfDataSync';
import {
  srfImportApi,
  type FinancialImportBatch,
  type ImportMappingProfile,
  type ImportMode,
  type TargetField,
  type UploadResponse,
  type ValidationResult,
} from '../../../api/srfImport';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'processing' | 'done';

export type ImportErrorKey =
  | 'uploadFailed'
  | 'previewFailed'
  | 'executeFailed'
  | 'rollbackFailed'
  | 'rollbackNoSnapshots'
  | 'deleteHistoryFailed'
  | 'clearHistoryFailed'
  | 'wipeSrfFailed';

function extractApiMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string } } };
  return err.response?.data?.message?.trim() ?? '';
}

export function useSrfFinancialImport() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [schema, setSchema] = useState<{
    target_fields: TargetField[];
    import_modes: { value: string; label: string }[];
  } | null>(null);
  const [batch, setBatch] = useState<FinancialImportBatch | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importMode, setImportMode] = useState<ImportMode>('MERGE');
  const [academicYear, setAcademicYear] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<FinancialImportBatch[]>([]);
  const [profiles, setProfiles] = useState<ImportMappingProfile[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState<ImportErrorKey | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const batches = await srfImportApi.listBatches();
      setHistory(batches);
    } catch {
      /* keep previous history */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setHistoryLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const [schemaData, batches, mappingProfiles] = await Promise.all([
        srfImportApi.getSchema(),
        srfImportApi.listBatches(),
        srfImportApi.listProfiles(),
      ]);
      setSchema(schemaData);
      setHistory(batches);
      setProfiles(mappingProfiles);
    } catch {
      setErrorKey('uploadFailed');
    } finally {
      setInitialLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadInitial]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollBatch = (uuid: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const updated = await srfImportApi.getBatch(uuid);
        setBatch(updated);
        if (['COMPLETED', 'PARTIAL', 'FAILED', 'ROLLED_BACK'].includes(updated.status)) {
          stopPolling();
          setStep('done');
          void refreshHistory();
          invalidateSrfData();
        }
      } catch {
        stopPolling();
      }
    }, 1500);
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const data: UploadResponse = await srfImportApi.upload(file, {
        academic_year: academicYear,
        import_mode: importMode,
      });
      setBatch(data.batch);
      setHeaders(data.headers);
      setMapping(data.suggested_mapping);
      setStep('mapping');
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('uploadFailed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!batch) return;
    setLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const data = await srfImportApi.preview(batch.uuid, {
        column_mapping: mapping,
        import_mode: importMode,
        academic_year: academicYear,
      });
      setBatch(data.batch);
      setValidation(data.validation);
      setStep('preview');
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('previewFailed');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!batch) return;
    setLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const started = await srfImportApi.execute(batch.uuid);
      setBatch(started);
      setStep('processing');
      setLoading(false);
      pollBatch(batch.uuid);
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('executeFailed');
      setLoading(false);
    }
  };

  const resetWorkspace = () => {
    stopPolling();
    setStep('upload');
    setBatch(null);
    setHeaders([]);
    setMapping({});
    setValidation(null);
    setError('');
    setErrorKey(null);
  };

  const handleRollback = async (uuid: string, options?: { force?: boolean }) => {
    setLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const result = await srfImportApi.rollback(uuid, options);
      await refreshHistory();
      invalidateSrfData();
      if (batch?.uuid === uuid) {
        const updated = await srfImportApi.getBatch(uuid);
        setBatch(updated);
      }
      const restored = result.data?.restored_accounts ?? 0;
      if (restored === 0) {
        setErrorKey('rollbackNoSnapshots');
      } else {
        setSuccessMessage(`rollbackRestored:${restored}`);
      }
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('rollbackFailed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromHistory = async (
    uuid: string,
    options?: { force?: boolean; purgeFinancial?: boolean },
  ) => {
    setLoading(true);
    setError('');
    setErrorKey(null);
    try {
      await srfImportApi.deleteBatch(uuid, options);
      await refreshHistory();
      if (options?.purgeFinancial) {
        invalidateSrfData();
        setSuccessMessage('importPurged');
      }
      if (batch?.uuid === uuid) {
        resetWorkspace();
      }
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('deleteHistoryFailed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async (options?: { force?: boolean; purgeFinancial?: boolean }) => {
    setHistoryLoading(true);
    setError('');
    setErrorKey(null);
    try {
      await srfImportApi.clearHistory(options);
      await refreshHistory();
      if (options?.purgeFinancial) {
        invalidateSrfData();
        setSuccessMessage('importPurged');
      }
      if (batch) {
        resetWorkspace();
      }
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('clearHistoryFailed');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleWipeSrfModule = async (confirmPhrase: string) => {
    setHistoryLoading(true);
    setError('');
    setErrorKey(null);
    try {
      const res = await srfImportApi.wipeFinancialModule(confirmPhrase);
      await refreshHistory();
      resetWorkspace();
      invalidateSrfData();
      const deleted = res.data?.accounts_deleted;
      setSuccessMessage(
        typeof deleted === 'number' ? `srfWiped:${deleted}` : 'srfWiped',
      );
    } catch (e: unknown) {
      setError(extractApiMessage(e));
      setErrorKey('wipeSrfFailed');
    } finally {
      setHistoryLoading(false);
    }
  };

  return {
    step,
    setStep,
    schema,
    batch,
    headers,
    mapping,
    setMapping,
    importMode,
    setImportMode,
    academicYear,
    setAcademicYear,
    validation,
    history,
    profiles,
    initialLoading,
    historyLoading,
    loading,
    error,
    errorKey,
    successMessage,
    setSuccessMessage,
    handleUpload,
    handlePreview,
    handleExecute,
    handleRollback,
    handleDeleteFromHistory,
    handleClearHistory,
    handleWipeSrfModule,
    resetWorkspace,
    loadInitial,
    refreshHistory,
  };
}
