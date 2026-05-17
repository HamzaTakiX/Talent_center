export type ApplicationStatus = 'pending' | 'accepted';

export interface OngoingApplicationRow {
  student: string;
  offer: string;
  score: string;
  status: ApplicationStatus;
}

export const ONGOING_APPLICATIONS_COUNT = 342;

export const ongoingApplicationsMockRows: OngoingApplicationRow[] = [
  { student: 'Sarah Alami', offer: 'Développeur IA', score: '92%', status: 'pending' },
  { student: 'Youssef Benani', offer: 'Data Scientist', score: '88%', status: 'accepted' },
];
