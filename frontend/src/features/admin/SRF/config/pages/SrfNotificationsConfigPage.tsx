import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Calendar, CheckCircle2, Mail, Settings2, Shield, Wallet } from 'lucide-react';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import AdminBackButton from '../../../ui/AdminBackButton';
import ConfigAnalyticsStrip from '../components/ConfigAnalyticsStrip';
import ExamPlanningSection from '../components/ExamPlanningSection';
import InstallmentPlanSection from '../components/InstallmentPlanSection';
import WarningTiersSection from '../components/WarningTiersSection';
import RestrictionAndAutomationPanel from '../components/RestrictionAndAutomationPanel';
import { useSrfConfigWorkspace } from '../hooks/useSrfConfigWorkspace';
import { SrfConfigPageSkeleton } from '../ui/SrfConfigPrimitives';
import type { SrfConfigWorkspace } from '../../../api/srfConfig';
import { easePremium, staggerContainer, staggerItem } from '../../../dashboard/ui/animations';

const PREFIX = 'admin.modules.srf.configCenter';

// ─── Config Overview Cards ────────────────────────────────────────────────────

interface OverviewCardDef {
  icon: typeof Shield;
  accent: string;
  accentBg: string;
  title: string;
  status: string;
  description: string;
  index: number;
}

const OverviewCard: FunctionComponent<OverviewCardDef> = ({
  icon: Icon,
  accent,
  accentBg,
  title,
  status,
  description,
  index,
}) => (
  <motion.article
    variants={staggerItem}
    custom={index}
    className="group relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--admin-brand)_25%,var(--admin-border))] hover:shadow-[var(--admin-shadow-md)]"
  >
    {/* Hover background tint */}
    <span
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: `linear-gradient(135deg, ${accentBg} 0%, transparent 55%)` }}
      aria-hidden
    />

    <div className="relative flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-[var(--admin-border)]"
          style={{ background: accentBg, color: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span
          className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold leading-none"
          style={{ background: accentBg, color: accent }}
        >
          {status}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--admin-text)]">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--admin-text-secondary)]">{description}</p>
      </div>
    </div>
  </motion.article>
);

interface ConfigOverviewCardsProps {
  workspace: SrfConfigWorkspace;
}

