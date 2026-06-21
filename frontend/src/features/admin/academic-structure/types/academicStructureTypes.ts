export type AcademicStructureTab =
  | 'tracks'
  | 'levels'
  | 'classes'
  | 'internship-framework'
  | 'work-modes'
  | 'archived';

export type ArchivedEntityKind =
  | 'FILIERE'
  | 'ACADEMIC_LEVEL'
  | 'CLASS_GROUP'
  | 'INTERNSHIP_TYPE'
  | 'WORK_MODE';

export interface ArchivedEntityRow {
  kind: ArchivedEntityKind;
  id: number;
  name: string;
  code?: string;
  context?: string;
  detail?: string;
}

export interface AcademicTrackRow {
  id: number;
  code: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  description?: string;
  program_family: string;
  sort_order: number;
  is_active: boolean;
  is_archived: boolean;
}

export interface AcademicLevelRow {
  id: number;
  code: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  filiere_id: number;
  filiere_code?: string;
  filiere_name?: string;
  year_number: number;
  sort_order: number;
  is_active: boolean;
  is_archived: boolean;
}

export interface AcademicClassRow {
  id: number;
  code: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  filiere: number;
  filiere_id?: number;
  filiere_code?: string;
  filiere_name?: string;
  academic_level_id?: number | null;
  academic_level_label?: string;
  academic_year: string;
  is_active: boolean;
  is_archived: boolean;
}

export interface InternshipFrameworkRow {
  id: number;
  code: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  filiere_id: number;
  filiere_code?: string;
  filiere_name?: string;
  academic_level_id: number;
  level_code?: string;
  level_name?: string;
  duration_hint: string;
  sort_order: number;
  is_active: boolean;
  is_archived: boolean;
}

export interface WorkModeRow {
  id: number;
  code: string;
  name: string;
  name_fr?: string;
  name_en?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  is_archived: boolean;
}

export interface ImpactSummary {
  students: number;
  offers: number;
  applications: number;
  announcements: number;
  meetings: number;
  documents: number;
  total: number;
}

export interface AuditLogEntry {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_label: string;
  action: string;
  actor_email: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  summary: string;
  created_at: string;
}
