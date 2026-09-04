import { FormEvent, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Settings2,
  ToggleLeft,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../ui/AdminModal';
import AdminToggle from '../../account/components/AdminToggle';
import AdminCustomSelect from '../../ui/AdminCustomSelect';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../shared/forms/AdminFormPrimitives';
import AdminTagMultiSelect, { type TagOption } from '../../shared/forms/AdminTagMultiSelect';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../shared/forms/adminFormClasses';
import { academicReferenceApi } from '../../api/reference';
import type { AcademicLevelOption, SpecializationDomainOption } from '../../api/types';
import type {
  AcademicClassRow,
  AcademicLevelRow,
  AcademicStructureTab,
  AcademicTrackRow,
  InternshipFrameworkRow,
  WorkModeRow,
} from '../types/academicStructureTypes';
import type {
  AcademicStructureFormMode,
  AcademicStructureFormSubmitPayload,
  AcademicStructureFormValues,
} from '../types/academicStructureFormTypes';
import { DEFAULT_FORM_VALUES } from '../types/academicStructureFormTypes';
import AcademicStructureDurationInput from './form/AcademicStructureDurationInput';
import AcademicStructureEntitySelect, {
  type AcademicEntitySelectOption,
} from './form/AcademicStructureEntitySelect';
import AcademicStructureFormSection from './form/AcademicStructureFormSection';
import AcademicStructurePreviewCard from './form/AcademicStructurePreviewCard';
import AcademicStructureStepperInput from './form/AcademicStructureStepperInput';
import { formatDurationHint, parseDurationHint } from '../utils/academicStructureDuration';
import {
  hasValidationErrors,
  validateAcademicStructureForm,
  type FormValidationErrors,
} from '../utils/academicStructureFormValidation';
import { humanizeProgramFamily } from '../utils/academicStructureDisplay';

const PREFIX = 'admin.modules.academicStructure';
const FORM_PREFIX = `${PREFIX}.form`;

interface EntityFormDialogProps {
  open: boolean;
  tab: AcademicStructureTab;
  mode: AcademicStructureFormMode;
  editRow: Record<string, unknown> | null;
  tracks: AcademicTrackRow[];
  levels: AcademicLevelRow[];
  classes: AcademicClassRow[];
  internshipTypes: InternshipFrameworkRow[];
  workModes: WorkModeRow[];
  onClose: () => void;
  onSave: (payload: AcademicStructureFormSubmitPayload) => Promise<void>;
}

function buildInitialValues(
  editRow: Record<string, unknown> | null,
  tracks: AcademicTrackRow[],
  mode: AcademicStructureFormMode,
): AcademicStructureFormValues {
  if (!editRow) {
    return {
      ...DEFAULT_FORM_VALUES,
      filiere_id: tracks[0]?.id ?? 0,
    };
  }

  const duration = parseDurationHint(String(editRow.duration_hint ?? ''));
  const rawDomainIds = editRow.specialization_domain_ids;
  const domainIds = Array.isArray(rawDomainIds)
    ? rawDomainIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
    : [];
  const base: AcademicStructureFormValues = {
    name_fr: String(editRow.name_fr ?? ''),
    name_en: String(editRow.name_en ?? editRow.name ?? ''),
    code: mode === 'duplicate' ? `${String(editRow.code ?? '')}_COPY` : String(editRow.code ?? ''),
    description: String(editRow.description ?? ''),
    program_family: String(editRow.program_family ?? 'PGE'),
    sort_order: Number(editRow.sort_order ?? 0),
    is_active: Boolean(editRow.is_active ?? true),
    filiere_id: Number(editRow.filiere_id ?? editRow.filiere ?? tracks[0]?.id ?? 0),
    academic_level_id: Number(editRow.academic_level_id ?? 0),
    academic_year: String(editRow.academic_year ?? '2025-2026'),
    duration_value: duration.value,
    duration_unit: duration.unit,
    specialization_domain_ids: domainIds,
  };

  if (mode === 'duplicate') {
    return {
      ...base,
      name_fr: base.name_fr ? `${base.name_fr} (copie)` : '',
      name_en: base.name_en ? `${base.name_en} (copy)` : '',
      code: base.code.replace(/_COPY$/, '') ? `${base.code.replace(/_COPY$/, '')}_2` : '',
    };
  }

  return base;
}

function valuesToPayload(
  tab: AcademicStructureTab,
  values: AcademicStructureFormValues,
): Record<string, string | number | boolean | number[]> {
  const base: Record<string, string | number | boolean | number[]> = {
    name_fr: values.name_fr.trim(),
    name_en: values.name_en.trim(),
    sort_order: values.sort_order,
    is_active: values.is_active,
  };

  if (tab === 'tracks') {
    return {
      ...base,
      code: values.code.trim(),
      description: values.description.trim(),
      program_family: values.program_family.trim().toUpperCase(),
      specialization_domain_ids: values.specialization_domain_ids,
    };
  }

  if (tab === 'levels') {
    return {
      ...base,
      code: values.code.trim(),
      filiere_id: values.filiere_id,
    };
  }

  if (tab === 'classes') {
    return {
      name_fr: values.name_fr.trim(),
      name_en: values.name_en.trim(),
      filiere_id: values.filiere_id,
      academic_level_id: values.academic_level_id,
      academic_year: values.academic_year.trim(),
    };
  }

  if (tab === 'internship-framework') {
    return {
      ...base,
      code: values.code.trim(),
      filiere_id: values.filiere_id,
      academic_level_id: values.academic_level_id,
      duration_hint: formatDurationHint(values.duration_value, values.duration_unit),
    };
  }

  return {
    ...base,
    code: values.code.trim(),
    description: values.description.trim(),
  };
}

const EntityFormDialog: FunctionComponent<EntityFormDialogProps> = ({
  open,
  tab,
  mode,
  editRow,
  tracks,
  levels,
  classes,
  internshipTypes,
  workModes,
  onClose,
  onSave,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);

  const [values, setValues] = useState<AcademicStructureFormValues>(() =>
    buildInitialValues(editRow, tracks, mode),
  );
  const [levelOptions, setLevelOptions] = useState<AcademicLevelOption[]>([]);
  const [domainCatalog, setDomainCatalog] = useState<SpecializationDomainOption[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof AcademicStructureFormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'save' | 'saveAndCreate' | null>(null);

  const editId = mode === 'edit' && editRow?.id ? Number(editRow.id) : undefined;

  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(editRow, tracks, mode));
    setTouched({});
    setSubmitAttempted(false);
  }, [open, editRow, tracks, mode]);

  useEffect(() => {
    if (!open || tab !== 'tracks') {
      setDomainCatalog([]);
      return;
    }
    let cancelled = false;
    setLoadingDomains(true);
    Promise.all([
      academicReferenceApi.listSpecializationDomains({ category: 'BUSINESS', lang }),
      academicReferenceApi.listSpecializationDomains({ category: 'TECH', lang }),
    ])
      .then(([business, tech]) => {
        if (!cancelled) setDomainCatalog([...business, ...tech]);
      })
      .catch(() => {
        if (!cancelled) setDomainCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDomains(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, tab, lang]);

  const businessDomainOptions: TagOption[] = useMemo(
    () =>
      domainCatalog
        .filter((d) => d.category === 'BUSINESS')
        .map((d) => ({ value: String(d.id), label: d.name })),
    [domainCatalog],
  );

  const techDomainOptions: TagOption[] = useMemo(
    () =>
      domainCatalog
        .filter((d) => d.category === 'TECH')
        .map((d) => ({ value: String(d.id), label: d.name })),
    [domainCatalog],
  );

  const selectedBusinessDomainIds = useMemo(() => {
    const businessIds = new Set(businessDomainOptions.map((o) => o.value));
    return values.specialization_domain_ids.filter((id) => businessIds.has(String(id))).map(String);
  }, [businessDomainOptions, values.specialization_domain_ids]);

  const selectedTechDomainIds = useMemo(() => {
    const techIds = new Set(techDomainOptions.map((o) => o.value));
    return values.specialization_domain_ids.filter((id) => techIds.has(String(id))).map(String);
  }, [techDomainOptions, values.specialization_domain_ids]);

  const patchDomainSelection = useCallback(
    (nextBusiness: string[], nextTech: string[]) => {
      const ids = [...nextBusiness, ...nextTech]
        .map(Number)
        .filter((id) => Number.isFinite(id) && id > 0);
      setValues((prev) => ({ ...prev, specialization_domain_ids: ids }));
    },
    [],
  );

  useEffect(() => {
    const fid = values.filiere_id;
    if (!fid || tab === 'tracks' || tab === 'work-modes') {
      if (tab !== 'classes' && tab !== 'internship-framework') setLevelOptions([]);
      return;
    }
    if (tab === 'classes' || tab === 'internship-framework') {
      const filtered: AcademicLevelOption[] = levels
        .filter((level) => level.filiere_id === fid && level.is_active && !level.is_archived)
        .map((level) => ({
          id: level.id,
          code: level.code,
          name: level.name,
          name_fr: level.name_fr,
          name_en: level.name_en,
          filiere_id: level.filiere_id,
          filiere_code: level.filiere_code ?? '',
          year_number: level.year_number,
          has_sectors: false,
          sort_order: level.sort_order,
          is_active: level.is_active,
        }));
      setLevelOptions(filtered);
    }
  }, [values.filiere_id, tab, levels]);

  const existingRows = useMemo(() => {
    if (tab === 'tracks') return tracks;
    if (tab === 'levels') return levels;
    if (tab === 'classes') {
      return classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        filiere_id: c.filiere ?? c.filiere_id,
      }));
    }
    if (tab === 'internship-framework') return internshipTypes;
    return workModes;
  }, [tab, tracks, levels, classes, internshipTypes, workModes]);

  const errors = useMemo(
    () =>
      validateAcademicStructureForm({
        tab,
        values,
        editId,
        existingRows,
      }),
    [tab, values, editId, existingRows],
  );

  const showError = useCallback(
    (field: keyof FormValidationErrors) => {
      if (errors[field] && (submitAttempted || touched[field as keyof AcademicStructureFormValues])) {
        return errors[field];
      }
      return undefined;
    },
    [errors, submitAttempted, touched],
  );

  const set = (key: keyof AcademicStructureFormValues, val: AcademicStructureFormValues[typeof key]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const trackSelectOptions: AcademicEntitySelectOption[] = useMemo(
    () =>
      tracks.map((tr) => ({
        value: String(tr.id),
        code: tr.code,
        name: tr.name,
        active: tr.is_active,
        archived: tr.is_archived,
      })),
    [tracks],
  );

  const levelSelectOptions: AcademicEntitySelectOption[] = useMemo(
    () =>
      levelOptions.map((lv) => ({
        value: String(lv.id),
        code: lv.code ?? '',
        name: lv.name,
        active: true,
        archived: false,
      })),
    [levelOptions],
  );

  const selectedTrack = tracks.find((tr) => tr.id === values.filiere_id);
  const selectedLevel = levelOptions.find((l) => l.id === values.academic_level_id);

  const modalTitle = useMemo(() => {
    const tabKey = tab === 'internship-framework' ? 'internshipFramework' : tab;
    if (mode === 'edit') return t(`${FORM_PREFIX}.titles.edit.${tabKey}`);
    if (mode === 'duplicate') return t(`${FORM_PREFIX}.titles.duplicate.${tabKey}`);
    return t(`${FORM_PREFIX}.titles.create.${tabKey}`);
  }, [mode, tab, t]);

  const modalDescription = t(`${FORM_PREFIX}.descriptions.${tab === 'internship-framework' ? 'internshipFramework' : tab}`);

  const handleSubmit = async (e: FormEvent, action: 'save' | 'saveAndCreate') => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (hasValidationErrors(errors)) return;

    setSaving(true);
    setSavingAction(action);
    try {
      await onSave({ values: valuesToPayload(tab, values), action });
      if (action === 'saveAndCreate') {
        setValues({ ...DEFAULT_FORM_VALUES, filiere_id: tracks[0]?.id ?? 0 });
        setTouched({});
        setSubmitAttempted(false);
      }
    } finally {
      setSaving(false);
      setSavingAction(null);
    }
  };

  const familyOptions = useMemo(() => {
    const families = new Set(tracks.map((tr) => tr.program_family?.toUpperCase()).filter(Boolean));
    families.add('PGE');
    families.add('LME');
    families.add('IBA');
    return [...families].map((f) => ({
      value: f,
      label: humanizeProgramFamily(f),
    }));
  }, [tracks]);

  const footer = (
    <>
      <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose} disabled={saving}>
        {t(`${PREFIX}.archive.cancel`)}
      </button>
      {mode !== 'edit' ? (
        <button
          type="button"
          className={adminFormBtnSecondaryClass}
          disabled={saving}
          onClick={(e) => void handleSubmit(e, 'saveAndCreate')}
        >
          {saving && savingAction === 'saveAndCreate' ? '…' : t(`${FORM_PREFIX}.actions.saveAndCreate`)}
        </button>
      ) : null}
      <button
        type="submit"
        form="academic-structure-form"
        className={adminFormBtnPrimaryClass}
        disabled={saving}
      >
        {saving && savingAction === 'save' ? '…' : t(`${PREFIX}.save`)}
      </button>
    </>
  );

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      maxWidthClass="max-w-[760px]"
      footer={footer}
    >
      <form
        id="academic-structure-form"
        className="academic-form-modal"
        onSubmit={(e) => void handleSubmit(e, 'save')}
      >
        <div className="academic-form-modal__layout">
          <div className="academic-form-modal__fields">
            <AcademicStructureFormSection
              title={t(`${FORM_PREFIX}.sections.details`)}
              description={t(`${FORM_PREFIX}.sections.detailsHint`)}
              icon={Settings2}
            >
              <div className="academic-form-grid">
                <AdminFormField
                  htmlFor="academic-name-fr"
                  label={t(`${PREFIX}.fields.nameFr`)}
                  required
                  error={showError('name_fr') ? t(`${FORM_PREFIX}.validation.${showError('name_fr')}`) : undefined}
                >
                  <AdminFormInput
                    id="academic-name-fr"
                    value={values.name_fr}
                    onChange={(e) => set('name_fr', e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name_fr: true }))}
                  />
                </AdminFormField>

                <AdminFormField
                  htmlFor="academic-name-en"
                  label={t(`${PREFIX}.fields.nameEn`)}
                  required
                  error={showError('name_en') ? t(`${FORM_PREFIX}.validation.${showError('name_en')}`) : undefined}
                >
                  <AdminFormInput
                    id="academic-name-en"
                    value={values.name_en}
                    onChange={(e) => set('name_en', e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name_en: true }))}
                  />
                </AdminFormField>

                {(tab === 'tracks' || tab === 'levels' || tab === 'work-modes' || tab === 'internship-framework') && (
                  <AdminFormField
                    htmlFor="academic-code"
                    label={t(`${PREFIX}.fields.code`)}
                    required={tab !== 'internship-framework'}
                    hint={tab === 'internship-framework' ? t(`${FORM_PREFIX}.fields.codeOptional`) : undefined}
                    error={showError('code') ? t(`${FORM_PREFIX}.validation.${showError('code')}`) : undefined}
                  >
                    <AdminFormInput
                      id="academic-code"
                      value={values.code}
                      onChange={(e) => set('code', e.target.value.toUpperCase())}
                      onBlur={() => setTouched((p) => ({ ...p, code: true }))}
                      className="font-mono text-sm"
                    />
                  </AdminFormField>
                )}

                {tab === 'tracks' && (
                  <>
                    <AdminFormField htmlFor="academic-family" label={t(`${PREFIX}.fields.family`)}>
                      <AdminCustomSelect
                        id="academic-family"
                        value={values.program_family}
                        options={familyOptions}
                        onChange={(v) => set('program_family', v)}
                        searchable
                        aria-label={t(`${PREFIX}.fields.family`)}
                      />
                    </AdminFormField>
                    <div className="academic-form-grid__full">
                      <AdminFormField htmlFor="academic-description" label={t(`${PREFIX}.fields.description`)}>
                        <AdminFormTextarea
                          id="academic-description"
                          rows={2}
                          value={values.description}
                          onChange={(e) => set('description', e.target.value)}
                        />
                      </AdminFormField>
                    </div>
                    <div className="academic-form-grid__full">
                      <AdminTagMultiSelect
                        id="academic-business-domains"
                        label={t(`${PREFIX}.fields.businessDomains`)}
                        hint={t(`${PREFIX}.fields.businessDomainsHint`)}
                        values={selectedBusinessDomainIds}
                        options={businessDomainOptions}
                        onChange={(next) => patchDomainSelection(next, selectedTechDomainIds)}
                        loading={loadingDomains}
                        searchable
                        placeholder={t(`${PREFIX}.fields.selectBusinessDomains`)}
                      />
                    </div>
                    <div className="academic-form-grid__full">
                      <AdminTagMultiSelect
                        id="academic-tech-domains"
                        label={t(`${PREFIX}.fields.techDomains`)}
                        hint={t(`${PREFIX}.fields.techDomainsHint`)}
                        values={selectedTechDomainIds}
                        options={techDomainOptions}
                        onChange={(next) => patchDomainSelection(selectedBusinessDomainIds, next)}
                        loading={loadingDomains}
                        searchable
                        placeholder={t(`${PREFIX}.fields.selectTechDomains`)}
                      />
                    </div>
                  </>
                )}

                {tab === 'work-modes' && (
                  <div className="academic-form-grid__full">
                    <AdminFormField htmlFor="academic-wm-desc" label={t(`${PREFIX}.fields.description`)}>
                      <AdminFormTextarea
                        id="academic-wm-desc"
                        rows={2}
                        value={values.description}
                        onChange={(e) => set('description', e.target.value)}
                      />
                    </AdminFormField>
                  </div>
                )}

                {tab === 'classes' && (
                  <AdminFormField htmlFor="academic-year" label={t(`${PREFIX}.fields.year`)} required>
                    <AdminFormInput
                      id="academic-year"
                      value={values.academic_year}
                      onChange={(e) => set('academic_year', e.target.value)}
                      placeholder="2025-2026"
                    />
                  </AdminFormField>
                )}

                {tab === 'internship-framework' && (
                  <div className="academic-form-grid__full">
                    <AcademicStructureDurationInput
                      value={values.duration_value}
                      unit={values.duration_unit}
                      onValueChange={(v) => set('duration_value', v)}
                      onUnitChange={(u) => set('duration_unit', u)}
                      error={showError('duration_value')}
                    />
                  </div>
                )}
              </div>
            </AcademicStructureFormSection>

            {(tab === 'levels' || tab === 'classes' || tab === 'internship-framework') && (
              <AcademicStructureFormSection
                title={t(`${FORM_PREFIX}.sections.assignment`)}
                description={t(`${FORM_PREFIX}.sections.assignmentHint`)}
                icon={Layers}
              >
                <div className="academic-form-grid">
                  <AcademicStructureEntitySelect
                    id="academic-track"
                    label={t(`${PREFIX}.fields.track`)}
                    value={values.filiere_id ? String(values.filiere_id) : ''}
                    options={trackSelectOptions}
                    onChange={(v) => {
                      set('filiere_id', Number(v));
                      set('academic_level_id', 0);
                    }}
                    required
                    error={showError('filiere_id')}
                  />
                  {(tab === 'classes' || tab === 'internship-framework') && (
                    <AcademicStructureEntitySelect
                      id="academic-level"
                      label={t(`${PREFIX}.fields.level`)}
                      value={values.academic_level_id ? String(values.academic_level_id) : ''}
                      options={levelSelectOptions}
                      onChange={(v) => set('academic_level_id', Number(v))}
                      required
                      disabled={!values.filiere_id}
                      error={showError('academic_level_id')}
                      hint={!values.filiere_id ? t(`${FORM_PREFIX}.select.selectTrackFirst`) : undefined}
                    />
                  )}
                </div>
                {showError('duplicate') ? (
                  <p className="academic-form-inline-error">{t(`${FORM_PREFIX}.validation.${showError('duplicate')}`)}</p>
                ) : null}
              </AcademicStructureFormSection>
            )}

            {tab !== 'classes' && (
              <AcademicStructureFormSection
                title={t(`${FORM_PREFIX}.sections.display`)}
                description={t(`${FORM_PREFIX}.sections.displayHint`)}
                icon={ToggleLeft}
              >
                <div className="academic-form-grid academic-form-grid--compact">
                  <AcademicStructureStepperInput
                    id="academic-order"
                    value={values.sort_order}
                    onChange={(v) => set('sort_order', v)}
                    error={showError('sort_order')}
                  />
                  <div className="flex items-end pb-1">
                    <AdminToggle
                      id="academic-active"
                      label={t(`${FORM_PREFIX}.fields.active`)}
                      checked={values.is_active}
                      onChange={(v) => set('is_active', v)}
                    />
                  </div>
                </div>
              </AcademicStructureFormSection>
            )}
          </div>

          <AcademicStructurePreviewCard
            tab={tab}
            values={values}
            trackLabel={selectedTrack?.name}
            trackCode={selectedTrack?.code}
            levelLabel={selectedLevel?.name}
            levelCode={selectedLevel?.code}
          />
        </div>
      </form>
    </AdminModal>
  );
};

export default EntityFormDialog;
