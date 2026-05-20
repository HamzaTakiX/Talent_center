import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Plus, Trash2, TrendingUp } from 'lucide-react';
import AdminBadge from '../../../ui/AdminBadge';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import type { SrfWarningTier } from '../../../api/srfConfig';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import { SrfConfigSectionShell, SrfConfigSettingCard, SRF_CONFIG_BTN_PRIMARY } from '../ui/SrfConfigPrimitives';

const PREFIX = 'admin.modules.srf.configCenter.warningTiers';

const severityVariant = (s: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (s === 'CRITICAL') return 'danger';
  if (s === 'HIGH') return 'warning';
  if (s === 'LOW') return 'success';
  return 'neutral';
};

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
    await onSave(null, {
      ...draft,
      sort_order: tiers.length + 1,
    } as Partial<SrfWarningTier>);
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
    <SrfConfigSectionShell
      icon={Bell}
      title={t(`${PREFIX}.title`)}
      subtitle={t(`${PREFIX}.subtitle`)}
    >
      {sorted.length === 0 ? (
        <SrfPremiumEmpty
          icon={Bell}
          title={t(`${PREFIX}.emptyTitle`)}
          description={t(`${PREFIX}.emptyDesc`)}
        />
      ) : (
        <div className="relative mb-8 border-s-2 border-dashed border-[var(--admin-brand)]/30 ps-8">
          {sorted.map((tier, idx) => (
            <div key={tier.id} className="relative pb-8 last:pb-2">
              <span className="absolute -start-[2.15rem] top-2 flex h-4 w-4 rounded-full bg-[var(--admin-brand)] ring-4 ring-[var(--admin-bg-elevated)]" />
              <article className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/60 p-4 transition-all hover:border-[var(--admin-brand)]/30 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--admin-text)]">{tier.label}</p>
                    <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
                      {t(`${PREFIX}.daysBefore`, { days: tier.days_before_exam_start })} ·{' '}
                      {t(`${PREFIX}.everyDays`, { days: tier.reminder_interval_days })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminBadge variant={severityVariant(tier.severity)}>{tier.severity}</AdminBadge>
                    <button
                      type="button"
                      className="admin-btn-ghost rounded-lg p-2 text-red-500"
                      onClick={() => void onDelete(tier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tier.block_convention ? (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-amber-600">
                      {t(`${PREFIX}.blockConvention`)}
                    </span>
                  ) : null}
                  {tier.block_exams ? (
                    <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                      {t(`${PREFIX}.blockExams`)}
                    </span>
                  ) : null}
                </div>
                {idx < sorted.length - 1 ? (
                  <p className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
                    <TrendingUp className="h-3 w-3" />
                    {t(`${PREFIX}.escalation`)}
                  </p>
                ) : null}
              </article>
            </div>
          ))}
        </div>
      )}

      <SrfConfigSettingCard icon={Plus} title={t(`${PREFIX}.addTier`)} description={t(`${PREFIX}.addTierHint`)}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminFormField label={t(`${PREFIX}.label`)}>
            <AdminFormInput value={draft.label || ''} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
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
        <div className="mt-4 grid gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 sm:grid-cols-2">
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
        <button type="button" className={`${SRF_CONFIG_BTN_PRIMARY} mt-4`} disabled={saving} onClick={() => void addTier()}>
          <Plus className="h-4 w-4" />
          {t(`${PREFIX}.addTier`)}
        </button>
      </SrfConfigSettingCard>
    </SrfConfigSectionShell>
  );
};

export default WarningTiersSection;
