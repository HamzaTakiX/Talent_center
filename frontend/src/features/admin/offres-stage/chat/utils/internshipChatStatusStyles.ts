import type { ApplicationStatusLabel } from '../types/internshipChatTypes';

export function applicationStatusPillClass(status: ApplicationStatusLabel): string {
  switch (status) {
    case 'Accepted':
    case 'Completed':
      return 'isi-status-pill isi-status-pill--success';
    case 'Rejected':
    case 'Withdrawn':
      return 'isi-status-pill isi-status-pill--danger';
    case 'Interview':
    case 'Shortlisted':
      return 'isi-status-pill isi-status-pill--warning';
    case 'Applied':
    case 'Under Review':
      return 'isi-status-pill isi-status-pill--info';
    default:
      return 'isi-status-pill isi-status-pill--neutral';
  }
}
