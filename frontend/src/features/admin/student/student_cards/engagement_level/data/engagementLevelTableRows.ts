export type EngagementBand = 'High' | 'Medium' | 'Low';

export interface EngagementLevelTableRow {
  id: string;
  name: string;
  classLevel: string;
  field: string;
  /** Score sur 10 */
  activityScore: number;
  engagementLevel: EngagementBand;
}

export const engagementLevelTableRows: EngagementLevelTableRow[] = [
  { id: 'e1', name: 'Sarah Alami', classLevel: 'Master 2', field: 'AI & Data Science', activityScore: 10.0, engagementLevel: 'High' },
  { id: 'e2', name: 'Youssef Benani', classLevel: 'Master 1', field: 'Software Engineering', activityScore: 9.5, engagementLevel: 'High' },
  { id: 'e3', name: 'Amina Khalil', classLevel: 'Master 2', field: 'Cybersecurity', activityScore: 9.2, engagementLevel: 'High' },
  { id: 'e4', name: 'Mohamed Idrissi', classLevel: 'Master 1', field: 'Business Intelligence', activityScore: 8.8, engagementLevel: 'High' },
  { id: 'e5', name: 'Fatima Zahra', classLevel: 'Master 2', field: 'AI & Data Science', activityScore: 8.4, engagementLevel: 'Medium' },
  { id: 'e6', name: 'Karim El Fassi', classLevel: 'Master 1', field: 'Software Engineering', activityScore: 8.0, engagementLevel: 'Medium' },
  { id: 'e7', name: 'Omar Benjelloun', classLevel: 'Master 2', field: 'Cloud Computing', activityScore: 7.6, engagementLevel: 'Medium' },
  { id: 'e8', name: 'Nadia Serraj', classLevel: 'Master 2', field: 'AI & Data Science', activityScore: 7.2, engagementLevel: 'Medium' },
  { id: 'e9', name: 'Hassan Tazi', classLevel: 'Master 1', field: 'DevOps', activityScore: 6.8, engagementLevel: 'Medium' },
  { id: 'e10', name: 'Salma Benkirane', classLevel: 'Master 2', field: 'Cybersecurity', activityScore: 6.2, engagementLevel: 'Low' },
  { id: 'e11', name: 'Zineb Fassi', classLevel: 'Master 2', field: 'Machine Learning', activityScore: 5.8, engagementLevel: 'Low' },
  { id: 'e12', name: 'Mehdi Lamrani', classLevel: 'Master 2', field: 'Business Intelligence', activityScore: 5.5, engagementLevel: 'Low' }
];
