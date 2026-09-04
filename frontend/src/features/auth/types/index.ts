export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string | null;
  gender?: string;
  avatar?: string | null;
  bio?: string;
  timezone?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentProfile {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  student_number?: string;
  program_major: string;
  current_class: string;
  /** FK id from API (`filiere` field) */
  filiere?: number | null;
  filiere_id?: number | null;
  /** FK id from API (`class_group` field) */
  class_group?: number | null;
  class_group_id?: number | null;
  academic_year?: string;
  academic_level?: number | null;
  academic_level_name?: string;
  academic_sector?: number | null;
  academic_sector_name?: string;
  internship_type?: number | null;
  internship_type_name?: string;
  internship_duration?: string;
  internship_category?: string;
  linkedin_url?: string;
  professional_summary?: string;
  cv_file?: string;
  career_objective?: string;
  skills?: string[];
  availability?: string;
  start_date?: string | null;
  city?: string;
  mobility?: string[];
  has_applied?: boolean | null;
  has_internship?: boolean;
  internship_status_acknowledged?: boolean;
  internship_company_name?: string;
  internship_specialization?: string;
  internship_company_city?: string;
  internship_stage_duration?: string;
  identity_confirmed: boolean;
  profile_completed: boolean;
}

export interface User {
  id: number;
  email: string;
  role: string;
  full_name?: string;
  account_status?: string;
  auth_provider?: string;
  platform_access_granted?: boolean;
  sso_enabled?: boolean;
  first_login_completed?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  profile?: UserProfile;
  student_profile?: StudentProfile;
  admin_level?: string;
  is_super_admin?: boolean;
  /** Backend RBAC codes from `GET /api/auth/me` (e.g. `internship.manage`). */
  role_codes?: string[];
  permission_codes?: string[];
}

export interface LoginSession {
  id: number;
  device_name: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  current: boolean;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}
