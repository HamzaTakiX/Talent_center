import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import AdminBadge from '../../../ui/AdminBadge';
import AdminModal from '../../../ui/AdminModal';
import AdminCustomSelect, { type AdminSelectOption } from '../../../ui/AdminCustomSelect';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import { adminFormBtnSecondaryClass } from '../../../shared/forms/adminFormClasses';
import { academicReferenceApi } from '../../../api/reference';
import type { AcademicLevelOption, AcademicYearOption, FiliereOption } from '../../../api/types';
import type { SrfExamPeriodConfig } from '../../../api/srfConfig';
import SrfPremiumEmpty from '../../components/student-detail/SrfPremiumEmpty';
import { SrfConfigSectionShell, SRF_CONFIG_BTN_PRIMARY } from '../ui/SrfConfigPrimitives';

const PREFIX = 'admin.modules.srf.configCenter.examPlanning';

interface Props {
  periods: SrfExamPeriodConfig[];
  saving: boolean;
  onSave: (id: number | null, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const emptyForm = () => ({
  filiere: '',
  academic_level: '',
  academic_year: '',
  semester: '1',
  exam_start: '',
  exam_end: '',
  convention_block_date: '',
  payment_deadline: '',
  warning_days_before: '14',
  is_active: true,
  notes: '',
});

function formatShortDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

const ExamPlanningSection: FunctionComponent<Props> = ({ periods, saving, onSave, onDelete }) => {
  const { t, i18n } = useTranslation();
  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [levels, setLevels] = useState<AcademicLevelOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SrfExamPeriodConfig | null>(null);
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
    () => filieres.map((f) => ({ value: String(f.id), label: f.name })),
    [filieres],
  );
  const yearOptions: AdminSelectOption[] = useMemo(
    () => years.map((y) => ({ value: String(y.id), label: y.label || y.code })),
    [years],
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

  const openEdit = (p: SrfExamPeriodConfig) => {
    setEditing(p);
    setForm({
      filiere: String(p.filiere),
      academic_level: p.academic_level ? String(p.academic_level) : '',
      academic_year: String(p.academic_year),
      semester: String(p.semester),
      exam_start: p.exam_start,
      exam_end: p.exam_end,
      convention_block_date: p.convention_block_date || '',
      payment_deadline: p.payment_deadline || '',
      warning_days_before: String(p.warning_days_before),
      is_active: p.is_active,
      notes: p.notes || '',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const payload: Record<string, unknown> = {
      filiere: Number(form.filiere),
      academic_year: Number(form.academic_year),
      semester: Number(form.semester),
      exam_start: form.exam_start,
      exam_end: form.exam_end,
      warning_days_before: Number(form.warning_days_before),
      is_active: form.is_active,
      notes: form.notes,
    };
    if (form.academic_level) payload.academic_level = Number(form.academic_level);
    if (form.convention_block_date) payload.convention_block_date = form.convention_block_date;
    if (form.payment_deadline) payload.payment_deadline = form.payment_deadline;
    await onSave(editing?.id ?? null, payload);
    setModalOpen(false);
  };

  return (
    <SrfConfigSectionShell
      icon={Calendar}
      title={t(`${PREFIX}.title`)}
      subtitle={t(`${PREFIX}.subtitle`)}
      action={
        <button type="button" className={SRF_CONFIG_BTN_PRIMARY} onClick={openCreate}>
          <CalendarPlus className="h-4 w-4" />
          {t(`${PREFIX}.addPeriod`)}
        </button>
      }
    >
      {periods.length === 0 ? (
        <SrfPremiumEmpty
          icon={Calendar}
          title={t(`${PREFIX}.emptyTitle`)}
          description={t(`${PREFIX}.emptyDesc`)}
          action={
            <button type="button" className={SRF_CONFIG_BTN_PRIMARY} onClick={openCreate}>
              <CalendarPlus className="h-4 w-4" />
              {t(`${PREFIX}.addPeriod`)}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {periods.map((p) => (
            <article
              key={p.id}
              className="group rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)]/50 p-4 transition-all hover:border-[var(--admin-brand)]/35 hover:shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--admin-text)]">{p.filiere_name}</p>
                  <p className="text-xs text-[var(--admin-text-secondary)]">
                    {p.academic_level_label || t(`${PREFIX}.allLevels`)} · {p.academic_year_code} · S
                    {p.semester}
                  </p>
                </div>
                <AdminBadge variant={p.is_active ? 'success' : 'neutral'}>
                  {p.is_active ? t(`${PREFIX}.active`) : t(`${PREFIX}.inactive`)}
                </AdminBadge>
              </div>

              <div className="mb-3 rounded-lg bg-[var(--admin-bg-elevated)] p-3 ring-1 ring-[var(--admin-border)]">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
                  {t(`${PREFIX}.timelineLabel`)}
                </p>
                <div className="relative h-2 overflow-hidden rounded-full bg-[var(--admin-border)]">
                  <span className="absolute inset-y-0 start-[8%] end-[8%] rounded-full bg-gradient-to-r from-[var(--admin-brand)]/40 via-[var(--admin-brand)] to-[var(--admin-brand)]/40" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[var(--admin-text-secondary)]">
                  <span>{formatShortDate(p.exam_start)}</span>
                  <span className="font-medium text-[var(--admin-text)]">{t(`${PREFIX}.examWindow`)}</span>
                  <span>{formatShortDate(p.exam_end)}</span>
                </div>
              </div>

              <ul className="space-y-1 text-xs text-[var(--admin-text-secondary)]">
                {p.payment_deadline ? (
                  <li>
                    {t(`${PREFIX}.payment`)}: <strong className="text-[var(--admin-text)]">{formatShortDate(p.payment_deadline)}</strong>
                  </li>
                ) : null}
                {p.convention_block_date ? (
                  <li>
                    {t(`${PREFIX}.convention`)}:{' '}
                    <strong className="text-[var(--admin-text)]">{formatShortDate(p.convention_block_date)}</strong>
                  </li>
                ) : null}
                <li>
                  {t(`${PREFIX}.warningDays`)}: {p.warning_days_before}
                </li>
              </ul>

              <div className="mt-4 flex justify-end gap-1 border-t border-[var(--admin-border)]/60 pt-3">
                <button type="button" className="admin-btn-ghost rounded-lg p-2" onClick={() => openEdit(p)} aria-label={t(`${PREFIX}.editPeriod`)}>
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
        title={editing ? t(`${PREFIX}.editPeriod`) : t(`${PREFIX}.addPeriod`)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
          <AdminFormField label={t(`${PREFIX}.semester`)}>
            <AdminCustomSelect
              value={form.semester}
              onChange={(v) => setForm((f) => ({ ...f, semester: v }))}
              options={[
                { value: '1', label: 'S1' },
                { value: '2', label: 'S2' },
              ]}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.examStart`)}>
            <AdminFormInput
              type="date"
              value={form.exam_start}
              onChange={(e) => setForm((f) => ({ ...f, exam_start: e.target.value }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.examEnd`)}>
            <AdminFormInput
              type="date"
              value={form.exam_end}
              onChange={(e) => setForm((f) => ({ ...f, exam_end: e.target.value }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.paymentDeadline`)}>
            <AdminFormInput
              type="date"
              value={form.payment_deadline}
              onChange={(e) => setForm((f) => ({ ...f, payment_deadline: e.target.value }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.conventionBlock`)}>
            <AdminFormInput
              type="date"
              value={form.convention_block_date}
              onChange={(e) => setForm((f) => ({ ...f, convention_block_date: e.target.value }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.warningDays`)}>
            <AdminFormInput
              type="number"
              min={1}
              value={form.warning_days_before}
              onChange={(e) => setForm((f) => ({ ...f, warning_days_before: e.target.value }))}
            />
          </AdminFormField>
          <AdminFormField label={t(`${PREFIX}.notes`)} className="sm:col-span-2">
            <AdminFormInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </AdminFormField>
          <div className="sm:col-span-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3">
            <AdminFormSwitch
              id="exam-period-active"
              label={t(`${PREFIX}.active`)}
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={`${adminFormBtnSecondaryClass} w-auto px-4`} onClick={() => setModalOpen(false)}>
            {t(`${PREFIX}.cancel`)}
          </button>
          <button type="button" className={SRF_CONFIG_BTN_PRIMARY} disabled={saving || !form.filiere} onClick={() => void submit()}>
            {t(`${PREFIX}.save`)}
          </button>
        </div>
      </AdminModal>
    </SrfConfigSectionShell>
  );
};

export default ExamPlanningSection;