const ConfigOverviewCards: FunctionComponent<ConfigOverviewCardsProps> = ({ workspace }) => {
  const { t } = useTranslation();
  const { exam_periods, warning_tiers, restriction_policy, templates, installment_plans } = workspace;

  const activeExams = exam_periods.filter((p) => p.is_active).length;
  const activeTiers = warning_tiers.filter((tier) => tier.is_active).length;
  const notifEnabled =
    restriction_policy.enable_email_notifications || restriction_policy.enable_in_app_notifications;
  const activeTemplates = templates.filter((tpl) => tpl.is_active).length;
  const activePlans = installment_plans.filter((p) => p.is_active).length;

  const cards: OverviewCardDef[] = [
    {
      icon: Calendar,
      accent: 'var(--admin-brand)',
      accentBg: 'var(--admin-brand-muted)',
      title: t(`${PREFIX}.examPlanning.title`),
      status:
        exam_periods.length === 0
          ? t(`${PREFIX}.overview.notConfigured`, { defaultValue: 'Not configured' })
          : t(`${PREFIX}.overview.periodsActive`, {
              defaultValue: `${activeExams} active`,
              count: activeExams,
            }),
      description: t(`${PREFIX}.overview.examDesc`, {
        defaultValue: 'Exam windows per program, level, and semester.',
      }),
      index: 0,
    },
    {
      icon: Wallet,
      accent: '#8b5cf6',
      accentBg: 'rgba(139,92,246,.12)',
      title: t(`${PREFIX}.installmentPlans.title`),
      status:
        installment_plans.length === 0
          ? t(`${PREFIX}.overview.notConfigured`, { defaultValue: 'Not configured' })
          : t(`${PREFIX}.overview.plansActive`, {
              defaultValue: `${activePlans} active`,
              count: activePlans,
            }),
      description: t(`${PREFIX}.overview.plansDesc`, {
        defaultValue: 'Tuition split into tranches with per-tranche deadlines.',
      }),
      index: 1,
    },
    {
      icon: Bell,
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,.12)',
      title: t(`${PREFIX}.warningTiers.title`),
      status:
        warning_tiers.length === 0
          ? t(`${PREFIX}.overview.notConfigured`, { defaultValue: 'Not configured' })
          : t(`${PREFIX}.overview.tiersActive`, {
              defaultValue: `${activeTiers} active`,
              count: activeTiers,
            }),
      description: t(`${PREFIX}.overview.tiersDesc`, {
        defaultValue: 'Escalation rules and reminder frequency.',
      }),
      index: 2,
    },
    {
      icon: Shield,
      accent: notifEnabled ? '#10b981' : '#ef4444',
      accentBg: notifEnabled ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
      title: t(`${PREFIX}.restrictions.title`),
      status: notifEnabled
        ? t(`${PREFIX}.overview.notifEnabled`, { defaultValue: 'Notifications on' })
        : t(`${PREFIX}.overview.notifDisabled`, { defaultValue: 'Notifications off' }),
      description: t(`${PREFIX}.overview.restrictionsDesc`, {
        defaultValue: 'Automated restriction and blocking rules.',
      }),
      index: 3,
    },
    {
      icon: Mail,
      accent: '#06b6d4',
      accentBg: 'rgba(6,182,212,.12)',
      title: t(`${PREFIX}.templates.title`),
      status:
        templates.length === 0
          ? t(`${PREFIX}.overview.notConfigured`, { defaultValue: 'Not configured' })
          : t(`${PREFIX}.overview.templatesActive`, {
              defaultValue: `${activeTemplates} active`,
              count: activeTemplates,
            }),
      description: t(`${PREFIX}.overview.templatesDesc`, {
        defaultValue: 'Email and in-app notification templates.',
      }),
      index: 4,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
    >
      {cards.map((card) => (
        <OverviewCard key={card.title} {...card} />
      ))}
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    saveInstallmentPlan,
    removeInstallmentPlan,
    saveTemplate,
    runSimulation,
  } = useSrfConfigWorkspace();

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

      {/* ── Hero ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easePremium }}
        className="admin-page-hero relative mb-5 overflow-hidden"
      >
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
              'linear-gradient(120deg, color-mix(in srgb, var(--admin-brand) 10%, transparent), transparent 50%, color-mix(in srgb, #06b6d4 5%, transparent))',
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-brand)] to-[#0ea5e9] text-white shadow-[0_4px_24px_var(--admin-brand-glow)]">
              <Settings2 className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--admin-brand)]">
                {t(`${PREFIX}.heroEyebrow`)}
              </p>
              <h1 className="admin-module-title mt-1 text-2xl sm:text-3xl">{t(`${PREFIX}.title`)}</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.subtitle`)}
              </p>

              {/* Module status row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  {t(`${PREFIX}.overview.moduleActive`, { defaultValue: 'Module active' })}
                </span>
                <span className="hidden text-[var(--admin-text-muted)] sm:block">·</span>
                <span className="text-[11px] text-[var(--admin-text-secondary)]">
                  {workspace.analytics.active_exam_periods}{' '}
                  {t(`${PREFIX}.overview.activeExamPeriods`, { defaultValue: 'exam periods' })}
                </span>
                <span className="hidden text-[var(--admin-text-muted)] sm:block">·</span>
                <span className="text-[11px] text-[var(--admin-text-secondary)]">
                  {workspace.analytics.active_warning_tiers}{' '}
                  {t(`${PREFIX}.overview.activeWarningTiers`, { defaultValue: 'warning tiers' })}
                </span>
              </div>
            </div>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[var(--admin-brand)]/20 bg-[var(--admin-brand-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-brand)]">
            <Shield className="h-3.5 w-3.5" />
            {t(`${PREFIX}.secureBadge`)}
          </span>
        </div>
      </motion.section>

      {/* ── Error banner ─────────────────────────────────── */}
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {t(`${PREFIX}.errors.${error}`, { defaultValue: error })}
        </motion.p>
      ) : null}

      {/* ── Analytics strip ──────────────────────────────── */}
      <div className="mb-5">
        <ConfigAnalyticsStrip analytics={workspace.analytics} />
      </div>

      {/* ── Configuration overview ────────────────────────── */}
      <div className="mb-8">
        <ConfigOverviewCards workspace={workspace} />
      </div>

      {/* ── Detail sections ───────────────────────────────── */}
      <div className="space-y-8">
        <ExamPlanningSection
          periods={workspace.exam_periods}
          saving={saving}
          onSave={saveExamPeriod}
          onDelete={removeExamPeriod}
        />

        <InstallmentPlanSection
          plans={workspace.installment_plans}
          policy={workspace.restriction_policy}
          saving={saving}
          onSave={saveInstallmentPlan}
          onDelete={removeInstallmentPlan}
          onSavePolicy={savePolicy}
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
      </div>
    </AdminModulePageShell>
  );
};

export default SrfNotificationsConfigPage;
