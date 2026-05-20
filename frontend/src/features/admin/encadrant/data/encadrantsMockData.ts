import type { LucideIcon } from 'lucide-react';
import { User, Users, FileEdit, Video } from 'lucide-react';

export interface EncadrantSummaryStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const encadrantsSummaryStats: EncadrantSummaryStat[] = [
  { label: 'Total Encadrants', value: 89, Icon: User, iconBgClass: 'bg-[#a855f7]' },
  { label: 'Assigned Students', value: 1245, Icon: Users, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Meetings', value: 156, Icon: Video, iconBgClass: 'bg-[#22c55e]' },
];

/** Cartes encadrants (hors rapports) — ordre = index navigation. */
export const ENCADRANT_CARD_ROUTES = [
  '/admin/encadrants/all',
  '/admin/encadrants/assigned-students',
  '/admin/encadrant/meetings',
] as const;

export interface EncadrantRow {
  name: string;
  department: string;
  studentsAssigned: number;
  reportsInProgress: number;
}

export const encadrantsMockRows: EncadrantRow[] = [
  { name: 'Dr. Ahmed Bennani', department: 'Computer Science', studentsAssigned: 15, reportsInProgress: 8 },
  { name: 'Pr. Fatima El Amrani', department: 'AI & Data Science', studentsAssigned: 12, reportsInProgress: 5 },
  { name: 'Dr. Youssef Idrissi', department: 'Software Engineering', studentsAssigned: 18, reportsInProgress: 12 },
  { name: 'Dr. Amina Khalil', department: 'Networks & Security', studentsAssigned: 10, reportsInProgress: 6 },
  { name: 'Pr. Mohamed Tazi', department: 'Business Intelligence', studentsAssigned: 14, reportsInProgress: 9 }
];
