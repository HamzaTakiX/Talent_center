export interface StudentProfile {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  program_major: string;
  current_class: string;
  linkedin_url?: string;
  professional_summary?: string;
  cv_file?: string;
  identity_confirmed: boolean;
  profile_completed: boolean;
}

export interface User {
  id: number;
  email: string;
  role: string;
  student_profile?: StudentProfile;
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
