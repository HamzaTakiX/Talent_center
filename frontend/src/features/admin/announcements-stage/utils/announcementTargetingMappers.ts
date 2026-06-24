import { displayCellValue, localizedEntityName } from '../../academic-structure/utils/academicStructureDisplay';
import type { AcademicStructureCatalog } from '../../shared/academic-structure/catalog/academicStructureCatalog';
import type { TargetingRules } from '../../offres-stage/types/createOfferWorkflow';
import { createEmptyTargetingRules } from '../../../shared/utils/targetingMappers';
import type { AnnouncementTargetPayload } from '../types/announcement';

function labelForFiliere(
  filiere: AcademicStructureCatalog['filieres'][number],
  lang: string,
): string {
  return displayCellValue(localizedEntityName(filiere, lang) || filiere.name);
}

function labelForLevel(
  level: AcademicStructureCatalog['levels'][number],
  lang: string,
): string {
  return displayCellValue(localizedEntityName(level, lang) || level.name);
}

function labelForClass(
  classGroup: AcademicStructureCatalog['classGroups'][number],
  lang: string,
): string {
  return displayCellValue(localizedEntityName(classGroup, lang) || classGroup.name || classGroup.code);
}

function labelForInternshipType(
  internshipType: AcademicStructureCatalog['internshipTypes'][number],
  lang: string,
): string {
  return displayCellValue(localizedEntityName(internshipType, lang) || internshipType.name);
}

function findFiliereByLabel(
  label: string,
  catalog: AcademicStructureCatalog,
  lang: string,
) {
  const token = label.trim().toLowerCase();
  return catalog.filieres.find((f) => {
    const candidates = [labelForFiliere(f, lang), f.name, f.code].filter(Boolean);
    return candidates.some((c) => c.toLowerCase() === token);
  });
}

function findLevelByLabel(
  label: string,
  catalog: AcademicStructureCatalog,
  lang: string,
) {
  const token = label.trim().toLowerCase();
  return catalog.levels.find((l) => {
    const candidates = [labelForLevel(l, lang), l.name, l.code].filter(Boolean);
    return candidates.some((c) => c.toLowerCase() === token);
  });
}

function findClassByLabel(
  label: string,
  catalog: AcademicStructureCatalog,
  lang: string,
) {
  const token = label.trim().toLowerCase();
  return catalog.classGroups.find((c) => {
    const candidates = [labelForClass(c, lang), c.name, c.code].filter(Boolean);
    return candidates.some((candidate) => candidate.toLowerCase() === token);
  });
}

function findInternshipTypeByLabel(
  label: string,
  catalog: AcademicStructureCatalog,
  lang: string,
) {
  const token = label.trim().toLowerCase();
  return catalog.internshipTypes.find((t) => {
    const candidates = [labelForInternshipType(t, lang), t.name, t.code].filter(Boolean);
    return candidates.some((c) => c.toLowerCase() === token);
  });
}

export function mapTargetingRulesToAnnouncementTargets(
  targeting: TargetingRules,
  catalog: AcademicStructureCatalog | null,
  lang: string,
): AnnouncementTargetPayload[] {
  if (!catalog) return [];

  const targets: AnnouncementTargetPayload[] = [];

  for (const label of targeting.programs) {
    const filiere = findFiliereByLabel(label, catalog, lang);
    if (filiere) {
      targets.push({ target_type: 'FILIERE', filiereId: filiere.id, is_inclusive: true });
    }
  }

  for (const label of targeting.levels) {
    const level = findLevelByLabel(label, catalog, lang);
    if (level) {
      targets.push({ target_type: 'ACADEMIC_LEVEL', academicLevelId: level.id, is_inclusive: true });
    }
  }

  for (const label of targeting.internshipTypes ?? []) {
    const internshipType = findInternshipTypeByLabel(label, catalog, lang);
    if (internshipType) {
      targets.push({ target_type: 'INTERNSHIP_TYPE', internshipTypeId: internshipType.id, is_inclusive: true });
    }
  }

  for (const label of targeting.classes) {
    const classGroup = findClassByLabel(label, catalog, lang);
    if (classGroup) {
      targets.push({ target_type: 'CLASS_GROUP', classGroupId: classGroup.id, is_inclusive: true });
    }
  }

  return targets;
}

export function mapAnnouncementTargetsToTargetingRules(
  targets: AnnouncementTargetPayload[] | undefined,
  catalog: AcademicStructureCatalog | null,
  lang: string,
): TargetingRules {
  const out = createEmptyTargetingRules();
  if (!targets?.length || !catalog) return out;

  for (const target of targets) {
    if (target.target_type === 'FILIERE' && target.filiereId) {
      const filiere = catalog.filieres.find((f) => f.id === target.filiereId);
      if (filiere) out.programs.push(labelForFiliere(filiere, lang));
    } else if (
      (target.target_type === 'ACADEMIC_LEVEL' || target.target_type === 'LEVEL')
      && target.academicLevelId
    ) {
      const level = catalog.levels.find((l) => l.id === target.academicLevelId);
      if (level) out.levels.push(labelForLevel(level, lang));
    } else if (target.target_type === 'CLASS_GROUP' && target.classGroupId) {
      const classGroup = catalog.classGroups.find((c) => c.id === target.classGroupId);
      if (classGroup) out.classes.push(labelForClass(classGroup, lang));
    } else if (target.target_type === 'INTERNSHIP_TYPE' && target.internshipTypeId) {
      const internshipType = catalog.internshipTypes.find((t) => t.id === target.internshipTypeId);
      if (internshipType) out.internshipTypes.push(labelForInternshipType(internshipType, lang));
    }
  }

  out.programs = [...new Set(out.programs)];
  out.levels = [...new Set(out.levels)];
  out.classes = [...new Set(out.classes)];
  out.internshipTypes = [...new Set(out.internshipTypes)];
  return out;
}
