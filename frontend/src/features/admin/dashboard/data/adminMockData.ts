export type DashboardStatId =
  | 'totalStudents'
  | 'totalEncadrants'
  | 'totalAdmins'
  | 'studentsWithoutInternship'
  | 'activeInternshipOffers'
  | 'ongoingApplications'
  | 'documentsPending'
  | 'studentsUnpaidSrf';

export type AlertPriority = 'High' | 'Medium';

/** When true, dashboard widgets use mock data instead of live API responses. */
export const USE_ADMIN_DASHBOARD_MOCK = true;

export const adminPlatformHealthMock = {
  health_score: 87,
  critical_alerts: 8,
  students_at_risk: 42,
  active_users: 892,
  risk_trend: [3, 5, 4, 6, 4],
  activity_trend: [65, 72, 68, 80, 75],
};

export const adminAlertMetricCounts = {
  unpaidSrf: 23,
  documentsPending: 45,
  noInternship: 156,
  offersExpiring: 12,
} as const;

export const STAT_ROUTES: Record<DashboardStatId, string> = {
  totalStudents: '/admin/dashboard/students',
  totalEncadrants: '/admin/dashboard/encadrants',
  totalAdmins: '/admin/dashboard/admins',
  studentsWithoutInternship: '/admin/students-without-internship',
  activeInternshipOffers: '/admin/active-internship-offers',
  ongoingApplications: '/admin/ongoing-applications',
  documentsPending: '/admin/documents-pending-validation',
  studentsUnpaidSrf: '/admin/students-unpaid-srf',
};

export const adminMockData = {
  stats: [
    { id: 'totalStudents' as const, value: '1,245', icon: 'Users' },
    { id: 'totalEncadrants' as const, value: '89', icon: 'UserCheck' },
    { id: 'totalAdmins' as const, value: '12', icon: 'Shield' },
    { id: 'studentsWithoutInternship' as const, value: '156', icon: 'AlertCircle' },
    { id: 'activeInternshipOffers' as const, value: '78', icon: 'Briefcase' },
    { id: 'ongoingApplications' as const, value: '342', icon: 'TrendingUp' },
    { id: 'documentsPending' as const, value: '45', icon: 'Clock' },
    { id: 'studentsUnpaidSrf' as const, value: '23', icon: 'DollarSign' },
  ],
  alerts: [
    { id: '1', messageKey: 'unpaidSrf', priority: 'High' as AlertPriority },
    { id: '2', messageKey: 'documentsPending', priority: 'Medium' as AlertPriority },
    { id: '3', messageKey: 'noInternship', priority: 'High' as AlertPriority },
    { id: '4', messageKey: 'offersExpiring', priority: 'Medium' as AlertPriority },
  ],
  recentActivity: [
    { id: '1', actionKey: 'newApplication', user: 'Sarah Alami', timeKey: 'minutesAgo', timeCount: 2 },
    { id: '2', actionKey: 'documentValidated', user: 'Admin Finance', timeKey: 'minutesAgo', timeCount: 15 },
    { id: '3', actionKey: 'announcementPublished', user: 'Admin Communication', timeKey: 'hoursAgo', timeCount: 1 },
    { id: '4', actionKey: 'profileUpdated', user: 'Youssef Benani', timeKey: 'hoursAgo', timeCount: 2 },
    { id: '5', actionKey: 'encadrantAssigned', user: 'Dr. Ahmed Bennani', timeKey: 'hoursAgo', timeCount: 3 },
  ],
  activityChart: {
    labels: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const,
    data: {
      applications: [45, 52, 38, 67, 71, 23, 18],
      documents: [32, 28, 41, 35, 29, 15, 12],
      announcements: [12, 8, 15, 10, 18, 5, 3],
      studentActivity: [89, 95, 78, 103, 88, 45, 34],
    },
  },
};
