import type { HistoryStatItem } from '../types';

export type ModuleAuditKey =
  | 'internship_offers'
  | 'documents'
  | 'meetings'
  | 'announcements'
  | 'chat'
  | 'applications'
  | 'srf'
  | 'reports'
  | 'tasks'
  | 'encadrants'
  | 'students'
  | 'admins';

const card = (
  key: string,
  label: string,
  icon: HistoryStatItem['icon'] = 'activity',
  colorClassName = 'bg-[#eaf1ff] text-[#2563eb]',
): Omit<HistoryStatItem, 'value'> => ({ key, label, icon, colorClassName });

export const MODULE_AUDIT_CARD_DEFINITIONS: Record<ModuleAuditKey, Omit<HistoryStatItem, 'value'>[]> = {
  internship_offers: [
    card('offers_created', 'Offers Created', 'briefcase', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('offers_published', 'Offers Published', 'activity', 'bg-[#e7f6ec] text-[#059669]'),
    card('offers_archived', 'Offers Archived', 'file', 'bg-[#f3f4f6] text-[#6b7280]'),
    card('applications_received', 'Applications Received', 'activity', 'bg-[#fff3e8] text-[#ea580c]'),
    card('status_changes', 'Application Status Changes', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('external_imports', 'External Imports', 'file', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('expired_offers', 'Expired Offers', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('most_active_actor', 'Most Active Recruiter/Admin', 'users', 'bg-[#dcfdf3] text-[#0f9f86]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  documents: [
    card('documents_uploaded', 'Documents Uploaded', 'file', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('documents_validated', 'Documents Validated', 'activity', 'bg-[#e7f6ec] text-[#059669]'),
    card('documents_rejected', 'Documents Rejected', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('corrections_requested', 'Corrections Requested', 'activity', 'bg-[#fff3e8] text-[#ea580c]'),
    card('deadlines_modified', 'Deadlines Modified', 'activity', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('most_active_actor', 'Most Active Reviewer', 'users', 'bg-[#dcfdf3] text-[#0f9f86]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  meetings: [
    card('meetings_created', 'Meetings Created', 'activity', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('meetings_rescheduled', 'Meetings Rescheduled', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('meetings_cancelled', 'Meetings Cancelled', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('reports_submitted', 'Reports Submitted', 'file', 'bg-[#e7f6ec] text-[#059669]'),
    card('tasks_generated', 'Tasks Created', 'activity', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  announcements: [
    card('announcements_published', 'Announcements Published', 'message', 'bg-[#e7f6ec] text-[#059669]'),
    card('announcements_updated', 'Announcements Updated', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('announcements_archived', 'Announcements Archived', 'file', 'bg-[#f3f4f6] text-[#6b7280]'),
    card('urgent_announcements', 'Urgent Announcements', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('targeted_campaigns', 'Targeted Campaigns', 'users', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  chat: [
    card('messages_sent', 'Messages Sent', 'message', 'bg-[#dcfdf3] text-[#0f9f86]'),
    card('channels_created', 'Channels Created', 'activity', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('channels_archived', 'Channels Archived', 'file', 'bg-[#f3f4f6] text-[#6b7280]'),
    card('moderation_actions', 'Moderation Actions', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('pinned_messages', 'Pinned Messages', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  applications: [
    card('assignments_executed', 'Assignments Executed', 'activity', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('status_changes', 'Status Changes', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('manual_reassignments', 'Manual Reassignments', 'users', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('conflicts_detected', 'Conflicts Detected', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  srf: [
    card('payments_validated', 'Payments Validated', 'receipt', 'bg-[#e7f6ec] text-[#059669]'),
    card('receipts_uploaded', 'Receipts Uploaded', 'file', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('receipts_rejected', 'Receipts Rejected', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('financial_alerts_sent', 'Financial Alerts Sent', 'activity', 'bg-[#fff3e8] text-[#ea580c]'),
    card('students_in_delay', 'Students In Delay', 'users', 'bg-[#fee2e2] text-[#b91c1c]'),
    card('financial_holds_created', 'Financial Holds Created', 'shield', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  reports: [
    card('reports_submitted', 'Reports Submitted', 'file', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('reports_validated', 'Reports Validated', 'activity', 'bg-[#e7f6ec] text-[#059669]'),
    card('reports_rejected', 'Reports Rejected', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  tasks: [
    card('tasks_created', 'Tasks Created', 'activity', 'bg-[#e0f2fe] text-[#0891b2]'),
    card('tasks_completed', 'Tasks Completed', 'activity', 'bg-[#e7f6ec] text-[#059669]'),
    card('tasks_assigned', 'Tasks Assigned', 'users', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  encadrants: [
    card('profiles_updated', 'Profiles Updated', 'users', 'bg-[#ede9fe] text-[#7c3aed]'),
    card('assignments_changed', 'Assignments Changed', 'activity', 'bg-[#fef3c7] text-[#ca8a04]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  students: [
    card('profile_updates', 'Profile Updates', 'graduation', 'bg-[#f4ebff] text-[#9333ea]'),
    card('access_changes', 'Access Changes', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
  admins: [
    card('role_changes', 'Role Changes', 'shield', 'bg-[#fee2e2] text-[#dc2626]'),
    card('permission_updates', 'Permission Updates', 'shield', 'bg-[#fff3e8] text-[#ea580c]'),
    card('login_events', 'Login Events', 'activity', 'bg-[#e7f6ec] text-[#059669]'),
    card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
  ],
};

export const STUDENT_AUDIT_CARD_DEFINITIONS: Omit<HistoryStatItem, 'value'>[] = [
  card('my_applications', 'My Applications', 'briefcase', 'bg-[#e0f2fe] text-[#0891b2]'),
  card('my_documents', 'My Documents', 'file', 'bg-[#fef3c7] text-[#ca8a04]'),
  card('my_meetings', 'My Meetings', 'activity', 'bg-[#ede9fe] text-[#7c3aed]'),
  card('my_interview_simulations', 'My Interview Simulations', 'activity', 'bg-[#f4ebff] text-[#9333ea]'),
  card('my_notifications', 'My Notifications', 'message', 'bg-[#dcfdf3] text-[#0f9f86]'),
  card('recent_activity', 'Recent Activity', 'activity', 'bg-[#eaf1ff] text-[#2563eb]'),
];
