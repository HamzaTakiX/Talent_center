import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { academicReferenceApi } from '../../api/reference';

import type {
  AcademicLevelOption,
  AcademicSectorOption,
  AcademicYearOption,
  FiliereOption,
  SpecializationDomainOption,
} from '../../api/types';

import type { AcademicScopeState } from '../../sous_Admin/components/AdminAcademicScopeFields';

import AdminTagMultiSelect, { type TagOption } from '../../shared/forms/AdminTagMultiSelect';

import { adminFormGridClass } from '../../shared/forms/adminFormClasses';



const ENC_PREFIX = 'admin.forms.createEncadrant.academicScope';



export interface EncadrantAcademicScopeState extends AcademicScopeState {

  specializationDomainIds: number[];

}



export type EncadrantScopeFieldKey =

  | 'filiereIds'

  | 'levelIds'

  | 'sectorIds'

  | 'academicYears'

  | 'specializationDomainIds';



export type EncadrantScopeFieldErrors = Partial<Record<EncadrantScopeFieldKey, string>>;



interface EncadrantAcademicScopeFieldsProps {

  value: EncadrantAcademicScopeState;

  onChange: (next: EncadrantAcademicScopeState) => void;

  errors?: EncadrantScopeFieldErrors;

  onSectorsAvailabilityChange?: (hasSectors: boolean) => void;

}



