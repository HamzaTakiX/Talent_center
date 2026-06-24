import { academicReferenceApi } from '../../../api/reference';
import type {
  AcademicLevelOption,
  ClassGroupOption,
  FiliereOption,
  InternshipTypeOption,
} from '../../../api/types';
import { displayCellValue, localizedEntityName } from '../../../academic-structure/utils/academicStructureDisplay';

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

function uniqueSorted(labels: string[]): string[] {
  return [...new Set(labels.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Catalogue lecture seule — même source DB que Paramètres → Structure académique (`academicReferenceApi`). */
async function fetchAcademicReferenceCatalog(lang: string): Promise<AcademicStructureCatalog> {
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
  return fetchAcademicReferenceCatalog(cacheKey(lang));
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
