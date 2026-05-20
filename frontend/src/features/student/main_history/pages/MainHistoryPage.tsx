import { FunctionComponent, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  FileText,
  MessageCircleMore,
  Users,
} from 'lucide-react';
import {
  ADMIN_HISTORY_ICON_PROPS,
  type AdminHistoryCircleVariant,
} from '../../../admin/shared/admin-module-history/adminHistoryUi';
import AdminModuleHistory, {
  type AdminModuleHistoryLayoutProps,
} from '../../../admin/shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryFilterConfig } from '../../../admin/shared/admin-module-history/adminHistoryTypes';
import StudentLayout from '../../components/StudentLayout';
import { PLATFORM_PAGE_NARROW } from '../../../../design-system/platformTokens';
import { mapStudentHistoryRow } from '../../utils/studentHistoryMap';
import {
  STUDENT_HISTORY_MODULE_FILTER_OPTIONS,
  STUDENT_HISTORY_STATUS_FILTER_MAP,
  STUDENT_HISTORY_STATUS_FILTER_OPTIONS,
} from '../constants/historyConstants';
import { studentHistoryActionsMock } from '../data/historyMockData';
import HistoryStatsGrid from '../components/HistoryStatsGrid';
import type { StudentHistoryActionRow, StudentHistoryManagementStatus } from '../types';

function managementVariant(status: StudentHistoryManagementStatus): AdminHistoryCircleVariant {
  switch (status) {
    case 'accepted':
    case 'completed':
      return 'success';
    case 'declined':
      return 'danger';
    case 'in_review':
      return 'warning';
    case 'submitted':
      return 'info';
    default:
      return 'neutral';
  }
}

function glyphFor(row: StudentHistoryActionRow) {
  const iconProps = ADMIN_HISTORY_ICON_PROPS;
  switch (row.module) {
    case 'Internship Offers':
    case 'My Applications':
      return <BriefcaseBusiness {...iconProps} />;
    case 'Documents':
      return <FileText {...iconProps} />;
    case 'SRF (Finance)':
      return <DollarSign {...iconProps} />;
    case 'Chat':
      return <MessageCircleMore {...iconProps} />;
    default:
      return <Users {...iconProps} />;
  }
}

function rowToAdmin(row: StudentHistoryActionRow) {
  const parts = row.timestamp.split(' • ');
  return mapStudentHistoryRow({
    id: row.id,
    glyph: glyphFor(row),
    badgeLabel: row.managementStatus.replace('_', ' '),
    circleVariant: managementVariant(row.managementStatus),
    actorName: row.module,
    headline: row.title,
    metaLine: row.detail,
    date: parts[0] ?? row.timestamp,
    time: parts[1] ?? '',
  });
}

const HistoryEmbedLayout: FunctionComponent<AdminModuleHistoryLayoutProps> = ({ children }) => (
  <section className="admin-module-panel flex min-h-[min(70dvh,680px)] flex-col overflow-hidden !p-0">
    {children}
  </section>
);

const MainHistoryPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>(STUDENT_HISTORY_MODULE_FILTER_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState<string>(STUDENT_HISTORY_STATUS_FILTER_OPTIONS[0]);

  const rows = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const statusKey =
      STUDENT_HISTORY_STATUS_FILTER_MAP[
        statusFilter as keyof typeof STUDENT_HISTORY_STATUS_FILTER_MAP
      ];

    return studentHistoryActionsMock
      .filter((row) => {
        if (moduleFilter !== 'All Areas' && row.module !== moduleFilter) return false;
        if (statusKey && row.managementStatus !== statusKey) return false;
        if (!normalizedQuery) return true;
        return [
          row.module,
          row.title,
          row.detail,
          row.eventType,
          row.managementStatus,
          row.priority,
          row.timestamp,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .map(rowToAdmin);
  }, [moduleFilter, search, statusFilter]);

  const filters: readonly [AdminHistoryFilterConfig, AdminHistoryFilterConfig] = [
    {
      ariaLabel: 'Module',
      placeholderOptionLabel: 'All Areas',
      value: moduleFilter,
      onChange: setModuleFilter,
      options: STUDENT_HISTORY_MODULE_FILTER_OPTIONS.filter((m) => m !== 'All Areas').map((m) => ({
        value: m,
        label: m,
      })),
    },
    {
      ariaLabel: 'Status',
      placeholderOptionLabel: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: STUDENT_HISTORY_STATUS_FILTER_OPTIONS.filter((s) => s !== 'All Statuses').map(
        (s) => ({ value: s, label: s })
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className={`${PLATFORM_PAGE_NARROW} flex flex-col gap-4 sm:gap-6`}>
        <HistoryStatsGrid />
        <AdminModuleHistory
          Layout={HistoryEmbedLayout}
          searchValue={search}
          onSearchChange={setSearch}
          filters={filters}
          rows={rows}
          emptyMessage="No activity matches your filters."
        />
      </div>
    </StudentLayout>
  );
};

export default MainHistoryPage;
