import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Layers, Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import AdminBadge from '../../../ui/AdminBadge';
import AdminModal from '../../../ui/AdminModal';
import AdminCustomSelect, { type AdminSelectOption } from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import { academicReferenceApi } from '../../../api/reference';
import type { AcademicLevelOption, AcademicYearOption, FiliereOption } from '../../../api/types';
import type {
  SrfExamGateMode,
  SrfInstallmentPlanTemplate,
  SrfInstallmentPlanTranche,
  SrfRestrictionPolicy,
} from '../../../api/srfConfig';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import { SrfConfigSectionShell } from '../ui/SrfConfigPrimitives';

const PREFIX = 'admin.modules.srf.configCenter.installmentPlans';

interface Props {
  plans: SrfInstallmentPlanTemplate[];
  policy: SrfRestrictionPolicy;
  saving: boolean;
  onSave: (id: number | null, payload: Record<string, unknown>) => Promise<boolean>;
  onDelete: (id: number) => Promise<void>;
  onSavePolicy: (payload: Partial<SrfRestrictionPolicy>) => Promise<void>;
}

interface TrancheForm {
  label: string;
  percentage: string;
  due_date: string;
  semester: string;
}

const emptyTranche = (n: number): TrancheForm => ({
  label: `Tranche ${n}`,
  percentage: '',
  due_date: '',
  semester: '1',
});

const emptyForm = () => ({
  name: '',
  description: '',
  filiere: '',
  academic_level: '',
  academic_year: '',
  split_mode: 'CUSTOM' as 'EQUAL' | 'CUSTOM',
  currency: 'MAD',
  is_mandatory: true,
  is_active: true,
  notes: '',
  tranches: [emptyTranche(1), emptyTranche(2), emptyTranche(3)] as TrancheForm[],
});

function formatShortDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

