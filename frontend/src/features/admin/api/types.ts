export type StudentAccountStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'ARCHIVED'
  | 'LOCKED';

export interface AdminStudentRow {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  account_status: StudentAccountStatus;
  auth_provider: string;
  platform_access_granted: boolean;
  sso_enabled: boolean;
  first_login_completed: boolean;
  is_active: boolean;
  program_major: string;
  filiere_code?: string;
  current_class: string;
  filiere_id: number | null;
  class_group_id: number | null;
  academic_level_id: number | null;
  academic_sector_id: number | null;
  internship_type_id: number | null;
  internship_type_name?: string;
  academic_year: string;
  student_number: string;
  identity_confirmed: boolean;
  profile_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  has_credential: boolean;
  risk_flags: string[];
  onboarding_percent: number;
  has_internship_assignment: boolean;
}

export interface FiliereOption {
  id: number;
  code: string;
  name: string;
  program_family?: string;
  department: string;
  is_active: boolean;
}

export interface SpecializationDomainOption {
  id: number;
  code: string;
  name: string;
  category: 'BUSINESS' | 'TECH';
  program_families?: string[];
  master_tracks?: string[];
}

/** API object or legacy slug code */
export type SpecializationDomainRef = string | SpecializationDomainOption;

export interface AcademicYearOption {
  id: number;
  code: string;
  label: string;
  start_year: number;
  end_year: number;
  is_current: boolean;
  is_active: boolean;
}

export interface AcademicLevelOption {
  id: number;
  code: string;
  name: string;
  filiere_id: number;
  filiere_code: string;
  year_number: number;
  has_sectors: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface AcademicSectorOption {
  id: number;
  code: string;
  name: string;
  academic_level_id: number;
  level_code: string;
  is_active: boolean;
}

export interface InternshipTypeOption {
  id: number;
  code: string;
  name: string;
  academic_level_id: number;
  academic_sector_id: number | null;
  duration_hint: string;
  is_active: boolean;
}

export interface ClassGroupOption {
  id: number;
  code: string;
  name: string;
  filiere: number;
  filiere_code: string;
  filiere_name: string;
  academic_year: string;
  academic_year_id?: number | null;
  level: string;
  academic_level_id?: number | null;
  academic_level_label?: string;
  academic_sector_id?: number | null;
  academic_sector_label?: string;
  student_capacity: number;
  is_active: boolean;
}

export interface AcademicHierarchyValue {
  filiereId: string;
  levelId: string;
  sectorId: string;
  internshipTypeId: string;
  academicYearId: string;
  academicYearCode: string;
  classGroupId: string;
}

export interface StudentImportError {
  row: number;
  email: string;
  message: string;
}

export interface StudentImportResult {
  import_log_id: number;
  total_rows: number;
  success_rows: number;
  error_rows: number;
  errors: StudentImportError[];
  status: string;
}

export type AdminBulkImportResult = StudentImportResult;

export interface CreateStudentPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  student_number?: string;
  filiere_id?: number | null;
  academic_level_id?: number | null;
  academic_sector_id?: number | null;
  internship_type_id?: number | null;
  class_group_id?: number | null;
  academic_year?: string;
  academic_year_id?: number | null;
  sso_enabled?: boolean;
  grant_access?: boolean;
}

export interface UpdateStudentAccessPayload {
  account_status?: StudentAccountStatus;
  platform_access_granted?: boolean;
  sso_enabled?: boolean;
  reason?: string;
}

export interface UpdateStudentAssignmentPayload {
  filiere_id?: number | null;
  academic_level_id?: number | null;
  academic_sector_id?: number | null;
  internship_type_id?: number | null;
  class_group_id?: number | null;
  academic_year?: string;
  academic_year_id?: number | null;
}