const EncadrantAcademicScopeFields: FunctionComponent<EncadrantAcademicScopeFieldsProps> = ({

  value,

  onChange,

  errors = {},

  onSectorsAvailabilityChange,

}) => {

  const { t, i18n } = useTranslation();



  const [filieres, setFilieres] = useState<FiliereOption[]>([]);

  const [yearOptions, setYearOptions] = useState<string[]>([]);

  const [structuredLevels, setStructuredLevels] = useState<AcademicLevelOption[]>([]);

  const [structuredSectors, setStructuredSectors] = useState<AcademicSectorOption[]>([]);

  const [businessDomains, setBusinessDomains] = useState<SpecializationDomainOption[]>([]);
  const [techDomains, setTechDomains] = useState<SpecializationDomainOption[]>([]);

  const [loadingFilieres, setLoadingFilieres] = useState(true);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingBusinessDomains, setLoadingBusinessDomains] = useState(false);
  const [loadingTechDomains, setLoadingTechDomains] = useState(false);



  const filiereIdsKey = value.filiereIds.join(',');

  const levelIdsKey = value.levelIds.join(',');



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
        const validScopeYears = value.academicYears.filter((y) => years.includes(y));
        if (validScopeYears.length !== value.academicYears.length) {
          onChange({ ...value, academicYears: validScopeYears });
        }
      })
      .catch(() => setYearOptions([]))
      .finally(() => setLoadingYears(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync scope years when catalog loads
  }, [i18n.language]);



  useEffect(() => {

    if (value.filiereIds.length === 0) {

      setStructuredLevels([]);

      return;

    }

    setLoadingLevels(true);

    academicReferenceApi

      .listAcademicLevels({ filiere_ids: value.filiereIds, lang: i18n.language })

      .then((levels) => {

        const structured = levels as AcademicLevelOption[];

        setStructuredLevels(structured);

        const allowedIds = new Set(structured.map((l) => l.id));

        const nextLevelIds = value.levelIds.filter((id) => allowedIds.has(id));

        const codes = structured.filter((l) => nextLevelIds.includes(l.id)).map((l) => l.code);

        if (

          nextLevelIds.length !== value.levelIds.length ||

          codes.join(',') !== value.levels.join(',')

        ) {

          onChange({

            ...value,

            levelIds: nextLevelIds,

            levels: codes,

            sectorIds: nextLevelIds.length ? value.sectorIds : [],

          });

        }

      })

      .catch(() => setStructuredLevels([]))

      .finally(() => setLoadingLevels(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [filiereIdsKey, i18n.language]);



  const selectedFilieres = useMemo(
    () => filieres.filter((f) => value.filiereIds.includes(f.id)),
    [filieres, value.filiereIds],
  );

  const hasBusinessProgram = selectedFilieres.some((f) => Boolean(f.program_family));
  const hasTechProgram = selectedFilieres.some((f) => !f.program_family);
  const showBusinessDomains = hasBusinessProgram;
  const showTechDomains = hasTechProgram || hasBusinessProgram;

  useEffect(() => {
    if (value.filiereIds.length === 0 || !showBusinessDomains) {
      setBusinessDomains([]);
      return;
    }
    setLoadingBusinessDomains(true);
    academicReferenceApi
      .listSpecializationDomains({ filiere_ids: value.filiereIds, lang: i18n.language })
      .then((domains) => {
        const business = domains.filter((d) => d.category === 'BUSINESS');
        setBusinessDomains(business);
        const allowed = new Set([
          ...business.map((d) => d.id),
          ...techDomains.map((d) => d.id),
        ]);
        const nextIds = value.specializationDomainIds.filter((id) => allowed.has(id));
        if (nextIds.length !== value.specializationDomainIds.length) {
          onChange({ ...value, specializationDomainIds: nextIds });
        }
      })
      .catch(() => setBusinessDomains([]))
      .finally(() => setLoadingBusinessDomains(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filiereIdsKey, i18n.language, showBusinessDomains]);

  useEffect(() => {
    if (value.filiereIds.length === 0 || !showTechDomains) {
      setTechDomains([]);
      return;
    }
    setLoadingTechDomains(true);
    academicReferenceApi
      .listSpecializationDomains({
        filiere_ids: value.filiereIds,
        lang: i18n.language,
        category: 'TECH',
        include_tech: true,
      })
      .then((domains) => {
        setTechDomains(domains);
        const allowed = new Set([
          ...businessDomains.map((d) => d.id),
          ...domains.map((d) => d.id),
        ]);
        const nextIds = value.specializationDomainIds.filter((id) => allowed.has(id));
        if (nextIds.length !== value.specializationDomainIds.length) {
          onChange({ ...value, specializationDomainIds: nextIds });
        }
      })
      .catch(() => setTechDomains([]))
      .finally(() => setLoadingTechDomains(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filiereIdsKey, i18n.language, showTechDomains]);



  useEffect(() => {

    if (value.levelIds.length === 0) {

      setStructuredSectors([]);

      return;

    }

    setLoadingSectors(true);

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

      .catch(() => setStructuredSectors([]))

      .finally(() => setLoadingSectors(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [levelIdsKey, i18n.language]);



  const filiereTagOptions: TagOption[] = useMemo(

    () => filieres.map((f) => ({ value: String(f.id), label: f.name })),

    [filieres],

  );



  const levelTagOptions: TagOption[] = useMemo(

    () => structuredLevels.map((l) => ({ value: String(l.id), label: l.name })),

    [structuredLevels],

  );



  const sectorTagOptions: TagOption[] = useMemo(

    () => structuredSectors.map((s) => ({ value: String(s.id), label: s.name })),

    [structuredSectors],

  );



  const yearTagOptions: TagOption[] = useMemo(

    () => yearOptions.map((y) => ({ value: y, label: y })),

    [yearOptions],

  );



  const businessDomainTagOptions: TagOption[] = useMemo(
    () => businessDomains.map((d) => ({ value: String(d.id), label: d.name })),
    [businessDomains],
  );

  const techDomainTagOptions: TagOption[] = useMemo(
    () => techDomains.map((d) => ({ value: String(d.id), label: d.name })),
    [techDomains],
  );

  const businessDomainIdSet = useMemo(
    () => new Set(businessDomains.map((d) => d.id)),
    [businessDomains],
  );

  const techDomainIdSet = useMemo(() => new Set(techDomains.map((d) => d.id)), [techDomains]);

  const selectedBusinessDomainIds = value.specializationDomainIds.filter((id) =>
    businessDomainIdSet.has(id),
  );

  const selectedTechDomainIds = value.specializationDomainIds.filter((id) =>
    techDomainIdSet.has(id),
  );

  const onBusinessDomainsChange = (ids: string[]) => {
    const nextBusiness = ids.map(Number).filter(Boolean);
    patch({
      specializationDomainIds: [...nextBusiness, ...selectedTechDomainIds],
    });
  };

  const onTechDomainsChange = (ids: string[]) => {
    const nextTech = ids.map(Number).filter(Boolean);
    patch({
      specializationDomainIds: [...selectedBusinessDomainIds, ...nextTech],
    });
  };



  const patch = useCallback(

    (partial: Partial<EncadrantAcademicScopeState>) => {

      onChange({ ...value, ...partial });

    },

    [onChange, value],

  );



  const onFiliereChange = (ids: string[]) => {

    const filiereIds = ids.map(Number).filter(Boolean);

    onChange({

      ...value,

      filiereIds,

      yearFilter: '',

      levelIds: [],

      sectorIds: [],

      levels: [],

      academicYears: [],

      specializationDomainIds: [],

    });

  };



  const onLevelChange = (ids: string[]) => {

    const levelIds = ids.map(Number).filter(Boolean);

    const codes = structuredLevels.filter((l) => levelIds.includes(l.id)).map((l) => l.code);

    onChange({

      ...value,

      levelIds,

      levels: codes,

      sectorIds: [],

    });

  };



  const hasFiliere = value.filiereIds.length > 0;

  const hasLevels = value.levelIds.length > 0;

  const showSectors = structuredSectors.length > 0;



  useEffect(() => {

    onSectorsAvailabilityChange?.(showSectors);

  }, [showSectors, onSectorsAvailabilityChange]);



  return (

    <div className={adminFormGridClass}>

      <AdminTagMultiSelect

        id="enc-scope-filieres"

        label={t(`${ENC_PREFIX}.filiere`)}

        hint={t(`${ENC_PREFIX}.filiereHint`)}

        values={value.filiereIds.map(String)}

        options={filiereTagOptions}

        onChange={onFiliereChange}

        loading={loadingFilieres}

        searchable

        required

        error={errors.filiereIds}

        placeholder={t(`${ENC_PREFIX}.selectFiliere`)}

      />



      <AdminTagMultiSelect

        id="enc-scope-levels"

        label={t(`${ENC_PREFIX}.levels`)}

        hint={t(`${ENC_PREFIX}.levelsHint`)}

        values={value.levelIds.map(String)}

        options={levelTagOptions}

        onChange={onLevelChange}

        disabled={!hasFiliere}

        loading={loadingLevels}

        searchable

        required

        error={errors.levelIds}

        disabledHint={t(`${ENC_PREFIX}.needsFiliere`)}

        placeholder={t(`${ENC_PREFIX}.selectLevels`)}

      />



      <AdminTagMultiSelect

        id="enc-scope-years"

        label={t(`${ENC_PREFIX}.academicYears`)}

        hint={t(`${ENC_PREFIX}.academicYearsHint`)}

        values={value.academicYears}

        options={yearTagOptions}

        onChange={(academicYears) => patch({ academicYears })}

        disabled={!hasFiliere}

        loading={loadingYears}

        searchable={yearTagOptions.length > 6}

        required

        error={errors.academicYears}

        disabledHint={t(`${ENC_PREFIX}.needsFiliere`)}

        placeholder={t(`${ENC_PREFIX}.selectAcademicYears`)}

      />



      {showBusinessDomains ? (
        <AdminTagMultiSelect
          id="enc-scope-specialization-domains"
          label={t(`${ENC_PREFIX}.specializationDomains`)}
          hint={t(`${ENC_PREFIX}.specializationDomainsHint`)}
          values={selectedBusinessDomainIds.map(String)}
          options={businessDomainTagOptions}
          onChange={onBusinessDomainsChange}
          disabled={!hasFiliere}
          loading={loadingBusinessDomains}
          searchable
          error={errors.specializationDomainIds}
          disabledHint={t(`${ENC_PREFIX}.needsFiliere`)}
          placeholder={t(`${ENC_PREFIX}.selectSpecializationDomains`)}
        />
      ) : null}

      {showTechDomains ? (
        <AdminTagMultiSelect
          id="enc-scope-tech-domains"
          label={
            hasTechProgram && !hasBusinessProgram
              ? t(`${ENC_PREFIX}.specializationDomains`)
              : t(`${ENC_PREFIX}.technicalSpecializationDomains`)
          }
          hint={t(`${ENC_PREFIX}.technicalSpecializationDomainsHint`)}
          values={selectedTechDomainIds.map(String)}
          options={techDomainTagOptions}
          onChange={onTechDomainsChange}
          disabled={!hasFiliere}
          loading={loadingTechDomains}
          searchable
          disabledHint={t(`${ENC_PREFIX}.needsFiliere`)}
          placeholder={t(`${ENC_PREFIX}.selectTechnicalSpecializationDomains`)}
        />
      ) : null}



      {showSectors ? (

        <AdminTagMultiSelect

          id="enc-scope-sectors"

          label={t(`${ENC_PREFIX}.sectors`)}

          hint={t(`${ENC_PREFIX}.sectorsHint`)}

          values={value.sectorIds.map(String)}

          options={sectorTagOptions}

          onChange={(ids) => patch({ sectorIds: ids.map(Number).filter(Boolean) })}

          disabled={!hasLevels}

          loading={loadingSectors}

          searchable

          required

          error={errors.sectorIds}

          disabledHint={t(`${ENC_PREFIX}.needsLevel`)}

          placeholder={t(`${ENC_PREFIX}.selectSectors`)}

        />

      ) : null}

    </div>

  );

};



export default EncadrantAcademicScopeFields;