const InstallmentPlanSection: FunctionComponent<Props> = ({
  plans,
  policy,
  saving,
  onSave,
  onDelete,
  onSavePolicy,
}) => {
  const { t, i18n } = useTranslation();
  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [levels, setLevels] = useState<AcademicLevelOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SrfInstallmentPlanTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void academicReferenceApi.listFilieres({ lang: i18n.language }).then(setFilieres);
    void academicReferenceApi
      .listAcademicYears({ structured: true, lang: i18n.language })
      .then((data) => setYears(data as AcademicYearOption[]));
  }, [i18n.language]);

  useEffect(() => {
    const fid = form.filiere ? Number(form.filiere) : 0;
    if (!fid) {
      setLevels([]);
      return;
    }
    void academicReferenceApi
      .listAcademicLevels({ filiere_ids: [fid], lang: i18n.language })
      .then((data) => setLevels(data as AcademicLevelOption[]));
  }, [form.filiere, i18n.language]);

  const filiereOptions: AdminSelectOption[] = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.allPrograms`) },
      ...filieres.map((f) => ({ value: String(f.id), label: f.name })),
    ],
    [filieres, t],
  );
  const yearOptions: AdminSelectOption[] = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.allYears`) },
      ...years.map((y) => ({ value: String(y.id), label: y.label || y.code })),
    ],
    [years, t],
  );
  const levelOptions: AdminSelectOption[] = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.allLevels`) },
      ...levels.map((l) => ({ value: String(l.id), label: l.name || l.code })),
    ],
    [levels, t],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (p: SrfInstallmentPlanTemplate) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      filiere: p.filiere ? String(p.filiere) : '',
      academic_level: p.academic_level ? String(p.academic_level) : '',
      academic_year: p.academic_year ? String(p.academic_year) : '',
      split_mode: p.split_mode,
      currency: p.currency,
      is_mandatory: p.is_mandatory,
      is_active: p.is_active,
      notes: p.notes || '',
      tranches: p.tranches.map((tr) => ({
        label: tr.label,
        percentage: String(tr.percentage ?? ''),
        due_date: tr.due_date,
        semester: String(tr.semester ?? '1'),
      })),
    });
    setModalOpen(true);
  };

  const totalPct = useMemo(
    () => form.tranches.reduce((sum, tr) => sum + (Number(tr.percentage) || 0), 0),
    [form.tranches],
  );

  const updateTranche = (idx: number, patch: Partial<TrancheForm>) => {
    setForm((f) => ({
      ...f,
      tranches: f.tranches.map((tr, i) => (i === idx ? { ...tr, ...patch } : tr)),
    }));
  };

  const addTranche = () => {
    setForm((f) => ({ ...f, tranches: [...f.tranches, emptyTranche(f.tranches.length + 1)] }));
  };

  const removeTranche = (idx: number) => {
    setForm((f) => ({ ...f, tranches: f.tranches.filter((_, i) => i !== idx) }));
  };

  const datesComplete = form.tranches.every((tr) => tr.due_date);
  const pctValid = form.split_mode === 'EQUAL' || Math.round(totalPct) === 100;
  const canSave = Boolean(form.name) && form.tranches.length > 0 && datesComplete && pctValid;

  const submit = async () => {
    const tranches: SrfInstallmentPlanTranche[] = form.tranches.map((tr, idx) => ({
      tranche_number: idx + 1,
      label: tr.label || `Tranche ${idx + 1}`,
      percentage:
        form.split_mode === 'EQUAL'
          ? Number((100 / form.tranches.length).toFixed(2))
          : Number(tr.percentage) || 0,
      due_date: tr.due_date,
      semester: Number(tr.semester) || 1,
    }));
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      split_mode: form.split_mode,
      currency: form.currency,
      number_of_tranches: tranches.length,
      is_mandatory: form.is_mandatory,
      is_active: form.is_active,
      notes: form.notes,
      filiere: form.filiere ? Number(form.filiere) : null,
      academic_level: form.academic_level ? Number(form.academic_level) : null,
      academic_year: form.academic_year ? Number(form.academic_year) : null,
      tranches,
    };
    const ok = await onSave(editing?.id ?? null, payload);
    if (ok) setModalOpen(false);
  };

  const gateOptions: AdminSelectOption[] = [
    { value: 'DUE_TRANCHES', label: t(`${PREFIX}.gate.dueTranches`) },
    { value: 'FULL_CLEARANCE', label: t(`${PREFIX}.gate.fullClearance`) },
  ];

  return (
    <SrfConfigSectionShell
      icon={Wallet}
      title={t(`${PREFIX}.title`)}
      subtitle={t(`${PREFIX}.subtitle`)}
      action={
        <button
          type="button"
          onClick={openCreate}
          className="admin-btn-primary admin-form-btn inline-flex h-9 !w-auto items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          {t(`${PREFIX}.addPlan`)}
        </button>
      }
    >
      {/* Exam gate mode */}
      <div className="mb-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.gate.title`)}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--admin-text-secondary)]">
              {t(`${PREFIX}.gate.desc`)}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <AdminCustomSelect
              value={policy.exam_gate_mode}
              onChange={(v) => void onSavePolicy({ exam_gate_mode: v as SrfExamGateMode })}
              options={gateOptions}
            />
          </div>
        </div>
      </div>

      {plans.length === 0 ? (
        <SrfPremiumEmpty
          icon={Layers}
          title={t(`${PREFIX}.emptyTitle`)}
          description={t(`${PREFIX}.emptyDesc`)}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((p) => (
            <article
              key={p.id}
              className="group rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/50 p-4 transition-all hover:border-[var(--admin-brand)]/35 hover:shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--admin-text)]">{p.name}</p>
                  <p className="text-xs text-[var(--admin-text-secondary)]">
                    {p.filiere_name || t(`${PREFIX}.allPrograms`)} ·{' '}
                    {p.academic_level_label || t(`${PREFIX}.allLevels`)} ·{' '}
                    {p.academic_year_code || t(`${PREFIX}.allYears`)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {p.is_mandatory ? (
                    <AdminBadge variant="warning">{t(`${PREFIX}.mandatory`)}</AdminBadge>
                  ) : null}
                  <AdminBadge variant={p.is_active ? 'success' : 'neutral'}>
                    {p.is_active ? t(`${PREFIX}.active`) : t(`${PREFIX}.inactive`)}
                  </AdminBadge>
                </div>
              </div>

              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-brand)]">
                {t(`${PREFIX}.trancheCount`, { count: p.tranches.length })} ·{' '}
                {p.split_mode === 'EQUAL' ? t(`${PREFIX}.splitEqual`) : t(`${PREFIX}.splitCustom`)}
              </p>

              <ul className="space-y-1.5">
                {p.tranches.map((tr) => (
                  <li
                    key={`${p.id}-${tr.tranche_number}`}
                    className="flex items-center justify-between rounded-lg bg-[var(--admin-bg-elevated)] px-3 py-2 text-xs ring-1 ring-[var(--admin-border)]"
                  >
                    <span className="font-medium text-[var(--admin-text)]">
                      {tr.label}{' '}
                      <span className="font-normal text-[var(--admin-text-secondary)]">· S{tr.semester}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-semibold text-[var(--admin-brand)]">{Number(tr.percentage)}%</span>
                      <span className="text-[var(--admin-text-secondary)]">{formatShortDate(tr.due_date)}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-end gap-1 border-t border-[var(--admin-border)]/60 pt-3">
                <button type="button" className="admin-btn-ghost rounded-lg p-2" onClick={() => openEdit(p)} aria-label={t(`${PREFIX}.editPlan`)}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost rounded-lg p-2 text-red-500"
                  onClick={() => void onDelete(p.id)}
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t(`${PREFIX}.editPlan`) : t(`${PREFIX}.addPlan`)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label={t(`${PREFIX}.name`)} className="sm:col-span-2">
            <AdminFormInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.program`)}>
            <AdminCustomSelect
              value={form.filiere}
              onChange={(v) => setForm((f) => ({ ...f, filiere: v, academic_level: '' }))}
              options={filiereOptions}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.level`)}>
            <AdminCustomSelect
              value={form.academic_level}
              onChange={(v) => setForm((f) => ({ ...f, academic_level: v }))}
              options={levelOptions}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.academicYear`)}>
            <AdminCustomSelect
              value={form.academic_year}
              onChange={(v) => setForm((f) => ({ ...f, academic_year: v }))}
              options={yearOptions}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.splitMode`)}>
            <AdminCustomSelect
              value={form.split_mode}
              onChange={(v) => setForm((f) => ({ ...f, split_mode: v as 'EQUAL' | 'CUSTOM' }))}
              options={[
                { value: 'CUSTOM', label: t(`${PREFIX}.splitCustom`) },
                { value: 'EQUAL', label: t(`${PREFIX}.splitEqual`) },
              ]}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.currency`)}>
            <AdminFormInput value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          </AdminFormField>
        </div>

        {/* Tranches editor */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.tranches`)}</p>
            {form.split_mode === 'CUSTOM' ? (
              <span className={`text-xs font-semibold ${pctValid ? 'text-emerald-600' : 'text-red-500'}`}>
                {t(`${PREFIX}.totalPct`, { pct: totalPct })}
              </span>
            ) : null}
          </div>
          <div className="space-y-2">
            {form.tranches.map((tr, idx) => (
              <div
                key={idx}
                className="grid items-end gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/50 p-3 sm:grid-cols-[1.4fr_0.8fr_1fr_0.7fr_auto]"
              >
                <AdminFormField label={t(`${PREFIX}.trancheLabel`)}>
                  <AdminFormInput value={tr.label} onChange={(e) => updateTranche(idx, { label: e.target.value })} />
                </AdminFormField>
                <AdminFormField label={t(`${PREFIX}.percentage`)}>
                  <AdminFormInput
                    type="number"
                    min={0}
                    max={100}
                    value={form.split_mode === 'EQUAL' ? (100 / form.tranches.length).toFixed(1) : tr.percentage}
                    disabled={form.split_mode === 'EQUAL'}
                    onChange={(e) => updateTranche(idx, { percentage: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label={t(`${PREFIX}.dueDate`)}>
                  <AdminFormInput
                    type="date"
                    value={tr.due_date}
                    onChange={(e) => updateTranche(idx, { due_date: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label={t(`${PREFIX}.semester`)}>
                  <AdminCustomSelect
                    value={tr.semester}
                    onChange={(v) => updateTranche(idx, { semester: v })}
                    options={[
                      { value: '1', label: 'S1' },
                      { value: '2', label: 'S2' },
                    ]}
                  />
                </AdminFormField>
                <button
                  type="button"
                  className="admin-btn-ghost mb-1 rounded-lg p-2 text-red-500 disabled:opacity-40"
                  onClick={() => removeTranche(idx)}
                  disabled={form.tranches.length <= 1}
                  aria-label="remove tranche"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTranche}
            className="admin-btn-secondary mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-dashed px-4 text-sm font-semibold transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            {t(`${PREFIX}.addTranche`)}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3">
            <AdminFormSwitch
              id="plan-mandatory"
              label={t(`${PREFIX}.mandatory`)}
              checked={form.is_mandatory}
              onChange={(v) => setForm((f) => ({ ...f, is_mandatory: v }))}
            />
          </div>
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3">
            <AdminFormSwitch
              id="plan-active"
              label={t(`${PREFIX}.active`)}
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--admin-border)]/70 pt-5">
          <button
            type="button"
            className="admin-btn-secondary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200"
            onClick={() => setModalOpen(false)}
          >
            {t(`${PREFIX}.cancel`)}
          </button>
          <button
            type="button"
            disabled={saving || !canSave}
            onClick={() => void submit()}
            className="admin-btn-primary inline-flex h-10 min-w-[8.5rem] items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saving ? t(`${PREFIX}.saving`) : t(`${PREFIX}.save`)}
          </button>
        </div>
      </AdminModal>
    </SrfConfigSectionShell>
  );
};

export default InstallmentPlanSection;
