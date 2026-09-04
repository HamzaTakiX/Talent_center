import type { DurationUnit } from '../utils/academicStructureDuration';

export type AcademicStructureFormMode = 'create' | 'edit' | 'duplicate';

export interface AcademicStructureFormValues {
  name_fr: string;
  name_en: string;
  code: string;
  description: string;
  program_family: string;
  sort_order: number;
  is_active: boolean;
  filiere_id: number;
  academic_level_id: number;
  academic_year: string;
  duration_value: number;
  duration_unit: DurationUnit;
  /** Business + tech domain ids linked to this program. */
  specialization_domain_ids: number[];
}

export type AcademicStructureSaveAction = 'save' | 'saveAndCreate';

export interface AcademicStructureFormSubmitPayload {
  values: Record<string, string | number | boolean | number[]>;
  action: AcademicStructureSaveAction;
}

export const DEFAULT_FORM_VALUES: AcademicStructureFormValues = {
  name_fr: '',
  name_en: '',
  code: '',
  description: '',
  program_family: 'PGE',
  sort_order: 0,
  is_active: true,
  filiere_id: 0,
  academic_level_id: 0,
  academic_year: '2025-2026',
  duration_value: 6,
  duration_unit: 'months',
  specialization_domain_ids: [],
};
