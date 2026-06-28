import { type CSSProperties, FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BookX, ChevronDown, Clock, Plus, ShieldX, Trash2 } from 'lucide-react';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import type { SrfWarningTier } from '../../../api/srfConfig';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import { SrfConfigSectionShell, SRF_CONFIG_BTN_PRIMARY } from '../ui/SrfConfigPrimitives';
import { easePremium } from '../../../dashboard/ui/animations';

const PREFIX = 'admin.modules.srf.configCenter.warningTiers';

// ─── Severity color system ────────────────────────────────────────────────────

interface SeverityStyle {
  dot: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  cardGlow: string;
  label: string;
}

const SEVERITY: Record<string, SeverityStyle> = {
  LOW: {
    dot: '#10b981',
    border: 'rgba(16,185,129,.40)',
    badgeBg: 'rgba(16,185,129,.14)',
    badgeText: '#10b981',
    cardGlow: 'rgba(16,185,129,.06)',
    label: 'LOW',
  },
  MEDIUM: {
    dot: '#155dfc',
    border: 'rgba(21,93,252,.40)',
    badgeBg: 'rgba(21,93,252,.12)',
    badgeText: '#155dfc',
    cardGlow: 'rgba(21,93,252,.06)',
    label: 'MEDIUM',
  },
  HIGH: {
    dot: '#f59e0b',
    border: 'rgba(245,158,11,.45)',
    badgeBg: 'rgba(245,158,11,.14)',
    badgeText: '#d97706',
    cardGlow: 'rgba(245,158,11,.06)',
    label: 'HIGH',
  },
  CRITICAL: {
    dot: '#ef4444',
    border: 'rgba(239,68,68,.45)',
    badgeBg: 'rgba(239,68,68,.14)',
    badgeText: '#ef4444',
    cardGlow: 'rgba(239,68,68,.06)',
    label: 'CRITICAL',
  },
};

const getSeverity = (s: string): SeverityStyle => SEVERITY[s] ?? SEVERITY.MEDIUM;

// ─── Tier card ────────────────────────────────────────────────────────────────

interface TierCardProps {
  tier: SrfWarningTier;
  isLast: boolean;
  index: number;
  onDelete: (id: number) => Promise<void>;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

const TierCard: FunctionComponent<TierCardProps> = ({ tier, isLast, index, onDelete, t }) => {
  const sv = getSeverity(tier.severity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: easePremium }}
      className="relative pb-0"
    >
      {/* Timeline dot */}
      <span
        className="absolute -start-[2.4rem] top-5 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-4 ring-[var(--admin-bg-elevated)]"
        style={{ background: sv.dot }}
        aria-hidden
      >
        <span className="h-2 w-2 rounded-full bg-white/60" />
      </span>

      {/* Card */}
      <article
        className="group relative overflow-hidden rounded-2xl border bg-[var(--admin-bg-elevated)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--admin-shadow-md)]"
        style={
          {
            borderColor: sv.border,
            '--card-glow': sv.cardGlow,
          } as CSSProperties
        }
      >
        {/* Left accent bar */}
        <span
          className="pointer-events-none absolute inset-y-0 start-0 w-[4px]"
          style={{ background: sv.dot }}
          aria-hidden
        />

