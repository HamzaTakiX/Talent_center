import { useCallback, useEffect, useState } from 'react';
import {
  srfConfigApi,
  type SimulationResult,
  type SrfConfigWorkspace,
  type SrfExamPeriodConfig,
  type SrfInstallmentPlanTemplate,
  type SrfNotificationTemplate,
  type SrfRestrictionPolicy,
  type SrfWarningTier,
} from '../../../api/srfConfig';

export function useSrfConfigWorkspace() {
  const [workspace, setWorkspace] = useState<SrfConfigWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await srfConfigApi.getWorkspace();
      setWorkspace(data);
    } catch {
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const savePolicy = async (payload: Partial<SrfRestrictionPolicy>) => {
    setSaving(true);
    setError('');
    try {
      const policy = await srfConfigApi.updateRestrictionPolicy(payload);
      setWorkspace((prev) => (prev ? { ...prev, restriction_policy: policy } : prev));
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const saveTier = async (id: number | null, payload: Partial<SrfWarningTier>) => {
    setSaving(true);
    setError('');
    try {
      const tier = id
        ? await srfConfigApi.updateWarningTier(id, payload)
        : await srfConfigApi.createWarningTier(payload);
      setWorkspace((prev) => {
        if (!prev) return prev;
        const tiers = id
          ? prev.warning_tiers.map((t) => (t.id === id ? tier : t))
          : [...prev.warning_tiers, tier];
        return { ...prev, warning_tiers: tiers };
      });
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const removeTier = async (id: number) => {
    setSaving(true);
    try {
      await srfConfigApi.deleteWarningTier(id);
      setWorkspace((prev) =>
        prev ? { ...prev, warning_tiers: prev.warning_tiers.filter((t) => t.id !== id) } : prev,
      );
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const saveExamPeriod = async (id: number | null, payload: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      const period = id
        ? await srfConfigApi.updateExamPeriod(id, payload)
        : await srfConfigApi.createExamPeriod(payload);
      setWorkspace((prev) => {
        if (!prev) return prev;
        const periods = id
          ? prev.exam_periods.map((p) => (p.id === id ? period : p))
          : [...prev.exam_periods, period];
        return { ...prev, exam_periods: periods };
      });
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const removeExamPeriod = async (id: number) => {
    setSaving(true);
    try {
      await srfConfigApi.deleteExamPeriod(id);
      setWorkspace((prev) =>
        prev ? { ...prev, exam_periods: prev.exam_periods.filter((p) => p.id !== id) } : prev,
      );
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const saveInstallmentPlan = async (
    id: number | null,
    payload: Record<string, unknown>,
  ): Promise<boolean> => {
    setSaving(true);
    setError('');
    try {
      const plan = id
        ? await srfConfigApi.updateInstallmentPlan(id, payload)
        : await srfConfigApi.createInstallmentPlan(payload);
      setWorkspace((prev) => {
        if (!prev) return prev;
        const plans = id
          ? prev.installment_plans.map((p) => (p.id === id ? plan : p))
          : [...prev.installment_plans, plan];
        return { ...prev, installment_plans: plans };
      });
      return true;
    } catch {
      setError('save_failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeInstallmentPlan = async (id: number) => {
    setSaving(true);
    try {
      await srfConfigApi.deleteInstallmentPlan(id);
      setWorkspace((prev) =>
        prev
          ? { ...prev, installment_plans: prev.installment_plans.filter((p) => p.id !== id) }
          : prev,
      );
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async (id: number, payload: Partial<SrfNotificationTemplate>) => {
    setSaving(true);
    try {
      const tpl = await srfConfigApi.updateTemplate(id, payload);
      setWorkspace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          templates: prev.templates.map((t) => (t.id === id ? tpl : t)),
        };
      });
    } catch {
      setError('save_failed');
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async (daysUntilExam: number, financialStatus: string) => {
    try {
      const result = await srfConfigApi.simulate({
        days_until_exam: daysUntilExam,
        financial_status: financialStatus,
      });
      setSimulation(result);
    } catch {
      setError('simulate_failed');
    }
  };

  return {
    workspace,
    loading,
    saving,
    error,
    simulation,
    reload: load,
    savePolicy,
    saveTier,
    removeTier,
    saveExamPeriod,
    removeExamPeriod,
    saveInstallmentPlan,
    removeInstallmentPlan,
    saveTemplate,
    runSimulation,
    setSimulation,
  };
}

export type { SrfExamPeriodConfig, SrfWarningTier, SrfNotificationTemplate, SrfInstallmentPlanTemplate };
