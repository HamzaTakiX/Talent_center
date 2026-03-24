// import apiClient from '../../../shared/api/client';
import { AuthResponse, User, StudentProfile } from '../types';

// Mock user state stored in memory to simulate backend onboarding
let mockUser: User = {
  id: 1,
  email: 'student@esca.ma',
  role: 'student',
  student_profile: {
    first_name: 'Sarah',
    last_name: 'Benali',
    date_of_birth: '2000-05-14',
    program_major: 'Software Engineering',
    current_class: 'Master 1',
    identity_confirmed: false,
    profile_completed: false
  }
};

export const authApi = {
  // To connect to the real backend, uncomment the apiClient calls and delete the Mock Promises
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      if (email && password) {
         resolve({ access: 'mock_jwt_token_123', user: JSON.parse(JSON.stringify(mockUser)) });
      } else {
         reject({ response: { data: { detail: 'Please provide valid credentials' } } });
      }
    }, 1000));
  },
  
  me: async (): Promise<User> => {
    return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUser))), 800));
  },

  confirmIdentity: async (data: Partial<StudentProfile>): Promise<User> => {
    mockUser.student_profile!.identity_confirmed = true;
    return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUser))), 1000));
  },

  completeProfile: async (formData: FormData): Promise<User> => {
    mockUser.student_profile!.profile_completed = true;
    return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUser))), 1500));
  }
};
