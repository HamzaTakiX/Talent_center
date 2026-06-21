import { useCallback, useEffect, useState } from 'react';
import { emailSystemApi } from '../api/emailSystemApi';
import type {
  AdvancedSettings,
  AnalyticsOverview,
  CategoryConfig,
  EmailTemplateRow,
  GeneralSettings,
  ProviderConfig,
  QueueItem,
  SenderIdentity,
} from '../types/emailSystemTypes';

export function useEmailSystemWorkspace() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [provider, setProvider] = useState<ProviderConfig | null>(null);
  const [senders, setSenders] = useState<SenderIdentity[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [advanced, setAdvanced] = useState<AdvancedSettings | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await emailSystemApi.bootstrap();
      const [g, p, s, c, t, a] = await Promise.all([
        emailSystemApi.getGeneral(),
        emailSystemApi.getProvider(),
        emailSystemApi.listSenders(),
        emailSystemApi.listCategories(),
        emailSystemApi.listTemplates(),
        emailSystemApi.getAdvanced(),
      ]);
      setGeneral(g);
      setProvider(p);
      setSenders(s);
      setCategories(c);
      setTemplates(t);
      setAdvanced(a);
    } catch {
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const withSave = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setSaving(true);
    setError(null);
    try {
      return await fn();
    } catch {
      setError('save_failed');
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    general,
    provider,
    senders,
    categories,
    templates,
    advanced,
    refresh,
    saveGeneral: (payload: Partial<GeneralSettings>) =>
      withSave(async () => {
        const data = await emailSystemApi.saveGeneral(payload);
        setGeneral(data);
        return data;
      }),
    saveProvider: (payload: Partial<ProviderConfig>) =>
      withSave(async () => {
        const data = await emailSystemApi.saveProvider(payload);
        setProvider(data);
        return data;
      }),
    validateProvider: async () => {
      const res = await emailSystemApi.validateProvider();
      const p = await emailSystemApi.getProvider();
      setProvider(p);
      return res;
    },
    connectProvider: async () => {
      const res = await emailSystemApi.connectProvider();
      const p = await emailSystemApi.getProvider();
      setProvider(p);
      return res;
    },
    disconnectProvider: async () => {
      await emailSystemApi.disconnectProvider();
      const p = await emailSystemApi.getProvider();
      setProvider(p);
    },
    testProvider: (email?: string) => emailSystemApi.testProvider(email),
    createSender: (payload: Partial<SenderIdentity>) =>
      withSave(async () => {
        await emailSystemApi.createSender(payload);
        setSenders(await emailSystemApi.listSenders());
      }),
    updateSender: (id: number, payload: Partial<SenderIdentity>) =>
      withSave(async () => {
        await emailSystemApi.updateSender(id, payload);
        setSenders(await emailSystemApi.listSenders());
      }),
    deleteSender: (id: number) =>
      withSave(async () => {
        await emailSystemApi.deleteSender(id);
        setSenders(await emailSystemApi.listSenders());
      }),
    setDefaultSender: (id: number) =>
      withSave(async () => {
        await emailSystemApi.setDefaultSender(id);
        setSenders(await emailSystemApi.listSenders());
      }),
    verifySender: (id: number) =>
      withSave(async () => {
        await emailSystemApi.verifySender(id);
        setSenders(await emailSystemApi.listSenders());
      }),
    saveCategories: (items: Partial<CategoryConfig>[]) =>
      withSave(async () => {
        const data = await emailSystemApi.saveCategories(items);
        setCategories(data);
        return data;
      }),
    saveAdvanced: (payload: Partial<AdvancedSettings>) =>
      withSave(async () => {
        const data = await emailSystemApi.saveAdvanced(payload);
        setAdvanced(data);
        return data;
      }),
    loadAnalytics: (days: number): Promise<AnalyticsOverview> => emailSystemApi.getAnalytics(days),
    loadQueue: (status?: string): Promise<{ items: QueueItem[]; stats: Record<string, number> }> =>
      emailSystemApi.getQueue(status),
    retryQueue: (id: number) => emailSystemApi.retryQueueItem(id),
    cancelQueue: (id: number) => emailSystemApi.cancelQueueItem(id),
    sendTest: emailSystemApi.sendTest,
    loadTemplate: emailSystemApi.getTemplate,
    updateTemplate: emailSystemApi.updateTemplate,
    previewTemplate: emailSystemApi.previewTemplate,
    testTemplate: emailSystemApi.testTemplate,
    loadAudit: emailSystemApi.getAudit,
  };
}
