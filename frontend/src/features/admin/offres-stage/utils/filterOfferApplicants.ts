import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import { mapApplicationStatusToUi } from '../../../shared/utils/stageMappers';
import type { StageApplication } from '../../../shared/types/stageTypes';
import type { OfferApplicationStatus } from '../types';
import { formatOfferDetailDate } from './offerDetailViewModel';

export type OfferApplicantStatusFilter = 'all' | OfferApplicationStatus;

export interface OfferApplicantTableRow {
  id: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string | null;
  classLabel: string;
  field: string;
  matchScore: number | null;
  status: OfferApplicationStatus;
  appliedAt: string;
  appliedAtLabel: string;
}

export function mapStageApplicationToTableRow(app: StageApplication): OfferApplicantTableRow {
  const studentName =
    app.student_name?.trim() || app.student_email.split('@')[0] || app.student_email;

  return {
    id: app.uuid,
    studentName,
    studentEmail: app.student_email,
    avatarUrl: resolveMediaUrl(app.student_avatar_url),
    classLabel: app.student_class?.trim() || '—',
    field: app.student_field?.trim() || '—',
    matchScore:
      app.match_score_at_apply != null ? Math.round(Number(app.match_score_at_apply)) : null,
    status: mapApplicationStatusToUi(app.status),
    appliedAt: app.applied_at,
    appliedAtLabel: formatOfferDetailDate(app.applied_at) || '—',
  };
}

export function filterOfferApplicantRows(
  rows: OfferApplicantTableRow[],
  options: { query: string; statusFilter: OfferApplicantStatusFilter },
): OfferApplicantTableRow[] {
  const q = options.query.trim().toLowerCase();

  return rows.filter((row) => {
    const matchStatus = options.statusFilter === 'all' || row.status === options.statusFilter;
    if (!q) return matchStatus;

    const matchQuery =
      row.studentName.toLowerCase().includes(q) ||
      row.studentEmail.toLowerCase().includes(q) ||
      row.classLabel.toLowerCase().includes(q) ||
      row.field.toLowerCase().includes(q);

    return matchStatus && matchQuery;
  });
}
