import { type FunctionComponent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles, Zap } from 'lucide-react';
import { academicReferenceApi } from '../../api/reference';
import type {
  AcademicHierarchyValue,
  AcademicLevelOption,
  AcademicSectorOption,
  AcademicYearOption,
  ClassGroupOption,
  FiliereOption,
  InternshipTypeOption,
} from '../../api/types';
import AdminSelect from '../../account/components/AdminSelect';
import { adminFormGridClass } from '../forms/adminFormClasses';

const PREFIX = 'admin.forms.academicHierarchy';

/** Wrapper that overlays a subtle brand spinner on a field while its data is loading. */
const CascadeField: FunctionComponent<{ loading: boolean; children: ReactNode }> = ({
  loading,
  children,
}) => (
  <div className={`acad-cascade-field${loading ? ' acad-cascade-field--loading' : ''}`}>
    {children}
    {loading && (
      <div className="acad-cascade-field__spinner" aria-hidden>
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
      </div>
    )}
  </div>
);

export interface AcademicHierarchyPinnedSelection {
  id: number;
  label: string;
}

export interface AcademicHierarchyPinnedSelections {
  filiere?: AcademicHierarchyPinnedSelection;
  level?: AcademicHierarchyPinnedSelection;
  sector?: AcademicHierarchyPinnedSelection;
  academicYear?: AcademicHierarchyPinnedSelection;
  classGroup?: AcademicHierarchyPinnedSelection;
}

function pinSelectOption(
  options: { value: string; label: string }[],
  id: string,
  label: string | undefined,
  emptyLabel: string,
): { value: string; label: string }[] {
  if (!id) return options;
  if (options.some((option) => option.value === id)) return options;
  const withEmpty =
    options.length && options[0].value === ''
      ? options
      : [{ value: '', label: emptyLabel }, ...options];
  return [...withEmpty.filter((option) => option.value !== id), { value: id, label: label || id }];
}

export const emptyAcademicHierarchy = (): AcademicHierarchyValue => ({
  filiereId: '',
  levelId: '',
  sectorId: '',
  internshipTypeId: '',
  academicYearId: '',
  academicYearCode: '',
  classGroupId: '',
});

interface AdminAcademicHierarchyFieldsProps {
  value: AcademicHierarchyValue;
  onChange: (next: AcademicHierarchyValue) => void;
  showClassGroup?: boolean;
  /** When true, internship type is derived server-side from program + level (read-only preview). */
  autoResolveInternship?: boolean;
  /** Pré-sélectionner l’année courante si vide (création uniquement). */
  autoSelectCurrentYear?: boolean;
  /** Valeurs actuelles à garder visibles même si absentes du catalogue actif. */
  pinnedSelections?: AcademicHierarchyPinnedSelections;
  idPrefix?: string;
}

