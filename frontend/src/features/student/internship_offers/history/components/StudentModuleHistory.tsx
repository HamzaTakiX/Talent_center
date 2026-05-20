import { FunctionComponent } from 'react';
import AdminModuleHistory from '../../../../admin/shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryFilterConfig } from '../../../../admin/shared/admin-module-history/adminHistoryTypes';
import StudentLayout from '../../../components/StudentLayout';
import { mapStudentHistoryRow, type StudentHistoryRowInput } from '../../../utils/studentHistoryMap';
import type { HistoryFilterConfig, HistoryRowDisplay } from '../types';

export interface StudentModuleHistoryProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: readonly [HistoryFilterConfig, HistoryFilterConfig];
  rows: HistoryRowDisplay[];
  emptyMessage?: string;
}

function toAdminRow(row: HistoryRowDisplay): StudentHistoryRowInput {
  return {
    id: row.id,
    glyph: row.glyph,
    badgeLabel: row.badgeLabel,
    circleVariant: row.circleVariant ?? 'neutral',
    actorName: row.actorName,
    headline: row.headline,
    metaLine: row.metaLine,
    date: row.date,
    time: row.time,
  };
}

/** Historique module étudiant — UI admin premium, shell StudentLayout. */
const StudentModuleHistory: FunctionComponent<StudentModuleHistoryProps> = ({
  searchValue,
  onSearchChange,
  filters,
  rows,
  emptyMessage,
}) => (
  <AdminModuleHistory
    Layout={StudentLayout}
    searchValue={searchValue}
    onSearchChange={onSearchChange}
    filters={filters as unknown as readonly [AdminHistoryFilterConfig, AdminHistoryFilterConfig]}
    rows={rows.map((r) => mapStudentHistoryRow(toAdminRow(r)))}
    emptyMessage={emptyMessage}
  />
);

export default StudentModuleHistory;
