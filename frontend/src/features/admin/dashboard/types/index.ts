// Admin types
// This file will contain TypeScript types for admin dashboard

export interface StatCard {
  label: string;
  value: string;
  icon: string;
}

export interface Alert {
  id: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
}

export interface MenuItem {
  label: string;
  icon: string;
  expandable: boolean;
  children?: string[];
}

export interface ActivityChart {
  labels: string[];
  data: {
    applications: number[];
    documents: number[];
    announcements: number[];
    studentActivity: number[];
  };
}
