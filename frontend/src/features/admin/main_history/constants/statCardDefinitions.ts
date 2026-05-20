import type { HistoryStatItem } from '../types';

/** KPI card layout only — values filled from API `module_stats`. */
export const HISTORY_STAT_CARD_DEFINITIONS: Omit<HistoryStatItem, 'value'>[] = [
  { key: 'total_actions', label: 'Total Actions', icon: 'activity', colorClassName: 'bg-[#eaf1ff] text-[#2563eb]' },
  { key: 'students', label: 'Students', icon: 'graduation', colorClassName: 'bg-[#f4ebff] text-[#9333ea]' },
  { key: 'admins', label: 'Admins', icon: 'shield', colorClassName: 'bg-[#e7f6ec] text-[#16a34a]' },
  { key: 'encadrants', label: 'Encadrants', icon: 'users', colorClassName: 'bg-[#ede9fe] text-[#4f46e5]' },
  { key: 'internship_offers', label: 'Internship Offers', icon: 'briefcase', colorClassName: 'bg-[#e0f2fe] text-[#0891b2]' },
  { key: 'applications', label: 'Applications', icon: 'activity', colorClassName: 'bg-[#fff3e8] text-[#ea580c]' },
  { key: 'announcements', label: 'Announcements', icon: 'message', colorClassName: 'bg-[#fce7f3] text-[#db2777]' },
  { key: 'documents', label: 'Documents', icon: 'file', colorClassName: 'bg-[#fef3c7] text-[#ca8a04]' },
  { key: 'srf', label: 'SRF', icon: 'receipt', colorClassName: 'bg-[#fee2e2] text-[#dc2626]' },
  { key: 'chat', label: 'Chat', icon: 'message', colorClassName: 'bg-[#dcfdf3] text-[#0f9f86]' },
  { key: 'reports', label: 'Reports', icon: 'file', colorClassName: 'bg-[#ede9fe] text-[#7c3aed]' },
  { key: 'tasks', label: 'Tasks', icon: 'activity', colorClassName: 'bg-[#ecfccb] text-[#65a30d]' },
  { key: 'meetings', label: 'Meetings', icon: 'message', colorClassName: 'bg-[#f5d0fe] text-[#c026d3]' },
];
