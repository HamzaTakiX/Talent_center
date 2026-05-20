import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Play, Shield, Zap } from 'lucide-react';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../../shared/forms/AdminFormPrimitives';
import { adminFormBtnSecondaryClass } from '../../../shared/forms/adminFormClasses';
import { srfConfigApi } from '../../../api/srfConfig';
import type { SrfNotificationTemplate, SrfRestrictionPolicy, SimulationResult } from '../../../api/srfConfig';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import {
  SrfConfigSectionShell,
  SrfConfigSettingCard,
  SRF_CONFIG_BTN_PRIMARY,
} from '../ui/SrfConfigPrimitives';

const PREFIX = 'admin.modules.srf.configCenter';

interface Props {
  policy: SrfRestrictionPolicy;
  templates: SrfNotificationTemplate[];
  saving: boolean;
  simulation: SimulationResult | null;
  onSavePolicy: (payload: Partial<SrfRestrictionPolicy>) => Promise<void>;
  onSaveTemplate: (id: number, payload: Partial<SrfNotificationTemplate>) => Promise<void>;
  onSimulate: (days: number, status: string) => Promise<void>;
}

const RestrictionAndAutomationPanel: FunctionComponent<Props> = ({
  policy,
  templates,
  saving,
  simulation,
  onSavePolicy,
  onSaveTemplate,
  onSimulate,
}) => {
  const { t } = useTranslation();
  const [localPolicy, setLocalPolicy] = useState(policy);
  const [simDays, setSimDays] = useState(14);
  const [simStatus, setSimStatus] = useState('PARTIAL');
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [selectedTpl, setSelectedTpl] = useState<number | null>(templates[0]?.id ?? null);

  useEffect(() => setLocalPolicy(policy), [policy]);
  useEffect(() => {
    if (templates.length && !selectedTpl) setSelectedTpl(templates[0].id);
  }, [templates, selectedTpl]);

  const statusOptions = useMemo(
    () =>
      ['PARTIAL', 'OVERDUE', 'BLOCKED'].map((s) => ({
        value: s,
        label: t(`${PREFIX}.simulation.statusOptions.${s}`),
      })),
    [t],
  );

  const savePolicy = () => void onSavePolicy(localPolicy);

  const runPreview = async () => {
    if (!selectedTpl) return;
    const result = await srfConfigApi.previewTemplate({ template_id: selectedTpl });
    setPreview(result);
  };

  const policySwitches = [
    {
      id: 'policy-stop-reminders',
      key: 'stop_reminders_on_payment' as const,
      label: t(`${PREFIX}.restrictions.stopOnPayment`),
    },
    {
      id: 'policy-at-risk',
      key: 'mark_at_risk_on_warning' as const,
      label: t(`${PREFIX}.restrictions.markAtRisk`),
    },
    {
      id: 'policy-block-exams',
      key: 'unpaid_blocks_exams' as const,
      label: t(`${PREFIX}.restrictions.blockExams`),
    },
    {
      id: 'policy-block-convention',
      key: 'unpaid_blocks_convention' as const,
      label: t(`${PREFIX}.restrictions.blockConvention`),
    },
    {
      id: 'policy-email',
      key: 'enable_email_notifications' as const,
      label: t(`${PREFIX}.restrictions.emailNotif`),
    },
    {
      id: 'policy-inapp',
      key: 'enable_in_app_notifications' as const,
      label: t(`${PREFIX}.restrictions.inAppNotif`),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <SrfConfigSectionShell
          icon={Shield}
          title={t(`${PREFIX}.restrictions.title`)}
          subtitle={t(`${PREFIX}.restrictions.subtitle`)}
          className="h-full"
        >
          <div className="space-y-2">
            {policySwitches.map((sw) => (
              <div
                key={sw.id}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/50 px-4 py-1 transition-colors hover:border-[var(--admin-brand)]/25"
              >
                <AdminFormSwitch
                  id={sw.id}
                  label={sw.label}
                  checked={Boolean(localPolicy[sw.key])}
                  onChange={(v) => setLocalPolicy((p) => ({ ...p, [sw.key]: v }))}
                />
              </div>
            ))}
          </div>
          <button type="button" className={`${SRF_CONFIG_BTN_PRIMARY} mt-5`} disabled={saving} onClick={savePolicy}>
            {t(`${PREFIX}.examPlanning.save`)}
          </button>
        </SrfConfigSectionShell>

        <SrfConfigSectionShell
          icon={Zap}
          title={t(`${PREFIX}.simulation.title`)}
          subtitle={t(`${PREFIX}.simulation.subtitle`)}
          className="h-full"
        >
          <SrfConfigSettingCard
            icon={Play}
            title={t(`${PREFIX}.simulation.cardTitle`)}
            description={t(`${PREFIX}.simulation.cardDesc`)}
          >
            <div className="flex flex-wrap items-end gap-3">
              <AdminFormField label={t(`${PREFIX}.simulation.daysLabel`)} className="min-w-[120px]">
                <AdminFormInput
                  type="number"
                  min={0}
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                />
              </AdminFormField>
              <AdminFormField label={t(`${PREFIX}.simulation.statusLabel`)} className="min-w-[160px] flex-1">
                <AdminCustomSelect value={simStatus} onChange={setSimStatus} options={statusOptions} />
              </AdminFormField>
              <button type="button" className={SRF_CONFIG_BTN_PRIMARY} onClick={() => void onSimulate(simDays, simStatus)}>
                <Play className="h-4 w-4" />
                {t(`${PREFIX}.simulation.run`)}
              </button>
            </div>
          </SrfConfigSettingCard>

          {simulation ? (
            <ol className="relative mt-5 border-s-2 border-[var(--admin-brand)]/25 ps-6">
              {simulation.timeline.map((step, i) => (
                <li key={`${step.action}-${i}`} className="relative pb-4 last:pb-0">
                  <span className="absolute -start-[1.6rem] top-1 h-3 w-3 rounded-full bg-[var(--admin-brand)]" />
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-3 py-2 text-sm">
                    <span className="font-medium text-[var(--admin-text)]">{step.action}</span>
                    <span className="text-xs text-[var(--admin-text-secondary)]">
                      {t(`${PREFIX}.simulation.dayOffset`, { days: step.day_offset })} · {step.severity}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.simulation.empty`)}</p>
          )}
        </SrfConfigSectionShell>
      </div>

      <SrfConfigSectionShell icon={Mail} title={t(`${PREFIX}.templates.title`)} subtitle={t(`${PREFIX}.templates.subtitle`)}>
        {templates.length === 0 ? (
          <SrfPremiumEmpty
            icon={Mail}
            title={t(`${PREFIX}.templates.emptyTitle`)}
            description={t(`${PREFIX}.templates.emptyDesc`)}
          />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {templates.map((tpl) => (
                <article
                  key={tpl.id}
                  className={`rounded-xl border p-4 transition-all ${
                    selectedTpl === tpl.id
                      ? 'border-[var(--admin-brand)] bg-[color-mix(in_srgb,var(--admin-brand)_6%,var(--admin-bg-elevated))] shadow-[var(--admin-shadow-glow)]'
                      : 'border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/40 hover:border-[var(--admin-brand)]/30'
                  }`}
                >
                  <button type="button" className="mb-3 w-full text-start" onClick={() => setSelectedTpl(tpl.id)}>
                    <p className="font-semibold text-[var(--admin-text)]">{tpl.name}</p>
                    <p className="text-xs text-[var(--admin-text-secondary)]">{tpl.code}</p>
                  </button>
                  <AdminFormTextarea
                    className="min-h-[120px] w-full text-sm"
                    value={tpl.body_template}
                    onChange={(e) => void onSaveTemplate(tpl.id, { body_template: e.target.value })}
                  />
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={`${adminFormBtnSecondaryClass} w-auto px-4`} onClick={() => void runPreview()}>
                {t(`${PREFIX}.templates.preview`)}
              </button>
            </div>
            {preview ? (
              <section className="mt-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-4 text-sm">
                <p className="font-semibold text-[var(--admin-text)]">{preview.subject}</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[var(--admin-text-secondary)]">{preview.body}</pre>
              </section>
            ) : null}
            <p className="mt-3 text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.templates.variables`)}</p>
          </>
        )}
      </SrfConfigSectionShell>
    </div>
  );
};

export default RestrictionAndAutomationPanel;
