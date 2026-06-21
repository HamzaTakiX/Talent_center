import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Globe, MapPin, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localizedEntityName, displayCellValue } from '../../academic-structure/utils/academicStructureDisplay';
import { academicReferenceApi } from '../../api/reference';
import { useAcademicStructureCatalog } from '../academic-structure/hooks/useAcademicStructureCatalog';
import type { TagOptionGroup } from '../../shared/forms/AdminTagMultiSelect';
export interface OfferTargetingOption {
  value: string;
  label: string;
  id?: number;
}

const WORK_MODE_ICON_BY_CODE: Record<string, LucideIcon> = {
  remote: Globe,
  hybrid: Briefcase,
  onsite: MapPin,
  flexible: Briefcase,
};

export function useOfferTargetingOptions() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'fr';
  const { filieres, levels, classGroups, internshipTypes, loading, error: loadError } =
    useAcademicStructureCatalog();

  const trackOptions = useMemo(
    () =>
      filieres.map((t) => {
        const label = displayCellValue(localizedEntityName(t, lang) || t.name);
        return { value: label, label, id: t.id };
      }),
    [filieres, lang],
  );

  const levelOptions = useMemo(
    () =>
      levels.map((lv) => {
        const label = displayCellValue(localizedEntityName(lv, lang) || lv.name);
        return { value: label, label, id: lv.id };
      }),
    [levels, lang],
  );

  const classOptions = useMemo(
    () =>
      classGroups.map((cg) => {
        const label = displayCellValue(localizedEntityName(cg, lang) || cg.name || cg.code);
        return { value: label, label, id: cg.id };
      }),
    [classGroups, lang],
  );

  const internshipTypeOptions = useMemo(
    () =>
      internshipTypes.map((name) => ({
        value: name,
        label: name,
      })),
    [internshipTypes],
  );

  const levelOptionsGrouped = useMemo((): TagOptionGroup[] => {
    const byFiliere = new Map<number, OfferTargetingOption[]>();
    for (const lv of levels) {
      const label = displayCellValue(localizedEntityName(lv, lang) || lv.name);
      const option = { value: label, label, id: lv.id };
      const bucket = byFiliere.get(lv.filiere_id) ?? [];
      bucket.push(option);
      byFiliere.set(lv.filiere_id, bucket);
    }

    return filieres
      .map((filiere) => {
        const programLabel = displayCellValue(localizedEntityName(filiere, lang) || filiere.name);
        const options = (byFiliere.get(filiere.id) ?? []).sort((a, b) => {
          const levelA = levels.find((level) => level.id === a.id);
          const levelB = levels.find((level) => level.id === b.id);
          const orderA = levelA?.sort_order ?? levelA?.year_number ?? 0;
          const orderB = levelB?.sort_order ?? levelB?.year_number ?? 0;
          return orderA - orderB || a.label.localeCompare(b.label, 'fr');
        });
        return { label: programLabel, options };
      })
      .filter((group) => group.options.length > 0);
  }, [filieres, levels, lang]);

  const classOptionsGrouped = useMemo((): TagOptionGroup[] => {
    const byFiliere = new Map<number, OfferTargetingOption[]>();
    for (const classGroup of classGroups) {
      const label = displayCellValue(
        localizedEntityName(classGroup, lang) || classGroup.name || classGroup.code,
      );
      const option = { value: label, label, id: classGroup.id };
      const bucket = byFiliere.get(classGroup.filiere) ?? [];
      bucket.push(option);
      byFiliere.set(classGroup.filiere, bucket);
    }

    return filieres
      .map((filiere) => {
        const programLabel = displayCellValue(localizedEntityName(filiere, lang) || filiere.name);
        const options = (byFiliere.get(filiere.id) ?? []).sort((a, b) =>
          a.label.localeCompare(b.label, 'fr'),
        );
        return { label: programLabel, options };
      })
      .filter((group) => group.options.length > 0);
  }, [filieres, classGroups, lang]);

  return {
    loading,
    loadError,
    trackOptions,
    levelOptions,
    levelOptionsGrouped,
    classOptions,
    classOptionsGrouped,
    internshipTypeOptions,
  };
}
export function useWorkModeOptions() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const [options, setOptions] = useState<OfferTargetingOption[]>([]);

  useEffect(() => {
    void academicReferenceApi.listWorkModes({ lang }).then((modes) => {
      setOptions(modes.map((m) => ({ value: m.code, label: m.name, id: m.id })));
    });
  }, [lang]);

  return options;
}

/** Basic offer fields — academic internship types + configurable work modes. */
export function useOfferBasicInfoOptions() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const { catalog, loading: catalogLoading } = useAcademicStructureCatalog();
  const [workModes, setWorkModes] = useState<OfferTargetingOption[]>([]);
  const [workModesLoading, setWorkModesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void academicReferenceApi.listWorkModes({ lang }).then((modes) => {
      if (!cancelled) {
        setWorkModes(modes.map((m) => ({ value: m.code, label: m.name, id: m.id })));
        setWorkModesLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const internshipTypeOptions = useMemo(
    () =>
      (catalog?.internshipTypes ?? []).map((t) => ({
        value: (t.code || t.name).toUpperCase(),
        label: displayCellValue(localizedEntityName(t, lang) || t.name),
        id: t.id,
      })),
    [catalog?.internshipTypes, lang],
  );
  const workModeOptions = useMemo(
    () =>
      workModes.map((m) => ({
        ...m,
        icon: WORK_MODE_ICON_BY_CODE[m.value.toLowerCase()] ?? MapPin,
      })),
    [workModes],
  );

  return { loading: catalogLoading || workModesLoading, internshipTypeOptions, workModeOptions };
}

export function useAcademicChatFilters() {
  const { filieres, levels } = useAcademicStructureCatalog();
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'fr';

  const levelsByTrack = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const level of levels) {
      const label = displayCellValue(localizedEntityName(level, lang) || level.name);
      if (!map[level.filiere_id]) map[level.filiere_id] = [];
      map[level.filiere_id].push(label);
    }
    return map;
  }, [levels, lang]);

  return { tracks: filieres, levelsByTrack };
}