/** Dashboard mock content (EN) — demo data shown on /student-dashboard */
export const studentDashboardMocksEn = {
  alerts: {
    '1': {
      message: "You haven't applied to any offers in the last 7 days",
      cta: 'View Offers',
    },
    '2': {
      message: 'New internship offers matching your profile',
      cta: 'View Now',
    },
    '3': {
      message: 'Your CV score improved to 82%',
      cta: 'View Details',
    },
  },
  offers: {
    o1: {
      title: 'Digital Marketing Intern',
      company: 'Maroc Telecom',
      location: 'Casablanca',
      tags: { marketing: 'Marketing', digital: 'Digital', strategy: 'Strategy' },
    },
    o2: {
      title: 'Business Analyst Intern',
      company: 'OCP Group',
      location: 'Casablanca',
      tags: { analytics: 'Analytics', business: 'Business', data: 'Data' },
    },
    o3: {
      title: 'Brand Management Intern',
      company: 'Coca-Cola Maroc',
      location: 'Casablanca',
      tags: { branding: 'Branding', marketing: 'Marketing', consumer: 'Consumer' },
    },
  },
  announcements: {
    a1: {
      title: 'Interview Invitation - Marketing Position',
      snippet: 'Congratulations! You have been selected for an interview...',
      company: 'Maroc Telecom',
      badge: 'Interview',
    },
    a2: {
      title: 'Application Status Update',
      snippet: 'Your application for Business Development Intern is under review...',
      company: 'OCP Group',
      badge: 'Pending',
    },
  },
  progress: {
    profile: 'Profile Completion',
    cv: 'CV Score',
    activity: 'Activity Level',
  },
  activity: {
    r1: { action: 'New message from Maroc Telecom HR Team', time: '2 hours ago' },
    r2: { action: 'Your application to OCP Group was viewed', time: '5 hours ago' },
    r3: { action: 'New interview announcement from Attijariwafa Bank', time: '1 day ago' },
  },
};
