import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { academicReferenceApi } from '../../api/reference';
import type {
  AcademicLevelOption,
  AcademicSectorOption,
  AcademicYearOption,
  ClassGroupOption,
  FiliereOption,
} from '../../api/types';
import AdminSelect from '../../account/components/AdminSelect';
import AdminTagMultiSelect, { type TagOption } from '../../shared/forms/AdminTagMultiSelect';
import { adminFormGridClass } from '../../shared/forms/adminFormClasses';

const FORM_PREFIX = 'admin.forms.createAdministrator';
const SCOPE_PREFIX = 'admin.forms.academicScope';

export interface AcademicScopeState {
  filiereIds: number[];
  yearFilter: string;
  classGroupIds: number[];
  levelIds: number[];
  sectorIds: number[];
  levels: string[];
  academicYears: string[];
}

interface AdminAcademicScopeFieldsProps {
  value: AcademicScopeState;
  onChange: (next: AcademicScopeState) => void;
}

const AdminAcademicScopeFields: FunctionComponent<AdminAcademicScopeFieldsProps> = ({
  value,
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const langKey = i18n.language;

  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroupOption[]>([]);
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [structuredLevels, setStructuredLevels] = useState<AcademicLevelOption[]>([]);
  const [structuredSectors, setStructuredSectors] = useState<AcademicSectorOption[]>([]);

  const [loadingFilieres, setLoadingFilieres] = useState(true);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const filiereIdsKey = value.filiereIds.join(',');
  const classIdsKey = value.classGroupIds.join(',');

  useEffect(() => {
    setLoadingFilieres(true);
    academicReferenceApi
      .listFilieres({ lang: i18n.language })
      .then(setFilieres)
      .catch(() => setFilieres([]))
      .finally(() => setLoadingFilieres(false));
  }, [i18n.language]);

  useEffect(() => {
    setLoadingYears(true);
    academicReferenceApi
      .listAcademicYears({ structured: true, lang: i18n.language })
      .then((data) => {
        const years = (data as AcademicYearOption[]).map((year) => year.code);
        setYearOptions(years);
        if (value.yearFilter && !years.includes(value.yearFilter)) {
          onChange({ ...value, yearFilter: '', classGroupIds: [], levels: [] });
        }
        const validScopeYears = value.academicYears.filter((y) => years.includes(y));
        if (validScopeYears.length !== value.academicYears.length) {
          onChange({ ...value, academicYears: validScopeYears });
        }
      })
      .catch(() => setYearOptions([]))
      .finally(() => setLoadingYears(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync scope years when catalog loads
  }, [i18n.language]);

  const levelIdsKey = value.levelIds.join(',');
  const sectorIdsKey = value.sectorIds.join(',');

  useEffect(() => {
    if (value.filiereIds.length === 0 || !value.yearFilter) {
      setClassGroups([]);
      return;
    }
    setLoadingClasses(true);
    academicReferenceApi
      .listClassGroups({
        filiere_ids: value.filiereIds,
        academic_year: value.yearFilter,
        level_ids: value.levelIds.length ? value.levelIds : undefined,
        sector_id: value.sectorIds.length === 1 ? value.sectorIds[0] : undefined,
      })
      .then((groups) => {
        let filtered = groups;
        if (value.levelIds.length > 0) {
          filtered = filtered.filter(
            (g) => !g.academic_level_id || value.levelIds.includes(g.academic_level_id),
          );
        }
        if (value.sectorIds.length > 0) {
          filtered = filtered.filter(
            (g) => !g.academic_sector_id || value.sectorIds.includes(g.academic_sector_id),
          );
        }
        setClassGroups(filtered);
        const allowed = new Set(filtered.map((g) => String(g.id)));
        const nextClassIds = value.classGroupIds.filter((id) => allowed.has(String(id)));
        if (nextClassIds.length !== value.classGroupIds.length) {
          onChange({ ...value, classGroupIds: nextClassIds, levels: [] });
        }
      })
      .catch(() => setClassGroups([]))
      .finally(() => setLoadingClasses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filiereIdsKey, value.yearFilter, levelIdsKey, sectorIdsKey]);

  useEffect(() => {
    if (value.filiereIds.length === 0) {
      setLevelOptions([]);
      setStructuredLevels([]);
      setStructuredSectors([]);
      return;
    }
    setLoadingLevels(true);
    academicReferenceApi
      .listAcademicLevels({ filiere_ids: value.filiereIds, lang: i18n.language })
      .then((levels) => {
        const structured = levels as AcademicLevelOption[];
        setStructuredLevels(structured);
        setLevelOptions(structured.map((l) => l.code));
        const allowedIds = new Set(structured.map((l) => l.id));
        const nextLevelIds = value.levelIds.filter((id) => allowedIds.has(id));
        if (nextLevelIds.length !== value.levelIds.length) {
          onChange({ ...value, levelIds: nextLevelIds, sectorIds: [], levels: [] });
        }
      })
      .catch(() => {
        setLevelOptions([]);
        setStructuredLevels([]);
      })
      .finally(() => setLoadingLevels(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filiereIdsKey, i18n.language]);

  useEffect(() => {
    if (value.levelIds.length === 0) {
      setStructuredSectors([]);
      return;
    }
    academicReferenceApi
      .listAcademicSectors({ level_ids: value.levelIds, lang: i18n.language })
      .then((sectors) => {
        setStructuredSectors(sectors);
        const allowed = new Set(sectors.map((s) => s.id));
        const nextSectorIds = value.sectorIds.filter((id) => allowed.has(id));
        if (nextSectorIds.length !== value.sectorIds.length) {
          onChange({ ...value, sectorIds: nextSectorIds });
        }
      })
      .catch(() => setStructuredSectors([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.levelIds.join(','), i18n.language]);

  const filiereTagOptions: TagOption[] = useMemo(
    () => filieres.map((f) => ({ value: String(f.id), label: f.name })),
    [filieres],
  );

  const classTagOptions: TagOption[] = useMemo(
    () =>
      classGroups.map((c) => ({
        value: String(c.id),
        label: c.code
          ? `${c.code} — ${c.name}`
          : `${c.name} (${c.filiere_name}) · ${c.level || '—'}`,
      })),
    [classGroups],
  );

  const levelTagOptions: TagOption[] = useMemo(
    () =>
      structuredLevels.length
        ? structuredLevels.map((l) => ({ value: String(l.id), label: l.name }))
        : levelOptions.map((l) => ({ value: l, label: l })),
    [structuredLevels, levelOptions],
  );

  const sectorTagOptions: TagOption[] = useMemo(
    () => structuredSectors.map((s) => ({ value: String(s.id), label: s.name })),
    [structuredSectors],
  );

  const yearTagOptions: TagOption[] = useMemo(
    () => yearOptions.map((y) => ({ value: y, label: y })),
    [yearOptions],
  );

  const yearFilterSelectOptions = useMemo(
    () => [
      { value: '', label: t(`${SCOPE_PREFIX}.selectYearFilter`) },
      ...yearOptions.map((y) => ({ value: y, label: y })),
    ],
    [yearOptions, t, langKey],
  );

  const patch = useCallback(
    (partial: Partial<AcademicScopeState>) => {
      onChange({ ...value, ...partial });
    },
    [onChange, value],
  );

  const onFiliereChange = (ids: string[]) => {
    const filiereIds = ids.map(Number).filter(Boolean);
    onChange({
      filiereIds,
      yearFilter: '',
      classGroupIds: [],
      levelIds: [],
      sectorIds: [],
      levels: [],
      academicYears: [],
    });
  };

  const onYearFilterChange = (yearFilter: string) => {
    onChange({
      ...value,
      yearFilter,
      classGroupIds: [],
      levelIds: [],
      sectorIds: [],
      levels: [],
    });
  };

  const hasFiliere = value.filiereIds.length > 0;
  const hasYearFilter = Boolean(value.yearFilter);
  const hasClasses = value.classGroupIds.length > 0;

  return (
    <div className={adminFormGridClass}>
      <AdminTagMultiSelect
        id="scope-filieres"
        label={t(`${FORM_PREFIX}.fields.filiere`)}
        hint={t(`${SCOPE_PREFIX}.filiereHint`)}
        values={value.filiereIds.map(String)}
        options={filiereTagOptions}
        onChange={onFiliereChange}
        loading={loadingFilieres}
        searchable
        placeholder={t(`${FORM_PREFIX}.placeholders.selectFiliere`)}
      />

      <AdminSelect
        id="scope-year-filter"
        label={t(`${FORM_PREFIX}.fields.scopeAcademicYear`)}
        description={t(`${SCOPE_PREFIX}.yearFilterHint`)}
        value={value.yearFilter}
        onChange={onYearFilterChange}
        options={yearFilterSelectOptions}
        disabled={!hasFiliere || loadingYears}
        searchable={yearOptions.length > 6}
      />

      <AdminTagMultiSelect
        id="scope-classes"
        label={t(`${FORM_PREFIX}.fields.classGroup`)}
        hint={t(`${SCOPE_PREFIX}.classHint`)}
        values={value.classGroupIds.map(String)}
        options={classTagOptions}
        onChange={(ids) => patch({ classGroupIds: ids.map(Number).filter(Boolean) })}
        disabled={!hasFiliere || !hasYearFilter}
        loading={loadingClasses}
        searchable
        disabledHint={t(`${SCOPE_PREFIX}.classNeedsYear`)}
        placeholder={t(`${FORM_PREFIX}.placeholders.selectClass`)}
      />

      <AdminTagMultiSelect
        id="scope-levels"
        label={t(`${FORM_PREFIX}.fields.levels`)}
        hint={t(`${SCOPE_PREFIX}.levelsHint`)}
        values={structuredLevels.length ? value.levelIds.map(String) : value.levels}
        options={levelTagOptions}
        onChange={(ids) => {
          if (structuredLevels.length) {
            const levelIds = ids.map(Number).filter(Boolean);
            const codes = structuredLevels
              .filter((l) => levelIds.includes(l.id))
              .map((l) => l.code);
            patch({ levelIds, levels: codes, sectorIds: [] });
          } else {
            patch({ levels: ids });
          }
        }}
        disabled={!hasFiliere}
        loading={loadingLevels}
        searchable
        placeholder={t(`${SCOPE_PREFIX}.selectLevels`)}
      />

      {structuredSectors.length > 0 ? (
        <AdminTagMultiSelect
          id="scope-sectors"
          label={t(`${SCOPE_PREFIX}.sectors`)}
          hint={t(`${SCOPE_PREFIX}.sectorsHint`)}
          values={value.sectorIds.map(String)}
          options={sectorTagOptions}
          onChange={(ids) => patch({ sectorIds: ids.map(Number).filter(Boolean) })}
          disabled={!value.levelIds.length}
          searchable
          disabledHint={t(`${SCOPE_PREFIX}.sectorsNeedLevel`)}
          placeholder={t(`${SCOPE_PREFIX}.selectSectors`)}
        />
      ) : null}

      <AdminTagMultiSelect
        id="scope-academic-years"
        label={t(`${FORM_PREFIX}.fields.academicYears`)}
        hint={t(`${SCOPE_PREFIX}.academicYearsHint`)}
        values={value.academicYears}
        options={yearTagOptions}
        onChange={(academicYears) => patch({ academicYears })}
        disabled={!hasFiliere}
        loading={loadingYears}
        searchable={yearTagOptions.length > 6}
        disabledHint={t(`${SCOPE_PREFIX}.yearsNeedFiliere`)}
        placeholder={t(`${SCOPE_PREFIX}.selectAcademicYears`)}
      />
    </div>
  );
};

export default AdminAcademicScopeFields;
