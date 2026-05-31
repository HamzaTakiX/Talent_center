import { FunctionComponent, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  FileText,
  MessageCircleMore,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ADMIN_HISTORY_ICON_PROPS,
  type AdminHistoryCircleVariant,
} from '../../../admin/shared/admin-module-history/adminHistoryUi';
import AdminModuleHistory, {
  type AdminModuleHistoryLayoutProps,
} from '../../../admin/shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryFilterConfig } from '../../../admin/shared/admin-module-history/adminHistoryTypes';
import StudentLayout from '../../components/StudentLayout';
import { mapStudentHistoryRow } from '../../utils/studentHistoryMap';
import {
  STUDENT_HISTORY_MODULE_FILTER_ALL,
  STUDENT_HISTORY_MODULE_FILTER_KEYS,
  STUDENT_HISTORY_STATUS_FILTER_ALL,
  STUDENT_HISTORY_STATUS_FILTER_KEYS,
  STUDENT_HISTORY_STATUS_FILTER_MAP,
} from '../constants/historyConstants';
import {
  MAIN_HISTORY_PAGE_ROOT,
  MAIN_HISTORY_TIMELINE_PANEL,
} from '../constants/mainHistoryLayout';
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
    case 'internshipOffers':
    case 'myApplications':
      return <BriefcaseBusiness {...iconProps} />;
    case 'documents':
      return <FileText {...iconProps} />;
    case 'srf':
      return <DollarSign {...iconProps} />;
    case 'chat':
      return <MessageCircleMore {...iconProps} />;
    default:
      return <Users {...iconProps} />;
  }
}

const HistoryEmbedLayout: FunctionComponent<AdminModuleHistoryLayoutProps> = ({ children }) => (
  <section className={MAIN_HISTORY_TIMELINE_PANEL}>{children}</section>
);

const MainHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>(STUDENT_HISTORY_MODULE_FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<string>(STUDENT_HISTORY_STATUS_FILTER_ALL);

  const rowToAdmin = (row: StudentHistoryActionRow) => {
    const parts = row.timestamp.split(' • ');
    return mapStudentHistoryRow({
      id: row.id,
      glyph: glyphFor(row),
      badgeLabel: t(`student.mainHistory.statuses.${row.managementStatus}`),
      circleVariant: managementVariant(row.managementStatus),
      actorName: t(`student.mainHistory.modules.${row.module}`),
      headline: row.title,
      metaLine: row.detail,
      date: parts[0] ?? row.timestamp,
      time: parts[1] ?? '',
    });
  };

  const rows = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const statusKey =
      STUDENT_HISTORY_STATUS_FILTER_MAP[
        statusFilter as keyof typeof STUDENT_HISTORY_STATUS_FILTER_MAP
      ];

    return studentHistoryActionsMock
      .filter((row) => {
        if (moduleFilter !== STUDENT_HISTORY_MODULE_FILTER_ALL && row.module !== moduleFilter) {
          return false;
        }
        if (statusKey && row.managementStatus !== statusKey) return false;
        if (!normalizedQuery) return true;
        const moduleLabel = t(`student.mainHistory.modules.${row.module}`).toLowerCase();
        const statusLabel = t(`student.mainHistory.statuses.${row.managementStatus}`).toLowerCase();
        return [moduleLabel, statusLabel, row.title, row.detail, row.eventType, row.priority, row.timestamp]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .map(rowToAdmin);
  }, [moduleFilter, search, statusFilter, t]);

  const filters: readonly [AdminHistoryFilterConfig, AdminHistoryFilterConfig] = [
    {
      ariaLabel: t('student.mainHistory.filters.moduleAria'),
      placeholderOptionLabel: t('student.mainHistory.filters.allAreas'),
      value: moduleFilter,
      onChange: setModuleFilter,
      options: STUDENT_HISTORY_MODULE_FILTER_KEYS.filter((m) => m !== STUDENT_HISTORY_MODULE_FILTER_ALL).map(
        (m) => ({
          value: m,
          label: t(`student.mainHistory.modules.${m}`),
        }),
      ),
    },
    {
      ariaLabel: t('student.mainHistory.filters.statusAria'),
      placeholderOptionLabel: t('student.mainHistory.filters.allStatuses'),
      value: statusFilter,
      onChange: setStatusFilter,
      options: STUDENT_HISTORY_STATUS_FILTER_KEYS.filter((s) => s !== STUDENT_HISTORY_STATUS_FILTER_ALL).map(
        (s) => ({
          value: s,
          label: t(`student.mainHistory.statuses.${s}`),
        }),
      ),
    },
  ];

  return (
    <StudentLayout>
      <div id="student-main-history-root" className={MAIN_HISTORY_PAGE_ROOT}>
        <section aria-label={t('student.mainHistory.statsAria')} className="w-full min-w-0 max-w-full">
          <HistoryStatsGrid />
        </section>

        <section aria-label={t('student.mainHistory.timelineAria')} className="w-full min-w-0 max-w-full">
          <AdminModuleHistory
            Layout={HistoryEmbedLayout}
            embeddedInPanel
            searchValue={search}
            onSearchChange={setSearch}
            filters={filters}
            rows={rows}
            emptyMessage={t('student.mainHistory.empty')}
          />
        </section>
      </div>
    </StudentLayout>
  );
};

export default MainHistoryPage;
