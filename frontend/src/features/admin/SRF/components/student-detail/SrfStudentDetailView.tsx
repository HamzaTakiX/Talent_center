import { FunctionComponent, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  Clock,
  FileCheck,
  FileUp,
  GraduationCap,
  Lightbulb,
  Lock,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react';
import AdminBadge from '../../../ui/AdminBadge';
import { srfRoutes, type SrfStudentFinancialDetail } from '../../../api/srf';
import { financialStatusVariant, formatMad } from '../../utils/srfFormat';
import {
  buildSrfInsights,
  computeRiskScore,
  paymentCompletionPct,
  type InsightTone,
} from '../../utils/srfStudentInsights';
import {
  SrfInstallmentBars,
  SrfPaymentDonut,
  SrfRadialGauge,
  SrfRiskMeter,
} from './SrfFinancialCharts';
import SrfPremiumEmpty from './SrfPremiumEmpty';
import SrfValidateButton from './SrfValidateButton';
import { invalidateSrfData } from '../../utils/srfDataSync';

const PANEL =
  'admin-module-panel rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-5 shadow-sm transition-shadow duration-300 hover:shadow-[var(--admin-shadow-md)]';

interface SrfStudentDetailViewProps {
  detail: SrfStudentFinancialDetail;
}

function studentInitials(first: string, last: string): string {
  const a = (first?.trim()[0] ?? '').toUpperCase();
  const b = (last?.trim()[0] ?? '').toUpperCase();
  return (a + b) || '?';
}

function riskLevelKey(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function timelineIcon(type?: string, action?: string) {
  const key = `${type ?? ''} ${action ?? ''}`.toLowerCase();
  if (key.includes('valid') || key.includes('proof') || key.includes('review')) return FileCheck;
  if (key.includes('pay') || key.includes('amount')) return Wallet;
  if (key.includes('remind') || key.includes('notif')) return Bell;
  if (key.includes('restrict') || key.includes('hold') || key.includes('block')) return Lock;
  return Clock;
}

const insightToneClass: Record<InsightTone, string> = {
  info: 'border-[var(--admin-brand)]/25 bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))]',
  warning: 'border-amber-500/30 bg-amber-500/10',
  danger: 'border-red-500/30 bg-red-500/10',
  success: 'border-emerald-500/30 bg-emerald-500/10',
};

const SrfStudentDetailView: FunctionComponent<SrfStudentDetailViewProps> = ({ detail }) => {
  const { t } = useTranslation();
  const { student, account, academic_access: access, installment_progress: prog } = detail;

  const paid = parseFloat(account.paid_amount) || 0;
  const remaining = parseFloat(account.remaining_amount) || 0;
  const total = parseFloat(account.total_amount) || 0;
  const completionPct = paymentCompletionPct(detail);
  const riskScore = computeRiskScore(detail);
  const riskLevel = riskLevelKey(riskScore);
  const insights = useMemo(() => buildSrfInsights(detail, t), [detail, t]);

  const pendingProofId =
    detail.table_row.pendingProofId ??
    detail.payment_proofs.find((p) =>
      ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_VALIDATION'].includes(
        (p.status ?? '').toUpperCase(),
      ),
    )?.id ??
    null;

  const installmentItems = useMemo(() => {
    return (account.installments ?? []).map((inst) => {
      const amount = parseFloat(inst.amount) || 0;
      const paidInst = ['PAID', 'COMPLETED', 'SETTLED'].includes(
        (inst.payment_status ?? '').toUpperCase(),
      );
      const overdue = (inst.payment_status ?? '').toUpperCase() === 'OVERDUE';
      return {
        label: inst.label || t('admin.modules.srf.detail.installmentLabel', { n: inst.installment_number }),
        amount,
        status: inst.payment_status,
        pct: paidInst ? 100 : overdue ? 35 : 15,
      };
    });
  }, [account.installments, t]);

  const accessCards = [
    {
      key: 'exams',
      icon: GraduationCap,
      title: t('admin.modules.srf.detail.access.examsTitle'),
      ok: access.can_take_exams,
      reason: access.blocking_reasons?.[0],
    },
    {
      key: 'convention',
      icon: BookOpen,
      title: t('admin.modules.srf.detail.access.conventionTitle'),
      ok: access.can_download_convention,
      reason: access.blocking_reasons?.[1],
    },
    {
      key: 'internship',
      icon: Briefcase,
      title: t('admin.modules.srf.detail.access.internshipTitle'),
      ok: access.internship_eligible,
      reason: access.blocking_reasons?.[2],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="admin-page-hero relative overflow-hidden">
        <span
          className="admin-page-hero-mesh -start-8 -top-12 h-40 w-40"
          style={{ background: 'var(--admin-mesh-1)' }}
          aria-hidden
        />
        <span
          className="admin-page-hero-mesh end-0 top-0 h-32 w-32"
          style={{ background: 'var(--admin-mesh-3)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--admin-brand) 14%, transparent) 0%, transparent 55%, color-mix(in srgb, #06b6d4 6%, transparent) 100%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            className="flex min-w-0 flex-1 items-start gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-brand)] to-[#0ea5e9] text-xl font-bold text-white shadow-[0_0_32px_var(--admin-brand-glow)] ring-2 ring-white/10"
              aria-hidden
            >
              {studentInitials(student.first_name, student.last_name)}
            </motion.div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-brand)]">
                {t('admin.modules.srf.detail.heroEyebrow')}
              </p>
              <h1 className="admin-module-title mt-1 text-2xl sm:text-3xl">{student.full_name}</h1>
              <p className="mt-1 truncate text-sm text-[var(--admin-text-secondary)]">
                {student.student_number} · {student.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminBadge variant={financialStatusVariant(account.financial_status)}>
                  {account.financial_status}
                </AdminBadge>
                <AdminBadge variant="neutral">{account.payment_plan_type}</AdminBadge>
                <AdminBadge
                  variant={riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}
                >
                  {t(`admin.modules.srf.detail.riskLevel.${riskLevel}`)}
                </AdminBadge>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
            <HeroStat label={t('admin.modules.srf.detail.heroCompletion')} value={`${completionPct}%`} />
            <HeroStat
              label={t('admin.modules.srf.detail.heroRemaining')}
              value={formatMad(account.remaining_amount, account.currency)}
            />
            <HeroStat label={t('admin.modules.srf.detail.heroRiskScore')} value={String(riskScore)} />
            <HeroStat
              label={t('admin.modules.srf.detail.heroProgram')}
              value={student.program || student.filiere_code || '—'}
              small
            />
          </div>
        </div>
      </section>

      {/* Financial charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className={`${PANEL} lg:col-span-2`}>
          <SectionTitle>{t('admin.modules.srf.detail.financialIntelligence')}</SectionTitle>
          <div className="mt-5 grid gap-8 md:grid-cols-2">
            <SrfPaymentDonut
              paid={paid}
              remaining={remaining}
              paidLabel={t('admin.modules.srf.detail.chartPaid')}
              remainingLabel={t('admin.modules.srf.detail.chartRemaining')}
            />
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <MetricChip label={t('admin.modules.srf.detail.total')} value={formatMad(account.total_amount, account.currency)} />
              <MetricChip label={t('admin.modules.srf.detail.paid')} value={formatMad(account.paid_amount, account.currency)} highlight />
              <MetricChip label={t('admin.modules.srf.detail.remaining')} value={formatMad(account.remaining_amount, account.currency)} />
            </div>
          </div>
          {account.payment_plan_type === 'INSTALLMENTS' ? (
            <p className="mt-5 text-sm text-[var(--admin-text-secondary)]">
              {t('admin.modules.srf.detail.installmentProgress', {
                paid: prog.paid_installments,
                total: prog.total_installments,
                pct: prog.completion_pct,
              })}
              {prog.overdue_installments > 0
                ? ` · ${t('admin.modules.srf.detail.overdueCount', { count: prog.overdue_installments })}`
                : ''}
            </p>
          ) : null}
        </section>

        <section className={PANEL}>
          <SectionTitle>{t('admin.modules.srf.detail.eligibilityScore')}</SectionTitle>
          <div className="mt-6 flex flex-col items-center gap-6">
            <SrfRadialGauge
              value={access.financial_clearance ? 100 : completionPct}
              label={t('admin.modules.srf.detail.eligibilityLabel')}
              sublabel={
                access.financial_clearance
                  ? t('admin.modules.srf.detail.eligibilityClear')
                  : t('admin.modules.srf.detail.eligibilityPending')
              }
            />
            <div className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-3 py-2 text-center text-xs text-[var(--admin-text-secondary)]">
              {student.academic_year || account.current_academic_year || '—'} · {student.class_group || '—'}
            </div>
          </div>
        </section>
      </div>

      {/* Access cards */}
      <section>
        <SectionTitle className="mb-4">{t('admin.modules.srf.detail.accessRights')}</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {accessCards.map((card) => (
            <motion.div
              key={card.key}
              className={`group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-md)] ${
                card.ok
                  ? 'border-emerald-500/25 bg-[color-mix(in_srgb,#10b981_6%,var(--admin-bg-elevated))]'
                  : 'border-red-500/20 bg-[color-mix(in_srgb,#ef4444_5%,var(--admin-bg-elevated))]'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    card.ok ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  <card.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    card.ok ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-500'
                  }`}
                >
                  {card.ok
                    ? t('admin.modules.srf.detail.access.granted')
                    : t('admin.modules.srf.detail.access.restricted')}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-[var(--admin-text)]">{card.title}</h3>
              <p className="mt-2 text-sm text-[var(--admin-text-secondary)]">
                {card.ok
                  ? t('admin.modules.srf.detail.access.noRestriction')
                  : card.reason || t('admin.modules.srf.detail.access.defaultReason')}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Risk + Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={PANEL}>
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[var(--admin-brand)]" />
            <SectionTitle>{t('admin.modules.srf.detail.riskIntelligence')}</SectionTitle>
          </div>
          <SrfRiskMeter
            score={riskScore}
            lowLabel={t('admin.modules.srf.detail.riskLow')}
            highLabel={t('admin.modules.srf.detail.riskHigh')}
          />
          <p className="mt-3 text-sm text-[var(--admin-text-secondary)]">
            {t(`admin.modules.srf.detail.riskInsight.${riskLevel}`)}
          </p>
          {detail.restrictions.is_overdue ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t('admin.modules.srf.detail.overdueState')}
            </div>
          ) : null}
          {detail.risk_alerts.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {detail.risk_alerts.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-3 py-2.5 text-sm transition-colors hover:border-[var(--admin-brand)]/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--admin-text)]">{a.title}</span>
                    <AdminBadge variant={a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'danger' : 'warning'}>
                      {a.severity}
                    </AdminBadge>
                  </div>
                  <p className="mt-1 text-[var(--admin-text-secondary)]">{a.message}</p>
                  {a.created_at ? (
                    <p className="mt-1 text-[10px] text-[var(--admin-text-muted)]">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : detail.restrictions.is_overdue ? null : (
            <p className="mt-4 text-sm text-[var(--admin-text-secondary)]">{t('admin.modules.srf.detail.noRisk')}</p>
          )}
        </section>

        <section className={PANEL}>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--admin-brand)]" />
            <SectionTitle>{t('admin.modules.srf.detail.smartInsights')}</SectionTitle>
          </div>
          {insights.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-[var(--admin-border)] px-4 py-6">
              <Lightbulb className="h-5 w-5 shrink-0 text-[var(--admin-brand)]" />
              <p className="text-sm text-[var(--admin-text-secondary)]">
                {t('admin.modules.srf.detail.insights.empty')}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {insights.map((ins) => (
                <li
                  key={ins.id}
                  className={`rounded-xl border px-4 py-3 text-sm transition-transform hover:translate-x-0.5 ${insightToneClass[ins.tone]}`}
                >
                  {ins.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Installments */}
      {account.payment_plan_type === 'INSTALLMENTS' && installmentItems.length > 0 ? (
        <section className={PANEL}>
          <SectionTitle>{t('admin.modules.srf.detail.installmentVisual')}</SectionTitle>
          <div className="mt-5">
            <SrfInstallmentBars items={installmentItems} />
          </div>
        </section>
      ) : null}

      {/* Payment proofs */}
      <section className={PANEL}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>{t('admin.modules.srf.detail.paymentProofs')}</SectionTitle>
          <SrfValidateButton pendingProofId={pendingProofId} />
        </div>
        {detail.payment_proofs.length === 0 ? (
          <SrfPremiumEmpty
            icon={FileUp}
            title={t('admin.modules.srf.detail.emptyProofsTitle')}
            description={t('admin.modules.srf.detail.emptyProofsDesc')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-start text-xs uppercase text-[var(--admin-text-secondary)]">
                  <th className="py-2 pe-4">{t('admin.table.status')}</th>
                  <th className="py-2 pe-4">{t('admin.srf.amount')}</th>
                  <th className="py-2 pe-4">{t('admin.srf.reference')}</th>
                  <th className="py-2 text-end">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {detail.payment_proofs.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--admin-border)]/50 transition-colors hover:bg-[var(--admin-row-hover)]"
                  >
                    <td className="py-3 pe-4">
                      <AdminBadge variant="info">{p.status}</AdminBadge>
                    </td>
                    <td className="py-3 pe-4 tabular-nums">
                      {p.amount} {p.currency}
                    </td>
                    <td className="py-3 pe-4">{p.reference_number || '—'}</td>
                    <td className="py-3 text-end">
                      <Link
                        to={srfRoutes.validation(p.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--admin-brand-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-brand)] transition-colors hover:bg-[var(--admin-brand)] hover:text-white"
                        onClick={() => invalidateSrfData()}
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        {t('admin.modules.srf.detail.openValidation')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className={PANEL}>
        <SectionTitle className="mb-5">{t('admin.modules.srf.detail.timeline')}</SectionTitle>
        {detail.audit_timeline.length === 0 ? (
          <SrfPremiumEmpty
            variant="timeline"
            icon={Clock}
            title={t('admin.modules.srf.detail.emptyTimelineTitle')}
            description={t('admin.modules.srf.detail.emptyTimelineDesc')}
          />
        ) : (
          <ol className="relative space-y-0 border-s-2 border-[var(--admin-brand)]/20 ms-4 ps-8">
            {detail.audit_timeline.slice(0, 30).map((ev, i) => {
              const Icon = timelineIcon(ev.type, ev.action);
              return (
                <li key={`${ev.type}-${ev.at}-${i}`} className="relative pb-8 last:pb-0">
                  <span className="absolute -start-[2.35rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--admin-brand)]/40 bg-[var(--admin-bg-elevated)] shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-[var(--admin-brand)]" />
                  </span>
                  <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3 transition-colors hover:border-[var(--admin-brand)]/35">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-[var(--admin-text)]">
                        {ev.action || ev.type || ev.status}
                      </p>
                      {ev.status ? (
                        <span className="rounded-full bg-[var(--admin-brand-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--admin-brand)]">
                          {ev.status}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
                      {ev.at ? new Date(ev.at).toLocaleString() : ''}
                      {ev.actor_name ? ` · ${ev.actor_name}` : ''}
                      {ev.amount ? ` · ${ev.amount}` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Academic summary strip */}
      <section className={`${PANEL} grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <SummaryField label={t('admin.modules.srf.detail.program')} value={student.program || '—'} />
        <SummaryField label={t('admin.modules.srf.detail.level')} value={student.academic_level || '—'} />
        <SummaryField label={t('admin.modules.srf.detail.classGroup')} value={student.class_group || '—'} />
        <SummaryField
          label={t('admin.modules.srf.detail.academicYear')}
          value={student.academic_year || account.current_academic_year || '—'}
        />
      </section>
    </div>
  );
};

function SectionTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-sm font-semibold uppercase tracking-wide text-[var(--admin-brand)] ${className}`}
    >
      {children}
    </h2>
  );
}

function HeroStat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)]/80 bg-[color-mix(in_srgb,var(--admin-bg-elevated)_85%,transparent)] px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">
        {label}
      </p>
      <p
        className={`mt-0.5 font-bold tabular-nums text-[var(--admin-text)] ${small ? 'truncate text-sm' : 'text-lg'}`}
      >
        {value}
      </p>
    </div>
  );
}

function MetricChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? 'border-[var(--admin-brand)]/30 bg-[color-mix(in_srgb,var(--admin-brand)_10%,var(--admin-bg-subtle))]'
          : 'border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]'
      }`}
    >
      <p className="text-xs text-[var(--admin-text-secondary)]">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--admin-text-secondary)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--admin-text)]">{value}</p>
    </div>
  );
}

export default SrfStudentDetailView;
