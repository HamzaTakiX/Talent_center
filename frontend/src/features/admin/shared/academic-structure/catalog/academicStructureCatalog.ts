import { academicStructureApi } from '../../../academic-structure/api/academicStructureApi';
import type {
  AcademicClassRow,
  AcademicLevelRow,
  AcademicTrackRow,
  InternshipFrameworkRow,
} from '../../../academic-structure/types/academicStructureTypes';
import { academicReferenceApi } from '../../../api/reference';
import type {
  AcademicLevelOption,
  ClassGroupOption,
  FiliereOption,
  InternshipTypeOption,
} from '../../../api/types';
import {
  displayCellValue,
  localizedEntityName,
} from '../../../academic-structure/utils/academicStructureDisplay';

export interface AcademicStructureCatalog {
  lang: string;
  filieres: FiliereOption[];
  levels: AcademicLevelOption[];
  classGroups: ClassGroupOption[];
  internshipTypes: InternshipTypeOption[];
  programLabels: string[];
  classLabels: string[];
  academicLevelLabels: string[];
  internshipTypeLabels: string[];
}

type CacheEntry = {
  catalog?: AcademicStructureCatalog;
  promise?: Promise<AcademicStructureCatalog>;
};

const cache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();

function cacheKey(lang: string): string {
  return lang.slice(0, 2) || 'fr';
}

function labelForFiliere(f: FiliereOption, lang: string): string {
  return displayCellValue(localizedEntityName(f, lang) || f.name);
}

function labelForLevel(l: AcademicLevelOption, lang: string): string {
  return displayCellValue(localizedEntityName(l, lang) || l.name);
}

function labelForClass(c: ClassGroupOption, lang: string): string {
  return displayCellValue(localizedEntityName(c, lang) || c.name || c.code);
}

function labelForInternshipType(t: InternshipTypeOption, lang: string): string {
  return displayCellValue(localizedEntityName(t, lang) || t.name);
}

function labelForTrackRow(t: AcademicTrackRow, lang: string): string {
  return displayCellValue(localizedEntityName(t, lang) || t.name);
}

function labelForLevelRow(l: AcademicLevelRow, lang: string): string {
  return displayCellValue(localizedEntityName(l, lang) || l.name);
}

function labelForClassRow(c: AcademicClassRow, lang: string): string {
  return displayCellValue(localizedEntityName(c, lang) || c.name || c.code);
}

function labelForInternshipRow(t: InternshipFrameworkRow, lang: string): string {
  return displayCellValue(localizedEntityName(t, lang) || t.name);
}

