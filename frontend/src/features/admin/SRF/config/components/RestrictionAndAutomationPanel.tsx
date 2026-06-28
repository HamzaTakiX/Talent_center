import { type CSSProperties, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  BookX,
  Check,
  Clock,
  Mail,
  Play,
  Shield,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  Zap,
} from 'lucide-react';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import { adminFormBtnSecondaryClass } from '../../../shared/forms/adminFormClasses';
import type { SrfNotificationTemplate, SrfRestrictionPolicy, SimulationResult } from '../../../api/srfConfig';
import { SrfConfigSectionShell } from '../ui/SrfConfigPrimitives';
import { easePremium, staggerContainer, staggerItem } from '../../../dashboard/ui/animations';
import SrfTemplateEditorPanel from './SrfTemplateEditorPanel';

const PREFIX = 'admin.modules.srf.configCenter';

// ─── Severity color for simulation steps ──────────────────────────────────────

const STEP_SEVERITY: Record<string, { dot: string; bg: string; text: string }> = {
  LOW: { dot: '#10b981', bg: 'rgba(16,185,129,.12)', text: '#10b981' },
  MEDIUM: { dot: '#155dfc', bg: 'rgba(21,93,252,.12)', text: '#155dfc' },
  HIGH: { dot: '#f59e0b', bg: 'rgba(245,158,11,.12)', text: '#d97706' },
  CRITICAL: { dot: '#ef4444', bg: 'rgba(239,68,68,.12)', text: '#ef4444' },
};

const getStepStyle = (s: string) => STEP_SEVERITY[s] ?? STEP_SEVERITY.MEDIUM;