        {/* Subtle gradient fill */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${sv.cardGlow} 0%, transparent 65%)`,
          }}
          aria-hidden
        />

        <div className="relative ps-5 pe-4 pt-4 pb-3">
          {/* Row 1 – title + severity + delete */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight text-[var(--admin-text)]">{tier.label}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--admin-text-secondary)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t(`${PREFIX}.daysBefore`, { days: tier.days_before_exam_start })}
                </span>
                <span className="opacity-40">·</span>
                <span>{t(`${PREFIX}.everyDays`, { days: tier.reminder_interval_days })}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Severity badge */}
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase"
                style={{ background: sv.badgeBg, color: sv.badgeText }}
              >
                {sv.label}
              </span>

              {/* Delete */}
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-[var(--admin-text-muted)] transition-all duration-150 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => void onDelete(tier.id)}
                aria-label={t(`${PREFIX}.deleteTier`, { defaultValue: 'Delete tier' })}
              >
                <Trash2 className="h-[15px] w-[15px]" />
              </button>
            </div>
          </div>

          {/* Row 2 – restriction tags */}
          {(tier.block_convention || tier.block_exams) ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tier.block_convention ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                  <ShieldX className="h-3 w-3" />
                  {t(`${PREFIX}.blockConvention`)}
                </span>
              ) : null}
              {tier.block_exams ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/12 px-2.5 py-1 text-[11px] font-semibold text-red-500">
                  <BookX className="h-3 w-3" />
                  {t(`${PREFIX}.blockExams`)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Escalation footer (all cards except last) */}
        {!isLast ? (
          <div className="flex items-center gap-2 border-t border-[var(--admin-border)]/60 px-5 py-2">
            <ChevronDown className="h-3.5 w-3.5 text-[var(--admin-brand)]" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-brand)]">
              {t(`${PREFIX}.escalation`)}
            </span>
          </div>
        ) : null}
      </article>
    </motion.div>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

interface Props {
  tiers: SrfWarningTier[];
  saving: boolean;
  onSave: (id: number | null, payload: Partial<SrfWarningTier>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const WarningTiersSection: FunctionComponent<Props> = ({ tiers, saving, onSave, onDelete }) => {
  const { t } = useTranslation();

  const [draft, setDraft] = useState<Partial<SrfWarningTier>>({
    label: '',
    days_before_exam_start: 30,
    severity: 'MEDIUM',
    reminder_interval_days: 7,
    block_convention: false,
    block_exams: false,
    is_active: true,
  });

  const severityOptions = useMemo(
    () =>
      ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => ({
        value: s,
        label: t(`${PREFIX}.severityOptions.${s}`),
      })),
    [t],
  );

  const sorted = [...tiers].sort((a, b) => b.days_before_exam_start - a.days_before_exam_start);

  const addTier = async () => {
    if (!draft.label?.trim()) return;
    await onSave(null, { ...draft, sort_order: tiers.length + 1 } as Partial<SrfWarningTier>);
    setDraft({
      label: '',
      days_before_exam_start: 14,
      severity: 'MEDIUM',
      reminder_interval_days: 2,
      block_convention: false,
      block_exams: false,
      is_active: true,
    });
  };

  return (
    <SrfConfigSectionShell icon={Bell} title={t(`${PREFIX}.title`)} subtitle={t(`${PREFIX}.subtitle`)}>
      {/* ── Tier timeline ────────────────────────────────── */}
      {sorted.length === 0 ? (
        <SrfPremiumEmpty
          icon={Bell}
          title={t(`${PREFIX}.emptyTitle`)}
          description={t(`${PREFIX}.emptyDesc`)}
        />
      ) : (
        <div className="relative mb-8 space-y-4 border-s-2 border-dashed border-[var(--admin-brand)]/25 ps-8">
          <AnimatePresence initial={false}>
            {sorted.map((tier, idx) => (
              <TierCard
                key={tier.id}
                tier={tier}
                isLast={idx === sorted.length - 1}
                index={idx}
                onDelete={onDelete}
                t={t}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add Tier form ────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_4%,var(--admin-bg-elevated))] p-5 transition-colors hover:border-[color-mix(in_srgb,var(--admin-brand)_25%,var(--admin-border))]">
        {/* Form header */}
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)]">
            <Plus className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.addTier`)}</p>
            <p className="text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.addTierHint`)}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminFormField label={t(`${PREFIX}.label`)}>
            <AdminFormInput
              value={draft.label || ''}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder={t(`${PREFIX}.labelPlaceholder`, { defaultValue: 'e.g. Early warning' })}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.daysBeforeLabel`)}>
            <AdminFormInput
              type="number"
              value={draft.days_before_exam_start ?? 30}
              onChange={(e) => setDraft((d) => ({ ...d, days_before_exam_start: Number(e.target.value) }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.interval`)}>
            <AdminFormInput
              type="number"
              value={draft.reminder_interval_days ?? 7}
              onChange={(e) => setDraft((d) => ({ ...d, reminder_interval_days: Number(e.target.value) }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.severity`)}>
            <AdminCustomSelect
              value={draft.severity || 'MEDIUM'}
              onChange={(v) => setDraft((d) => ({ ...d, severity: v }))}
              options={severityOptions}
            />
          </AdminFormField>
        </div>

        {/* Toggles */}
        <div className="mt-3 grid gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-2.5 sm:grid-cols-2">
          <AdminFormSwitch
            id="tier-block-convention"
            label={t(`${PREFIX}.blockConvention`)}
            checked={!!draft.block_convention}
            onChange={(v) => setDraft((d) => ({ ...d, block_convention: v }))}
          />
          <AdminFormSwitch
            id="tier-block-exams"
            label={t(`${PREFIX}.blockExams`)}
            checked={!!draft.block_exams}
            onChange={(v) => setDraft((d) => ({ ...d, block_exams: v }))}
          />
        </div>

        {/* Submit */}
        <div className="mt-4 border-t border-[var(--admin-border)]/50 pt-4">
          {!draft.label?.trim() ? (
            <p className="mb-2.5 text-xs text-[var(--admin-text-muted)]">
              {t(`${PREFIX}.labelRequired`, { defaultValue: 'Enter a label to continue' })}
            </p>
          ) : null}
          <button
            type="button"
            disabled={saving || !draft.label?.trim()}
            onClick={() => void addTier()}
            className="admin-btn-primary admin-form-btn inline-flex h-10 !w-auto items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t(`${PREFIX}.addTier`)}
          </button>
        </div>
      </div>
    </SrfConfigSectionShell>
  );
};

export default WarningTiersSection;
