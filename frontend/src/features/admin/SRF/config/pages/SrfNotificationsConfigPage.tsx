import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings2, Shield } from 'lucide-react';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import AdminBackButton from '../../../ui/AdminBackButton';
import ConfigAnalyticsStrip from '../components/ConfigAnalyticsStrip';
import ExamPlanningSection from '../components/ExamPlanningSection';
import WarningTiersSection from '../components/WarningTiersSection';
import RestrictionAndAutomationPanel from '../components/RestrictionAndAutomationPanel';
import ConfigAuditSection from '../components/ConfigAuditSection';
import { useSrfConfigWorkspace } from '../hooks/useSrfConfigWorkspace';
import { srfConfigApi, type SrfConfigAuditEntry } from '../../../api/srfConfig';
import { SrfConfigPageSkeleton } from '../ui/SrfConfigPrimitives';

const PREFIX = 'admin.modules.srf.configCenter';

const SrfNotificationsConfigPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    workspace,
    loading,
    saving,
    error,
    simulation,
    savePolicy,
    saveTier,
    removeTier,
    saveExamPeriod,
    removeExamPeriod,
    saveTemplate,
    runSimulation,
  } = useSrfConfigWorkspace();
  const [audit, setAudit] = useState<SrfConfigAuditEntry[]>([]);

  useEffect(() => {
    void srfConfigApi.getAuditLog().then(setAudit).catch(() => setAudit([]));
  }, [workspace]);

  if (loading || !workspace) {
    return (
      <AdminModulePageShell width="wide">
        <AdminBackButton label={t(`${PREFIX}.backToSrf`)} onClick={() => navigate('/admin/srf')} className="mb-4" />
        <SrfConfigPageSkeleton />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton label={t(`${PREFIX}.backToSrf`)} onClick={() => navigate('/admin/srf')} className="mb-4" />

      <section className="admin-page-hero relative mb-6 overflow-hidden">
        <span
          className="admin-page-hero-mesh -start-10 -top-16 h-44 w-44"
          style={{ background: 'var(--admin-mesh-1)' }}
          aria-hidden
        />
        <span
          className="admin-page-hero-mesh end-0 top-0 h-36 w-36"
          style={{ background: 'var(--admin-mesh-3)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(120deg, color-mix(in srgb, var(--admin-brand) 12%, transparent), transparent 50%, color-mix(in srgb, #06b6d4 6%, transparent))',
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-brand)] to-[#0ea5e9] text-white shadow-[0_0_32px_var(--admin-brand-glow)]">
              <Settings2 className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-brand)]">
                {t(`${PREFIX}.heroEyebrow`)}
              </p>
              <h1 className="admin-module-title mt-1 text-2xl sm:text-3xl">{t(`${PREFIX}.title`)}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.subtitle`)}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--admin-brand)]/25 bg-[var(--admin-brand-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-brand)]">
            <Shield className="h-3.5 w-3.5" />
            {t(`${PREFIX}.secureBadge`)}
          </span>
        </div>
      </section>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {t(`${PREFIX}.errors.${error}`, { defaultValue: error })}
        </p>
      ) : null}

      <ConfigAnalyticsStrip analytics={workspace.analytics} />

      <div className="mt-8 space-y-8">
        <ExamPlanningSection
          periods={workspace.exam_periods}
          saving={saving}
          onSave={saveExamPeriod}
          onDelete={removeExamPeriod}
        />

        <WarningTiersSection tiers={workspace.warning_tiers} saving={saving} onSave={saveTier} onDelete={removeTier} />

        <RestrictionAndAutomationPanel
          policy={workspace.restriction_policy}
          templates={workspace.templates}
          saving={saving}
          simulation={simulation}
          onSavePolicy={savePolicy}
          onSaveTemplate={saveTemplate}
          onSimulate={runSimulation}
        />

        <ConfigAuditSection entries={audit} />
      </div>
    </AdminModulePageShell>
  );
};

export default SrfNotificationsConfigPage;
