export type AdminLanguage = 'fr' | 'en' | 'ar';

export interface AdminPreferences {
  language: AdminLanguage;
  notifications: {
    email: boolean;
    push: boolean;
    system: boolean;
    marketing: boolean;
  };
  compactMode: boolean;
  autoSave: boolean;
  dashboardPersonalization: boolean;
}

export interface AdminAccountMeta {
  lastLogin: string;
  accountStatus: 'active' | 'inactive';
  joinedDate: string;
  sessionsCount: number;
}

export interface ProfileFormState {
  fullName: string;
  email: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}