const AdminAcademicHierarchyFields: FunctionComponent<AdminAcademicHierarchyFieldsProps> = ({
  value,
  onChange,
  showClassGroup = true,
  autoResolveInternship = false,
  autoSelectCurrentYear = true,
  pinnedSelections,
  idPrefix = 'academic',
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [levels, setLevels] = useState<AcademicLevelOption[]>([]);
  const [sectors, setSectors] = useState<AcademicSectorOption[]>([]);
  const [internshipTypes, setInternshipTypes] = useState<InternshipTypeOption[]>([]);
  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroupOption[]>([]);

  const [loadingFilieres, setLoadingFilieres] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const selectedLevel = useMemo(
    () => levels.find((l) => String(l.id) === value.levelId),
    [levels, value.levelId],
  );

  useEffect(() => {
    setLoadingFilieres(true);
    academicReferenceApi
      .listFilieres({ lang })
      .then(setFilieres)
      .catch(() => setFilieres([]))
      .finally(() => setLoadingFilieres(false));
  }, [lang]);

  useEffect(() => {
    academicReferenceApi
      .listAcademicYears({ structured: true, lang })
      .then((data) => setYears(data as AcademicYearOption[]))
      .catch(() => setYears([]));
  }, [lang]);

  useEffect(() => {
    if (!value.filiereId) {
      setLevels([]);
      return;
    }
    setLoadingLevels(true);
    academicReferenceApi
      .listAcademicLevels({ filiere_ids: [Number(value.filiereId)], lang })
      .then((data) => setLevels(data as AcademicLevelOption[]))
      .catch(() => setLevels([]))
      .finally(() => setLoadingLevels(false));
  }, [value.filiereId, lang]);

  useEffect(() => {
    if (!value.levelId || !selectedLevel?.has_sectors) {
      setSectors([]);
      return;
    }
    setLoadingSectors(true);
    academicReferenceApi
      .listAcademicSectors({ level_ids: [Number(value.levelId)], lang })
      .then(setSectors)
      .catch(() => setSectors([]))
      .finally(() => setLoadingSectors(false));
  }, [value.levelId, selectedLevel?.has_sectors, lang]);

  useEffect(() => {
    if (!value.levelId) {
      setInternshipTypes([]);
      return;
    }
    setLoadingInternships(true);
    academicReferenceApi
      .listInternshipTypes({
        level_ids: [Number(value.levelId)],
        sector_id: value.sectorId ? Number(value.sectorId) : undefined,
        lang,
      })
      .then(setInternshipTypes)
      .catch(() => setInternshipTypes([]))
      .finally(() => setLoadingInternships(false));
  }, [value.levelId, value.sectorId, lang]);

  useEffect(() => {
    if (!showClassGroup || !value.filiereId) {
      setClassGroups([]);
      return;
    }
    setLoadingClasses(true);
    const yearCode =
      value.academicYearCode ||
      years.find((y) => String(y.id) === value.academicYearId)?.code;
    academicReferenceApi
      .listClassGroups({
        filiere_id: Number(value.filiereId),
        academic_year: yearCode || undefined,
        level_ids: value.levelId ? [Number(value.levelId)] : undefined,
        sector_id: value.sectorId ? Number(value.sectorId) : undefined,
        lang,
      })
      .then(setClassGroups)
      .catch(() => setClassGroups([]))
      .finally(() => setLoadingClasses(false));
  }, [
    showClassGroup,
    value.filiereId,
    value.levelId,
    value.sectorId,
    value.academicYearId,
    value.academicYearCode,
    years,
    lang,
  ]);

  const patch = useCallback(
    (partial: Partial<AcademicHierarchyValue>) => {
      onChange({ ...value, ...partial });
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!years.length) return;
    if (value.academicYearId) {
      const selected = years.find((year) => String(year.id) === value.academicYearId);
      if (selected && value.academicYearCode !== selected.code) {
        patch({ academicYearCode: selected.code });
      }
      return;
    }
    if (value.academicYearCode) {
      const matched = years.find((year) => year.code === value.academicYearCode);
      if (matched) {
        patch({ academicYearId: String(matched.id), academicYearCode: matched.code });
      }
      return;
    }
    if (autoSelectCurrentYear) {
      const current = years.find((year) => year.is_current) ?? years[0];
      patch({ academicYearId: String(current.id), academicYearCode: current.code });
    }
  }, [
    years,
    value.academicYearId,
    value.academicYearCode,
    autoSelectCurrentYear,
    patch,
  ]);

  const onFiliereChange = (filiereId: string) => {
    onChange({
      ...emptyAcademicHierarchy(),
      filiereId,
      academicYearId: value.academicYearId,
      academicYearCode: value.academicYearCode,
    });
  };

  const onLevelChange = (levelId: string) => {
    onChange({
      ...value,
      levelId,
      sectorId: '',
      internshipTypeId: '',
      classGroupId: '',
    });
  };

  const onYearChange = (academicYearId: string) => {
    const year = years.find((y) => String(y.id) === academicYearId);
    onChange({
      ...value,
      academicYearId,
      academicYearCode: year?.code ?? '',
      classGroupId: '',
    });
  };

  const filiereOptions = useMemo(() => {
    const base = [
      { value: '', label: t(`${PREFIX}.selectProgram`) },
      ...filieres.map((f) => ({ value: String(f.id), label: f.name })),
    ];
    return pinSelectOption(
      base,
      value.filiereId,
      pinnedSelections?.filiere?.label,
      t(`${PREFIX}.selectProgram`),
    );
  }, [filieres, pinnedSelections?.filiere?.label, t, value.filiereId]);

  const levelOptions = useMemo(() => {
    const base = [
      {
        value: '',
        label: value.filiereId ? t(`${PREFIX}.selectLevel`) : t(`${PREFIX}.levelNeedsProgram`),
      },
      ...levels.map((l) => ({ value: String(l.id), label: l.name })),
    ];
    return pinSelectOption(
      base,
      value.levelId,
      pinnedSelections?.level?.label,
      t(`${PREFIX}.selectLevel`),
    );
  }, [levels, pinnedSelections?.level?.label, t, value.filiereId, value.levelId]);

  const sectorOptions = useMemo(() => {
    const base = [
      { value: '', label: t(`${PREFIX}.selectSector`) },
      ...sectors.map((s) => ({ value: String(s.id), label: s.name })),
    ];
    return pinSelectOption(
      base,
      value.sectorId,
      pinnedSelections?.sector?.label,
      t(`${PREFIX}.selectSector`),
    );
  }, [pinnedSelections?.sector?.label, sectors, t, value.sectorId]);

  const internshipOptions = useMemo(
    () => [
      {
        value: '',
        label: value.levelId ? t(`${PREFIX}.selectInternship`) : t(`${PREFIX}.internshipNeedsLevel`),
      },
      ...internshipTypes.map((item) => ({
        value: String(item.id),
        label: item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name,
      })),
    ],
    [internshipTypes, value.levelId, t],
  );

  const yearOptions = useMemo(() => {
    const base = [
      { value: '', label: t(`${PREFIX}.selectYear`) },
      ...years.map((y) => ({ value: String(y.id), label: y.label || y.code })),
    ];
    return pinSelectOption(
      base,
      value.academicYearId,
      pinnedSelections?.academicYear?.label,
      t(`${PREFIX}.selectYear`),
    );
  }, [pinnedSelections?.academicYear?.label, t, value.academicYearId, years]);

  const classOptions = useMemo(() => {
    const base = [
      {
        value: '',
        label: value.filiereId ? t(`${PREFIX}.selectClass`) : t(`${PREFIX}.classNeedsProgram`),
      },
      ...classGroups.map((c) => ({
        value: String(c.id),
        label: c.code ? `${c.code} — ${c.name}` : c.name,
      })),
    ];
    return pinSelectOption(
      base,
      value.classGroupId,
      pinnedSelections?.classGroup?.label,
      t(`${PREFIX}.selectClass`),
    );
  }, [classGroups, pinnedSelections?.classGroup?.label, t, value.classGroupId, value.filiereId]);

  const showSector = Boolean(selectedLevel?.has_sectors);

  const resolvedInternshipLabel = useMemo(() => {
    if (!autoResolveInternship || !value.levelId) {
      return '';
    }
    if (internshipTypes.length === 1) {
      const item = internshipTypes[0];
      return item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name;
    }
    if (internshipTypes.length > 1 && showSector && !value.sectorId) {
      return t(`${PREFIX}.internshipNeedsSector`);
    }
    if (internshipTypes.length > 1) {
      return t(`${PREFIX}.internshipAmbiguous`);
    }
    if (value.internshipTypeId) {
      const item = internshipTypes.find((i) => String(i.id) === value.internshipTypeId);
      if (item) {
        return item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name;
      }
    }
    return t(`${PREFIX}.internshipPending`);
  }, [
    autoResolveInternship,
    value.levelId,
    value.sectorId,
    value.internshipTypeId,
    internshipTypes,
    showSector,
    t,
  ]);

  useEffect(() => {
    if (!autoResolveInternship) return;
    if (internshipTypes.length === 1) {
      const id = String(internshipTypes[0].id);
      if (value.internshipTypeId !== id) {
        patch({ internshipTypeId: id });
      }
    } else if (internshipTypes.length === 0 && value.internshipTypeId) {
      patch({ internshipTypeId: '' });
    }
  }, [autoResolveInternship, internshipTypes, value.internshipTypeId, patch]);

  return (
    <div className={adminFormGridClass}>
      {/* Programme / Filière */}
      <CascadeField loading={loadingFilieres}>
        <AdminSelect
          id={`${idPrefix}-filiere`}
          label={t(`${PREFIX}.program`)}
          value={value.filiereId}
          onChange={onFiliereChange}
          options={filiereOptions}
          searchable={filieres.length > 4}
          disabled={loadingFilieres}
        />
      </CascadeField>

      {/* Niveau */}
      <CascadeField loading={loadingLevels}>
        <AdminSelect
          id={`${idPrefix}-level`}
          label={t(`${PREFIX}.level`)}
          value={value.levelId}
          onChange={onLevelChange}
          options={levelOptions}
          disabled={!value.filiereId || loadingLevels}
          searchable={levels.length > 4}
        />
      </CascadeField>

      {/* Secteur (conditionnel) */}
      {showSector ? (
        <CascadeField loading={loadingSectors}>
          <AdminSelect
            id={`${idPrefix}-sector`}
            label={t(`${PREFIX}.sector`)}
            value={value.sectorId}
            onChange={(sectorId) => patch({ sectorId, internshipTypeId: '', classGroupId: '' })}
            options={sectorOptions}
            disabled={!value.levelId || loadingSectors}
            searchable={sectors.length > 4}
          />
        </CascadeField>
      ) : null}

      {/* Type de stage — auto-résolu ou select manuel */}
      {autoResolveInternship ? (
        <div className="admin-form-field">
          <div className="acad-internship-auto__label-row">
            <label
              className="admin-form-label text-sm font-semibold text-[var(--admin-text)]"
              htmlFor={`${idPrefix}-internship-auto`}
            >
              {t(`${PREFIX}.internshipType`)}
            </label>
            <span className="acad-internship-auto__badge" aria-hidden>
              <Sparkles className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} />
              Auto
            </span>
          </div>

          <div className="acad-internship-auto__card">
            <p className="acad-internship-auto__hint">{t(`${PREFIX}.internshipAutoHint`)}</p>
            <div
              id={`${idPrefix}-internship-auto`}
              className="acad-internship-auto__value"
              aria-live="polite"
            >
              {loadingInternships ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden strokeWidth={2} />
                  <span>{t(`${PREFIX}.internshipResolving`)}</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />
                  <span>{resolvedInternshipLabel || '—'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <CascadeField loading={loadingInternships}>
          <AdminSelect
            id={`${idPrefix}-internship`}
            label={t(`${PREFIX}.internshipType`)}
            value={value.internshipTypeId}
            onChange={(internshipTypeId) => patch({ internshipTypeId })}
            options={internshipOptions}
            disabled={!value.levelId || loadingInternships}
            searchable={internshipTypes.length > 4}
          />
        </CascadeField>
      )}

      {/* Année académique */}
      <AdminSelect
        id={`${idPrefix}-year`}
        label={t(`${PREFIX}.academicYear`)}
        value={value.academicYearId}
        onChange={onYearChange}
        options={yearOptions}
        disabled={loadingYears}
        searchable={years.length > 6}
      />

      {/* Classe / groupe */}
      {showClassGroup ? (
        <CascadeField loading={loadingClasses}>
          <AdminSelect
            id={`${idPrefix}-class`}
            label={t(`${PREFIX}.classGroup`)}
            value={value.classGroupId}
            onChange={(classGroupId) => patch({ classGroupId })}
            options={classOptions}
            disabled={!value.filiereId || loadingClasses}
            searchable={classGroups.length > 6}
          />
        </CascadeField>
      ) : null}
    </div>
  );
};

export default AdminAcademicHierarchyFields;