function uniqueSorted(labels: string[]): string[] {
  return [...new Set(labels.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
}

function isCatalogEntryActive(row: { is_active: boolean; is_archived: boolean }): boolean {
  return row.is_active && !row.is_archived;
}

/** Same source & rules as Paramètres → Structure académique (actifs, non archivés). */
async function fetchFromStructureSettings(lang: string): Promise<AcademicStructureCatalog | null> {
  try {
    const [tracks, levels, classes, internshipFramework] = await Promise.all([
      academicStructureApi.listTracks({ lang }),
      academicStructureApi.listLevels({ lang }),
      academicStructureApi.listClasses({ lang }),
      academicStructureApi.listInternshipFramework({ lang }),
    ]);

    const activeTracks = tracks.filter(isCatalogEntryActive);
    const activeLevels = levels.filter(isCatalogEntryActive);
    const activeClasses = classes.filter(isCatalogEntryActive);
    const activeInternships = internshipFramework.filter(isCatalogEntryActive);

    const programLabels = uniqueSorted(activeTracks.map((t) => labelForTrackRow(t, lang)));
    const classLabels = uniqueSorted(activeClasses.map((c) => labelForClassRow(c, lang)));
    const academicLevelLabels = uniqueSorted(activeLevels.map((l) => labelForLevelRow(l, lang)));
    const internshipTypeLabels = uniqueSorted(
      activeInternships.map((t) => labelForInternshipRow(t, lang)),
    );

    const filieres: FiliereOption[] = activeTracks.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      name_fr: t.name_fr,
      name_en: t.name_en,
      program_family: t.program_family,
      department: '',
      is_active: t.is_active,
    }));

    const levelOptions: AcademicLevelOption[] = activeLevels.map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      name_fr: l.name_fr,
      name_en: l.name_en,
      filiere_id: l.filiere_id,
      filiere_code: l.filiere_code ?? '',
      year_number: l.year_number,
      has_sectors: false,
      sort_order: l.sort_order,
      is_active: l.is_active,
    }));

    const classGroups: ClassGroupOption[] = activeClasses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      name_fr: c.name_fr,
      name_en: c.name_en,
      filiere: c.filiere,
      filiere_code: c.filiere_code ?? '',
      filiere_name: c.filiere_name ?? '',
      academic_year: c.academic_year,
      academic_level_id: c.academic_level_id ?? null,
      academic_level_label: c.academic_level_label,
      level: c.academic_level_label ?? '',
      student_capacity: 0,
      is_active: c.is_active,
    }));

    const internshipTypes: InternshipTypeOption[] = activeInternships.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      name_fr: t.name_fr,
      name_en: t.name_en,
      academic_level_id: t.academic_level_id,
      academic_sector_id: null,
      duration_hint: t.duration_hint,
      is_active: t.is_active,
    }));

    return {
      lang,
      filieres,
      levels: levelOptions,
      classGroups,
      internshipTypes,
      programLabels,
      classLabels,
      academicLevelLabels,
      internshipTypeLabels,
    };
  } catch {
    return null;
  }
}

async function fetchFromReferenceApi(lang: string): Promise<AcademicStructureCatalog> {
  const [filieres, classGroups, internshipTypes] = await Promise.all([
    academicReferenceApi.listFilieres({ lang }),
    academicReferenceApi.listClassGroups({ lang }),
    academicReferenceApi.listAllInternshipTypes({ lang }),
  ]);

  let levels: AcademicLevelOption[] = [];
  if (filieres.length > 0) {
    const levelRows = await academicReferenceApi.listAcademicLevels({
      filiere_ids: filieres.map((f) => f.id),
      lang,
    });
    levels = levelRows as AcademicLevelOption[];
  }

  const programLabels = uniqueSorted(filieres.map((f) => labelForFiliere(f, lang)));
  const classLabels = uniqueSorted(classGroups.map((c) => labelForClass(c, lang)));
  const academicLevelLabels = uniqueSorted(levels.map((l) => labelForLevel(l, lang)));
  const internshipTypeLabels = uniqueSorted(
    internshipTypes.map((t) => labelForInternshipType(t, lang)),
  );

  return {
    lang,
    filieres,
    levels,
    classGroups,
    internshipTypes,
    programLabels,
    classLabels,
    academicLevelLabels,
    internshipTypeLabels,
  };
}

export async function fetchAcademicStructureCatalog(lang: string): Promise<AcademicStructureCatalog> {
  const normalizedLang = cacheKey(lang);
  const fromSettings = await fetchFromStructureSettings(normalizedLang);
  if (fromSettings) return fromSettings;
  return fetchFromReferenceApi(normalizedLang);
}

export function subscribeAcademicStructureCatalog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function invalidateAcademicStructureCatalog(): void {
  cache.clear();
  for (const listener of listeners) {
    listener();
  }
}

export function getAcademicStructureCatalog(lang: string): Promise<AcademicStructureCatalog> {
  const key = cacheKey(lang);
  const existing = cache.get(key);

  if (existing?.catalog) {
    return Promise.resolve(existing.catalog);
  }

  if (existing?.promise) {
    return existing.promise;
  }

  const promise = fetchAcademicStructureCatalog(key).then((catalog) => {
    cache.set(key, { catalog });
    return catalog;
  });

  cache.set(key, { promise });
  return promise;
}
