import type { TargetingRules } from '../../admin/offres-stage/types/createOfferWorkflow';
import type { StageTargetingPreviewPayload, StageOfferTargetingRule } from '../types/stageTypes';

export type AssignTargetType = keyof TargetingRules;

export const ASSIGN_TARGET_TYPES: AssignTargetType[] = [
  'programs',
  'classes',
  'levels',
  'internshipTypes',
  'departments',
  'categories',
];

export function createEmptyTargetingRules(): TargetingRules {
  return {
    programs: [],
    classes: [],
    levels: [],
    departments: [],
    categories: [],
    internshipTypes: [],
  };
}

export function hasTargetingSelection(targeting: TargetingRules): boolean {
  return ASSIGN_TARGET_TYPES.some((key) => targeting[key].length > 0);
}

export function mapTargetingRulesToPayload(targeting: TargetingRules): StageTargetingPreviewPayload {
  return {
    programs: targeting.programs,
    classes: targeting.classes,
    levels: targeting.levels,
    departments: targeting.departments,
    categories: targeting.categories,
    internship_types: targeting.internshipTypes ?? [],
  };
}

export function mapBackendRulesToTargetingRules(
  rules: StageOfferTargetingRule[] | undefined,
): TargetingRules {
  const out = createEmptyTargetingRules();
  if (!rules?.length) return out;

  for (const rule of rules) {
    const payload = rule.value_json ?? {};
    const labels = Array.isArray(payload.labels) ? payload.labels.map(String) : [];
    const levelCodes = Array.isArray(payload.level_codes) ? payload.level_codes.map(String) : [];
    const classCodes = Array.isArray(payload.class_codes) ? payload.class_codes.map(String) : [];
    const filiereCodes = Array.isArray(payload.filiere_codes) ? payload.filiere_codes.map(String) : [];
    const departments = Array.isArray(payload.departments) ? payload.departments.map(String) : [];
    const categories = Array.isArray(payload.categories) ? payload.categories.map(String) : [];
    const internshipTypeLabels = Array.isArray(payload.internship_type_labels)
      ? payload.internship_type_labels.map(String)
      : [];

    const internshipTypeCodes = Array.isArray(payload.internship_type_codes)
      ? payload.internship_type_codes.map(String)
      : [];
    const internshipTypeIds = Array.isArray(payload.internship_type_ids)
      ? payload.internship_type_ids.map(String)
      : [];

    if (rule.rule_type === 'FILIERE') {
      out.programs.push(...labels, ...filiereCodes);
    } else if (rule.rule_type === 'CLASS_GROUP') {
      out.classes.push(...labels, ...classCodes);
    } else if (rule.rule_type === 'LEVEL') {
      out.levels.push(...labels, ...levelCodes);
    } else if (rule.rule_type === 'INTERNSHIP_TYPE') {
      out.internshipTypes.push(...labels, ...internshipTypeLabels, ...internshipTypeCodes);
      void internshipTypeIds;
    } else if (rule.rule_type === 'CUSTOM') {
      out.departments.push(...departments);
      out.categories.push(...categories);
    }
  }

  for (const key of ASSIGN_TARGET_TYPES) {
    out[key] = [...new Set(out[key])];
  }
  return out;
}

export function countTargetingRecipients(targeting: TargetingRules): number {
  return ASSIGN_TARGET_TYPES.reduce((sum, key) => sum + targeting[key].length, 0);
}

export interface TargetingSelectionCounts {
  programs: number;
  classes: number;
  levels: number;
  internshipTypes: number;
  departments: number;
  categories: number;
}

export function getTargetingSelectionCounts(targeting: TargetingRules): TargetingSelectionCounts {
  return {
    programs: targeting.programs.length,
    classes: targeting.classes.length,
    levels: targeting.levels.length,
    internshipTypes: targeting.internshipTypes?.length ?? 0,
    departments: targeting.departments.length,
    categories: targeting.categories.length,
  };
}
