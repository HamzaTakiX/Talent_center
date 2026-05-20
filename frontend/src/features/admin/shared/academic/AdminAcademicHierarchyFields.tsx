import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  idPrefix?: string;
}

const AdminAcademicHierarchyFields: FunctionComponent<AdminAcademicHierarchyFieldsProps> = ({
  value,
  onChange,
  showClassGroup = true,
  autoResolveInternship = false,
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
      .then((data) => {
        const list = data as AcademicYearOption[];
        setYears(list);
        if (!value.academicYearId && list.length) {
          const current = list.find((y) => y.is_current) ?? list[0];
          onChange({
            ...value,
            academicYearId: String(current.id),
            academicYearCode: current.code,
          });
        }
      })
      .catch(() => setYears([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init default year once
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

  const filiereOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.selectProgram`) },
      ...filieres.map((f) => ({ value: String(f.id), label: f.name })),
    ],
    [filieres, t],
  );

  const levelOptions = useMemo(
    () => [
      {
        value: '',
        label: value.filiereId ? t(`${PREFIX}.selectLevel`) : t(`${PREFIX}.levelNeedsProgram`),
      },
      ...levels.map((l) => ({ value: String(l.id), label: l.name })),
    ],
    [levels, value.filiereId, t],
  );

  const sectorOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.selectSector`) },
      ...sectors.map((s) => ({ value: String(s.id), label: s.name })),
    ],
    [sectors, t],
  );

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

  const yearOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.selectYear`) },
      ...years.map((y) => ({ value: String(y.id), label: y.label || y.code })),
    ],
    [years, t],
  );

  const classOptions = useMemo(
    () => [
      {
        value: '',
        label: value.filiereId ? t(`${PREFIX}.selectClass`) : t(`${PREFIX}.classNeedsProgram`),
      },
      ...classGroups.map((c) => ({
        value: String(c.id),
        label: c.code ? `${c.code} — ${c.name}` : c.name,
      })),
    ],
    [classGroups, value.filiereId, t],
  );

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
      <AdminSelect
        id={`${idPrefix}-filiere`}
        label={t(`${PREFIX}.program`)}
        value={value.filiereId}
        onChange={onFiliereChange}
        options={filiereOptions}
        searchable={filieres.length > 4}
        disabled={loadingFilieres}
      />

      <AdminSelect
        id={`${idPrefix}-level`}
        label={t(`${PREFIX}.level`)}
        value={value.levelId}
        onChange={onLevelChange}
        options={levelOptions}
        disabled={!value.filiereId || loadingLevels}
        searchable={levels.length > 4}
      />

      {showSector ? (
        <AdminSelect
          id={`${idPrefix}-sector`}
          label={t(`${PREFIX}.sector`)}
          value={value.sectorId}
          onChange={(sectorId) => patch({ sectorId, internshipTypeId: '', classGroupId: '' })}
          options={sectorOptions}
          disabled={!value.levelId || loadingSectors}
          searchable={sectors.length > 4}
        />
      ) : null}

      {autoResolveInternship ? (
        <div className="admin-form-field">
          <label className="admin-form-field__label" htmlFor={`${idPrefix}-internship-auto`}>
            {t(`${PREFIX}.internshipType`)}
          </label>
          <p className="admin-form-field__hint mb-1">{t(`${PREFIX}.internshipAutoHint`)}</p>
          <div
            id={`${idPrefix}-internship-auto`}
            className="admin-form-field__readonly-value min-h-[2.75rem] flex items-center rounded-lg border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-muted)] px-3 text-sm text-[color:var(--admin-text)]"
            aria-live="polite"
          >
            {loadingInternships
              ? t(`${PREFIX}.internshipResolving`)
              : resolvedInternshipLabel || '—'}
          </div>
        </div>
      ) : (
        <AdminSelect
          id={`${idPrefix}-internship`}
          label={t(`${PREFIX}.internshipType`)}
          value={value.internshipTypeId}
          onChange={(internshipTypeId) => patch({ internshipTypeId })}
          options={internshipOptions}
          disabled={!value.levelId || loadingInternships}
          searchable={internshipTypes.length > 4}
        />
      )}

      <AdminSelect
        id={`${idPrefix}-year`}
        label={t(`${PREFIX}.academicYear`)}
        value={value.academicYearId}
        onChange={onYearChange}
        options={yearOptions}
        disabled={loadingYears}
        searchable={years.length > 6}
      />

      {showClassGroup ? (
        <AdminSelect
          id={`${idPrefix}-class`}
          label={t(`${PREFIX}.classGroup`)}
          value={value.classGroupId}
          onChange={(classGroupId) => patch({ classGroupId })}
          options={classOptions}
          disabled={!value.filiereId || loadingClasses}
          searchable={classGroups.length > 6}
        />
      ) : null}
    </div>
  );
};

export default AdminAcademicHierarchyFields;
