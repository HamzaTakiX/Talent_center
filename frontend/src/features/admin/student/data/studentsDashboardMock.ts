import type { LucideIcon } from 'lucide-react';
import { Users, CheckCircle, UserX, AlertTriangle, Briefcase, TrendingUp } from 'lucide-react';

export interface StudentDashboardStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
  /** Affichage ex. "82%" pour le dernier indicateur */
  valueSuffix?: string;
}

export const studentDashboardStats: StudentDashboardStat[] = [
  { label: 'Total Students', value: 1245, Icon: Users, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Active', value: 1156, Icon: CheckCircle, iconBgClass: 'bg-[#22c55e]' },
  { label: 'Inactive', value: 89, Icon: UserX, iconBgClass: 'bg-[#64748b]' },
  { label: 'Without Internship', value: 156, Icon: AlertTriangle, iconBgClass: 'bg-[#f97316]' },
  { label: 'With Internship', value: 1089, Icon: Briefcase, iconBgClass: 'bg-[#6366f1]' },
  { label: 'Engagement Level', value: 82, Icon: TrendingUp, iconBgClass: 'bg-[#a855f7]', valueSuffix: '%' }
];

export type InternshipStatus = 'Assigned' | 'None' | 'Searching';

export interface StudentDashboardRow {
  id: string;
  name: string;
  classLevel: string;
  field: string;
  internshipStatus: InternshipStatus;
  statusLabel: 'Active';
}

export const studentsDashboardRows: StudentDashboardRow[] = [
  {
    id: '1',
    name: 'Sarah Alami',
    classLevel: 'Master 2',
    field: 'AI & Data Science',
    internshipStatus: 'Assigned',
    statusLabel: 'Active'
  },
  {
    id: '2',
    name: 'Youssef Benani',
    classLevel: 'Master 1',
    field: 'Software Engineering',
    internshipStatus: 'Searching',
    statusLabel: 'Active'
  },
  {
    id: '3',
    name: 'Amina Khalil',
    classLevel: 'Master 2',
    field: 'Cybersecurity',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: '4',
    name: 'Mohamed Idrissi',
    classLevel: 'Master 1',
    field: 'Business Intelligence',
    internshipStatus: 'Assigned',
    statusLabel: 'Active'
  },
  {
    id: '5',
    name: 'Fatima Zahra',
    classLevel: 'Master 2',
    field: 'AI & Data Science',
    internshipStatus: 'Assigned',
    statusLabel: 'Active'
  },
  {
    id: '6',
    name: 'Karim El Fassi',
    classLevel: 'Master 1',
    field: 'Software Engineering',
    internshipStatus: 'None',
    statusLabel: 'Active'
  }
];