// ─── Panel ────────────────────────────────────────────────────────────────────

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
  const [running, setRunning] = useState(false);

  useEffect(() => setLocalPolicy(policy), [policy]);

  const statusOptions = useMemo(
    () =>
      ['PARTIAL', 'OVERDUE', 'BLOCKED'].map((s) => ({
        value: s,
        label: t(`${PREFIX}.simulation.statusOptions.${s}`),
      })),
    [t],
  );

  const savePolicy = () => void onSavePolicy(localPolicy);

  const handleSimulate = async () => {
    setRunning(true);
    try {
      await onSimulate(simDays, simStatus);
    } finally {
      setRunning(false);
    }
  };

  interface PolicySwitch {
    id: string;
    key: keyof SrfRestrictionPolicy;
    label: string;
    icon: typeof Shield;
    accent: string;
    accentBg: string;
  }

  interface PolicyGroup {
    key: string;
    label: string;
    groupIcon: typeof Shield;
    groupAccent: string;
    items: PolicySwitch[];
  }

  const policyGroups: PolicyGroup[] = [
    {
      key: 'notifications',
      label: t(`${PREFIX}.restrictions.groups.notifications`, { defaultValue: 'Notifications' }),
      groupIcon: Bell,
      groupAccent: 'var(--admin-brand)',
      items: [
        {
          id: 'policy-email',
          key: 'enable_email_notifications',
          label: t(`${PREFIX}.restrictions.emailNotif`),
          icon: Mail,
          accent: 'var(--admin-brand)',
          accentBg: 'var(--admin-brand-muted)',
        },
        {
          id: 'policy-inapp',
          key: 'enable_in_app_notifications',
          label: t(`${PREFIX}.restrictions.inAppNotif`),
          icon: Bell,
          accent: '#06b6d4',
          accentBg: 'rgba(6,182,212,.12)',
        },
        {
          id: 'policy-stop-reminders',
          key: 'stop_reminders_on_payment',
          label: t(`${PREFIX}.restrictions.stopOnPayment`),
          icon: Check,
          accent: '#10b981',
          accentBg: 'rgba(16,185,129,.12)',
        },
      ],
    },
    {
      key: 'restrictions',
      label: t(`${PREFIX}.restrictions.groups.studentRestrictions`, { defaultValue: 'Student Restrictions' }),
      groupIcon: ShieldX,
      groupAccent: '#ef4444',
      items: [
        {
          id: 'policy-block-exams',
          key: 'unpaid_blocks_exams',
          label: t(`${PREFIX}.restrictions.blockExams`),
          icon: BookX,
          accent: '#ef4444',
          accentBg: 'rgba(239,68,68,.12)',
        },
        {
          id: 'policy-block-convention',
          key: 'unpaid_blocks_convention',
          label: t(`${PREFIX}.restrictions.blockConvention`),
          icon: ShieldX,
          accent: '#f97316',
          accentBg: 'rgba(249,115,22,.12)',
        },
      ],
    },
    {
      key: 'risk',
      label: t(`${PREFIX}.restrictions.groups.riskManagement`, { defaultValue: 'Risk Management' }),
      groupIcon: ShieldAlert,
      groupAccent: '#f59e0b',
      items: [
        {
          id: 'policy-at-risk',
          key: 'mark_at_risk_on_warning',
          label: t(`${PREFIX}.restrictions.markAtRisk`),
          icon: AlertTriangle,
          accent: '#f59e0b',
          accentBg: 'rgba(245,158,11,.12)',
        },
        {
          id: 'policy-critical-alerts',
          key: 'enable_critical_alerts',
          label: t(`${PREFIX}.restrictions.criticalAlerts`, { defaultValue: 'Escalation alerts' }),
          icon: TrendingUp,
          accent: '#8b5cf6',
          accentBg: 'rgba(139,92,246,.12)',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Restriction policies ────────────────────────── */}
        <SrfConfigSectionShell
          icon={Shield}
          title={t(`${PREFIX}.restrictions.title`)}
          subtitle={t(`${PREFIX}.restrictions.subtitle`)}
          className="h-full"
        >
          <div className="space-y-4">
            {policyGroups.map((group, gi) => {
              const GroupIcon = group.groupIcon;
              return (
                <div key={group.key}>
                  {/* Group header */}
                  <div className="mb-2 flex items-center gap-2 px-0.5">
                    <GroupIcon
                      className="h-3.5 w-3.5"
                      style={{ color: group.groupAccent }}
                      strokeWidth={2}
                    />
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: group.groupAccent }}
                    >
                      {group.label}
                    </p>
                    {gi < policyGroups.length - 1 ? (
                      <span className="h-px flex-1 bg-[var(--admin-border)]" aria-hidden />
                    ) : null}
                  </div>

                  {/* Group switches */}
                  <div className="space-y-1.5">
                    {group.items.map((sw) => {
                      const enabled = Boolean(localPolicy[sw.key]);
                      const Icon = sw.icon;
                      return (
                        <label
                          key={sw.id}
                          htmlFor={sw.id}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-200"
                          style={
                            {
                              borderColor: enabled ? `${sw.accent}35` : 'var(--admin-border)',
                              background: enabled ? sw.accentBg : 'transparent',
                            } as CSSProperties
                          }
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
                            style={{
                              background: enabled ? `${sw.accent}20` : 'var(--admin-bg-subtle)',
                              color: enabled ? sw.accent : 'var(--admin-text-muted)',
                            }}
                            aria-hidden
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                          <span
                            className="flex-1 text-sm font-medium transition-colors duration-200"
                            style={{ color: enabled ? 'var(--admin-text)' : 'var(--admin-text-secondary)' }}
                          >
                            {sw.label}
                          </span>
                          <AdminFormSwitch
                            id={sw.id}
                            label=""
                            checked={enabled}
                            onChange={(v) => setLocalPolicy((p) => ({ ...p, [sw.key]: v }))}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-[var(--admin-border)]/50 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={savePolicy}
              className="admin-btn-primary admin-form-btn inline-flex h-10 !w-auto items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {t(`${PREFIX}.examPlanning.save`)}
            </button>
          </div>
        </SrfConfigSectionShell>

        {/* ── Flow simulation ──────────────────────────────── */}
        <SrfConfigSectionShell
          icon={Zap}
          title={t(`${PREFIX}.simulation.title`)}
          subtitle={t(`${PREFIX}.simulation.subtitle`)}
          className="h-full"
        >
          {/* Scenario card */}
          <div className="rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_3%,var(--admin-bg-elevated))] p-5">
            {/* Centered header */}
            <div className="mb-5 flex flex-col items-center text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_20px_color-mix(in_srgb,var(--admin-brand)_18%,transparent)] ring-1 ring-[var(--admin-brand)]/15">
                <Play className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} />
              </span>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                {t(`${PREFIX}.simulation.cardTitle`)}
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.simulation.cardDesc`)}
              </p>
            </div>

            {/* Inputs: equal 2-column grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminFormField label={t(`${PREFIX}.simulation.daysLabel`)}>
                <AdminFormInput
                  type="number"
                  min={0}
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                />
              </AdminFormField>
              <AdminFormField label={t(`${PREFIX}.simulation.statusLabel`)}>
                <AdminCustomSelect value={simStatus} onChange={setSimStatus} options={statusOptions} />
              </AdminFormField>
            </div>

            {/* Run button — centered, explicit width, no w-full inheritance */}
            <div className="mt-4 flex justify-center border-t border-[var(--admin-border)]/50 pt-4">
              <button
                type="button"
                disabled={running}
                onClick={() => void handleSimulate()}
                className="admin-btn-primary admin-form-btn inline-flex h-10 !w-auto items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-[0_2px_12px_var(--admin-brand-glow)] transition-all duration-200 hover:shadow-[0_4px_20px_var(--admin-brand-glow)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? (
                  <Activity className="h-4 w-4 animate-pulse" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {running
                  ? t(`${PREFIX}.simulation.running`, { defaultValue: 'Running…' })
                  : t(`${PREFIX}.simulation.run`)}
              </button>
            </div>
          </div>

          {/* Simulation results */}
          <div className="mt-5">
            <AnimatePresence mode="wait">
              {simulation ? (
                <motion.ol
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                  variants={staggerContainer}
                  className="relative space-y-3 border-s-2 border-[var(--admin-brand)]/20 ps-6"
                >
                  {simulation.timeline.map((step, i) => {
                    const sv = getStepStyle(step.severity);
                    return (
                      <motion.li
                        key={`${step.action}-${i}`}
                        variants={staggerItem}
                        custom={i}
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <span
                          className="absolute -start-[1.75rem] top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-[3px] ring-[var(--admin-bg-elevated)]"
                          style={{ background: sv.dot }}
                          aria-hidden
                        />

                        <div
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5"
                          style={
                            {
                              borderColor: `${sv.dot}35`,
                              background: `${sv.bg}`,
                            } as CSSProperties
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                              style={{ background: `${sv.dot}25`, color: sv.text }}
                            >
                              <Clock className="h-3 w-3" />
                            </span>
                            <span className="text-sm font-medium text-[var(--admin-text)]">{step.action}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--admin-text-secondary)]">
                              {t(`${PREFIX}.simulation.dayOffset`, { days: step.day_offset })}
                            </span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                              style={{ background: `${sv.dot}20`, color: sv.text }}
                            >
                              {step.severity}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ol>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/50 px-4 py-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-bg-subtle)]">
                    <BookOpen className="h-4 w-4 text-[var(--admin-text-muted)]" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm text-[var(--admin-text-secondary)]">
                    {t(`${PREFIX}.simulation.empty`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SrfConfigSectionShell>
      </div>

      {/* ── Message templates ────────────────────────────── */}
      <SrfConfigSectionShell
        icon={Mail}
        title={t(`${PREFIX}.templates.title`)}
        subtitle={t(`${PREFIX}.templates.subtitle`)}
      >
        <SrfTemplateEditorPanel
          templates={templates}
          saving={saving}
          onSave={onSaveTemplate}
        />
      </SrfConfigSectionShell>
    </div>
  );
};

export default RestrictionAndAutomationPanel;