export interface PaginatedListMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StudentDashboardStats {
  total: number;
  active: number;
  inactive: number;
  without_internship: number;
  with_internship: number;
  engagement_percent: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export type AdminAccountStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'ARCHIVED'
  | 'LOCKED';

export type AdminRoleSlug =
  | 'super'
  | 'stage'
  | 'finance'
  | 'documents'
  | 'communication'
  | 'coordinator'
  | 'academic';

export type AdminPermissionKey =
  | 'manageInternshipOffers'
  | 'createAnnouncements'
  | 'financialOperations'
  | 'userManagement'
  | 'manageStudents'
  | 'validateDocuments'
  | 'accessReports'
  | 'platformSettings';

export interface AdminScopePayload {
  filiere_ids: number[];
  class_group_ids: number[];
  level_ids: number[];
  sector_ids: number[];
  levels: string[];
  academic_years: string[];
  filiere_labels: string[];
  class_group_labels: string[];
}

export interface AdminAdministratorRow {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  account_status: AdminAccountStatus;
  auth_provider: string;
  platform_access_granted: boolean;
  sso_enabled: boolean;
  first_login_completed: boolean;
  is_active: boolean;
  admin_level: string;
  is_admin_active: boolean;
  is_super_admin?: boolean;
  role_slugs: AdminRoleSlug[];
  permission_keys: AdminPermissionKey[];
  scopes: AdminScopePayload;
  last_login_at: string | null;
  onboarding_complete: boolean;
  created_at: string;
  notes?: string;
  permission_codes?: string[];
}

export interface CreateAdministratorPayload {
  full_name: string;
  email: string;
  role_slugs?: AdminRoleSlug[];
  permission_keys?: AdminPermissionKey[];
  filiere_ids?: number[];
  class_group_ids?: number[];
  levels?: string[];
  level_ids?: number[];
  sector_ids?: number[];
  academic_years?: string[];
  sso_enabled?: boolean;
  account_status?: AdminAccountStatus;
  admin_level?: string;
  grant_access?: boolean;
  notes?: string;
}

export interface UpdateAdministratorPayload {
  full_name?: string;
  email?: string;
  role_slugs?: AdminRoleSlug[];
  permission_keys?: AdminPermissionKey[];
  filiere_ids?: number[];
  class_group_ids?: number[];
  levels?: string[];
  level_ids?: number[];
  sector_ids?: number[];
  academic_years?: string[];
  sso_enabled?: boolean;
  account_status?: AdminAccountStatus;
  admin_level?: string;
  platform_access_granted?: boolean;
  is_active?: boolean;
  notes?: string;
  reason?: string;
}

export type SupervisionDomainKey =
  | 'web_development'
  | 'data_science'
  | 'cybersecurity'
  | 'ai'
  | 'cloud'
  | 'networking'
  | 'finance'
  | 'marketing'
  | 'commerce'
  | 'hr'
  | 'supply_chain';

export interface EncadrantScopePayload {
  filiere_ids: number[];
  class_group_ids: number[];
  level_ids: number[];
  sector_ids: number[];
  academic_years: string[];
  filiere_labels: string[];
  filiere_codes?: string[];
  class_group_labels: string[];
  level_labels: string[];
  sector_labels: string[];
  scope_is_complete?: boolean;
  scope_gaps?: Array<
    'PROGRAMS' | 'LEVELS' | 'ACADEMIC_YEARS' | 'SUPERVISED_INTERNSHIP_TYPES'
  >;
}

export interface EncadrantScopeRepairResult {
  scanned: number;
  repaired: number;
  dry_run: boolean;
}

export interface AdminEncadrantRow {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  account_status: AdminAccountStatus;
  auth_provider: string;
  platform_access_granted: boolean;
  sso_enabled: boolean;
  first_login_completed: boolean;
  is_active: boolean;
  max_students: number;
  current_students: number;
  specialization_domains: SpecializationDomainRef[];
  supervised_internship_types?: InternshipTypeOption[];
  scopes: EncadrantScopePayload;
  is_encadrant_active: boolean;
  last_login_at: string | null;
  created_at: string;
  accepting_students?: boolean;
}

export interface CreateEncadrantPayload {
  full_name: string;
  email: string;
  filiere_ids?: number[];
  class_group_ids?: number[];
  level_ids?: number[];
  sector_ids?: number[];
  academic_years?: string[];
  specialization_domain_ids?: number[];
  supervised_internship_type_ids?: number[];
  max_students?: number;
  grant_access?: boolean;
  is_active?: boolean;
}

export interface UpdateEncadrantPayload {
  full_name?: string;
  email?: string;
  filiere_ids?: number[];
  class_group_ids?: number[];
  level_ids?: number[];
  sector_ids?: number[];
  academic_years?: string[];
  specialization_domain_ids?: number[];
  supervised_internship_type_ids?: number[];
  max_students?: number;
  platform_access_granted?: boolean;
  is_active?: boolean;
  account_status?: AdminAccountStatus;
  reason?: string;
}

export interface SmartAssignmentInternshipAnalytics {
  academic_year: string;
  /** Unique supervisors in the assignment pool (not summed per internship type). */
  total_unique_encadrants?: number;
  /** Sum of supervisors per type; exceeds unique count when one supervisor covers several types. */
  total_supervision_slots?: number;
  total_students_with_type?: number;
  official_internship_type_count?: number;
  excluded_non_official_students?: number;
  students_by_internship_type: {
    internship_type: string;
    internship_type_code?: string;
    count: number;
  }[];
  students_by_internship_category: { category: string; count: number }[];
  encadrants_by_internship_type: {
    internship_type: string;
    internship_type_code?: string;
    count: number;
  }[];
  unsupported_internship_categories: number;
  missing_internship_type_students: number;
  encadrants_without_supervised_types: number;
  uncovered_internship_types: {
    internship_type_id: number;
    internship_type_name: string;
    student_count: number;
  }[];
  assignment_distribution: {
    encadrant_profile_id: number;
    full_name: string;
    by_internship_type: Record<string, number>;
    total_assigned: number;
  }[];
}

export interface SmartAssignmentStudentRow {
  student_profile_id: number;
  user_id: number;
  full_name: string;
  email: string;
  filiere: string;
  filiere_code?: string;
  program_family?: string;
  level: string;
  class_name: string;
  sector: string;
  internship_type: string;
  internship_domain: string;
  internship_company: string;
  internship_status: string;
  academic_year: string;
  assignment_id?: number;
  match_score?: number | null;
  is_locked?: boolean;
  assignment_source?: string;
  reason?: string;
}

export interface SmartAssignmentEncadrantCard {
  encadrant_profile_id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialization_domains: SpecializationDomainRef[];
  current_load: number;
  max_capacity: number;
  load_percent: number;
  is_available: boolean;
  is_overloaded: boolean;
  students: SmartAssignmentStudentRow[];
}

export interface SmartAssignmentStats {
  total_eligible_students: number;
  total_assigned: number;
  unassigned_count: number;
  locked_assignments?: number;
  overloaded_encadrants: number;
  available_supervisors: number;
  specialization_match_rate?: number;
  assignment_accuracy?: number;
  applied_changes?: number;
}

export interface SmartAssignmentResultsPayload {
  academic_year: string;
  stats: SmartAssignmentStats;
  encadrants: SmartAssignmentEncadrantCard[];
  unassigned_students: SmartAssignmentStudentRow[];
  internship_analytics?: SmartAssignmentInternshipAnalytics;
}

export type SmartAssignmentSeverity = 'critical' | 'warning' | 'info';

export type SmartAssignmentAssignmentStrategy = 'full' | 'skip_assigned' | 'unassigned_only';

export interface SmartAssignmentValidationBriefStudent {
  student_profile_id: number;
  full_name: string;
  email: string;
  filiere?: string;
  level?: string;
  sector?: string;
  internship_type?: string;
  academic_year?: string;
}

export interface SmartAssignmentValidationBriefEncadrant {
  encadrant_profile_id: number;
  full_name: string;
  email: string;
  current_load?: number;
  max_capacity?: number;
  is_available?: boolean;
  is_active?: boolean;
  specialization_domains?: string[];
}

export interface SmartAssignmentValidationIssue {
  code: string;
  severity: SmartAssignmentSeverity;
  count: number;
  students: SmartAssignmentValidationBriefStudent[];
  encadrants: SmartAssignmentValidationBriefEncadrant[];
  metadata: Record<string, unknown>;
  recommendation_codes: string[];
}

export interface SmartAssignmentPrecheckResult {
  academic_year: string;
  can_run: boolean;
  has_blocking_errors: boolean;
  has_warnings: boolean;
  blocking_count: number;
  warning_count: number;
  issues: SmartAssignmentValidationIssue[];
  summary: {
    eligible_students: number;
    year_students: number;
    active_encadrants: number;
    already_assigned: number;
    missing_data_total: number;
  };
}

export interface SmartAssignmentRunPayload {
  academic_year?: string;
  excluded_student_ids?: number[];
  excluded_encadrant_ids?: number[];
  respect_locks?: boolean;
  assignment_strategy?: SmartAssignmentAssignmentStrategy;
  confirm_warnings?: boolean;
  skip_validation?: boolean;
}

export interface SmartAssignmentRuntimeAlert {
  code: string;
  severity: SmartAssignmentSeverity;
  count: number;
}

export interface SmartAssignmentEngineResult extends SmartAssignmentResultsPayload {
  dry_run: boolean;
  assignment_strategy?: SmartAssignmentAssignmentStrategy;
  runtime_alerts?: SmartAssignmentRuntimeAlert[];
  proposals?: Array<{
    student_profile_id: number;
    assignment_id: number;
    encadrant_profile_id: number;
    match_score: number;
    locked: boolean;
    changed: boolean;
  }>;
}

export interface BulkDeleteUsersResult {
  deleted_ids: number[];
  failed: Array<{ id: number; reason: string }>;
}

export type { ApiEnvelope };
