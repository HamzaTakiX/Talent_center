import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import HistoryTimelineList from '../../../admin/main_history/components/HistoryTimelineList';
import HistoryTimelineLoading from '../../../admin/main_history/components/HistoryTimelineLoading';
import HistoryEventDetailDrawer from '../../../admin/main_history/components/HistoryEventDetailDrawer';
import type { HistoryActionRow } from '../../../admin/main_history/types';
import {
  MAIN_HISTORY_PAGE_ROOT,
  MAIN_HISTORY_TIMELINE_PANEL,
} from '../constants/mainHistoryLayout';
import { useStudentHistory } from '../hooks/useStudentHistory';
import StudentHistoryStatsStrip from '../components/StudentHistoryStatsStrip';
import { AdminSearchEmptyState } from '../../../admin/ui';

const MainHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<HistoryActionRow | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
    }),
    [search],
  );

  const { rows, stats, statsLoading, timelineLoading, error } = useStudentHistory(filters);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      [row.title, row.actor, row.module, row.actionType].join(' ').toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <StudentLayout>
      <div id="student-main-history-root" className={`${MAIN_HISTORY_PAGE_ROOT} admin-audit-center`}>
        <section aria-label={t('student.mainHistory.statsAria')} className="w-full min-w-0 max-w-full">
          <StudentHistoryStatsStrip stats={stats} loading={statsLoading} />
        </section>

        <section
          aria-label={t('student.mainHistory.timelineAria')}
          className={`${MAIN_HISTORY_TIMELINE_PANEL} admin-history-page admin-history-page--panel admin-history-page--hero mt-4`}
        >
          <div className="border-b border-[var(--admin-border)] px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">
              {t('student.mainHistory.timelineTitle')}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--admin-text-secondary)]">
              {t('student.mainHistory.timelineSubtitle')}
            </p>
            <div className="mt-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('student.mainHistory.searchPlaceholder')}
                className="admin-search-field w-full max-w-md"
                aria-label={t('student.mainHistory.searchAria')}
              />
            </div>
          </div>

          <div className="admin-audit-timeline-body px-4 pb-5 pt-3 sm:px-6 sm:pb-6">
            {timelineLoading && rows.length === 0 ? (
              <HistoryTimelineLoading />
            ) : error ? (
              <AdminSearchEmptyState titleKey="student.mainHistory.loadError" />
            ) : (
              <HistoryTimelineList
                rows={filteredRows}
                onViewDetails={setSelectedRow}
                hideModuleBadge={false}
                emptyTitleKey="student.mainHistory.empty"
              />
            )}
          </div>
        </section>
      </div>

      <HistoryEventDetailDrawer
        row={selectedRow}
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
      />
    </StudentLayout>
  );
};

export default MainHistoryPage;
