import type { ReactNode } from 'react';
import type { AdminHistoryCircleVariant } from '../../admin/shared/admin-module-history/adminHistoryUi';
import {
  adminHistoryBadgeClass,
  adminHistoryCircleClass,
} from '../../admin/shared/admin-module-history/adminHistoryUi';
import type { AdminHistoryRowDisplay } from '../../admin/shared/admin-module-history/adminHistoryTypes';

export type StudentHistoryCircleVariant = AdminHistoryCircleVariant;

export interface StudentHistoryRowInput {
  id: string;
  glyph: ReactNode;
  badgeLabel: string;
  circleVariant: StudentHistoryCircleVariant;
  actorName: string;
  headline: string;
  metaLine: string;
  date: string;
  time: string;
}

/** Mappe une ligne historique étudiant vers le format admin (tokens + dark mode). */
export function mapStudentHistoryRow(row: StudentHistoryRowInput): AdminHistoryRowDisplay {
  return {
    id: row.id,
    glyph: row.glyph,
    badgeLabel: row.badgeLabel,
    badgeClassName: adminHistoryBadgeClass(row.circleVariant),
    circleBgClassName: adminHistoryCircleClass(row.circleVariant),
    circleVariant: row.circleVariant,
    actorName: row.actorName,
    headline: row.headline,
    metaLine: row.metaLine,
    date: row.date,
    time: row.time,
  };
}
