import { FunctionComponent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Files, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AdminPagination from '../../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../../admin/shared/hooks/useAdminPagination';
import { TASK_ASSIGNEE_PROFILES } from '../../../Encadrant/task/data/taskAssignees';
import { studentReportEditorPath } from '../../constants/routes';
import { REPORTS_HUB_TABLE_PAGE_SIZE, REPORTS_HUB_TABLE_SKELETON_ROWS } from '../../constants/limits';
import type { ReportHubCategory, StudentReportSummary } from '../../types';
import ReportsHubSkeletonBlock from './ReportsHubSkeletonBlock';

function resolveSupervisorAvatar(name: string): { url: string; initials: string } | null {
  const label = name.trim();
  if (!label || label === '—' || label === '-') return null;
  if (/leila|mansouri/i.test(label)) {
    return { url: TASK_ASSIGNEE_PROFILES.admin.avatarUrl, initials: 'LM' };
  }
  return { url: TASK_ASSIGNEE_PROFILES.bennani.avatarUrl, initials: 'AB' };
}

const ReportSupervisorCell: FunctionComponent<{ name: string }> = ({ name }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const avatar = resolveSupervisorAvatar(name);

  if (!avatar) {
    return <span className="sr-hub-table__muted">{name}</span>;
  }

  return (
    <span className="sr-hub-table__supervisor">
      {imageFailed ? (
        <span className="sr-hub-table__supervisor-fallback" aria-hidden>
          {avatar.initials}
        </span>
      ) : (
        <img
          src={avatar.url}
          alt=""
          className="sr-hub-table__supervisor-photo"
          onError={() => setImageFailed(true)}
        />
      )}
      <span className="sr-hub-table__supervisor-name">{name}</span>
    </span>
  );
};

interface ReportsHubTableProps {
  reports: StudentReportSummary[];
  loading?: boolean;
}

type FilterTab = 'all' | ReportHubCategory;

const FILTER_TABS: FilterTab[] = ['all', 'my', 'drafts', 'submitted', 'templates', 'archived'];

const statusClassMap: Record<string, string> = {
  draft: 'sr-hub-table__status--draft',
  submitted: 'sr-hub-table__status--submitted',
  under_review: 'sr-hub-table__status--review',
  needs_revision: 'sr-hub-table__status--revision',
  approved: 'sr-hub-table__status--approved',
  rejected: 'sr-hub-table__status--rejected',
};

const ReportsHubTable: FunctionComponent<ReportsHubTableProps> = ({
  reports,
  loading = false,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t('student.reports.hub.loading', { defaultValue: 'Chargement…' });
  const [filter, setFilter] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = reports;
    if (filter !== 'all') list = list.filter((r) => r.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.supervisor.toLowerCase().includes(q),
      );
    }
    return list;
  }, [reports, filter, query]);

  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } =
    useAdminPagination(filtered, REPORTS_HUB_TABLE_PAGE_SIZE);

  return (
    <section
      className="sr-hub-panel sr-hub-table-panel"
      aria-busy={loading || undefined}
    >
      <header className="sr-hub-table__header">
        <div className="sr-hub-table__header-text">
          <span className="sr-hub-table__header-icon" aria-hidden>
            <Files className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h2 className="sr-hub-table__title">{t('student.reports.hub.allReports')}</h2>
            {loading ? (
              <ReportsHubSkeletonBlock className="mt-1.5 h-3.5 w-32" />
            ) : (
              <p className="sr-hub-table__subtitle">
                {t('student.reports.hub.allReportsSub', { count: filtered.length })}
              </p>
            )}
          </div>
        </div>
        {loading ? (
          <ReportsHubSkeletonBlock className="h-10 w-full max-w-[320px] rounded-[0.625rem]" />
        ) : (
          <label className="sr-hub-table__search">
            <Search className="sr-hub-table__search-icon" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('student.reports.hub.searchReports')}
              className="sr-hub-table__search-input"
              aria-label={t('student.reports.hub.searchReports')}
            />
          </label>
        )}
      </header>

      <div className="sr-hub-table__tabs-wrap">
        {loading ? (
          <div className="sr-hub-table__tabs-skeleton" aria-hidden>
            {FILTER_TABS.map((tab) => (
              <ReportsHubSkeletonBlock key={tab} className="h-8 w-[4.5rem] rounded-lg" />
            ))}
          </div>
        ) : (
          <nav
            className="ofative-view-switch"
            role="tablist"
            aria-label={t('student.reports.hub.allReports')}
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                className={`ofative-view-switch__btn${filter === tab ? ' is-active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {t(`student.reports.hub.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="sr-hub-table__wrap">
        <table className="sr-hub-table">
          <thead>
            <tr>
              <th className="sr-hub-table__col--title">{t('student.reports.hub.colTitle')}</th>
              <th>{t('student.reports.hub.colStatus')}</th>
              <th className="hidden lg:table-cell sr-hub-table__col--supervisor">{t('student.reports.hub.colSupervisor')}</th>
              <th className="hidden md:table-cell">{t('student.reports.hub.colWords')}</th>
              <th>{t('student.reports.hub.colProgress')}</th>
              <th className="hidden sm:table-cell">{t('student.reports.hub.colUpdated')}</th>
              <th aria-label={t('student.reports.hub.colActions')} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: REPORTS_HUB_TABLE_SKELETON_ROWS }, (_, i) => (
                <tr key={`sk-${i}`} className="sr-hub-table__row" aria-hidden>
                  <td className="sr-hub-table__col--title">
                    <ReportsHubSkeletonBlock className="h-4 w-[72%] max-w-[16rem]" />
                  </td>
                  <td>
                    <ReportsHubSkeletonBlock className="mx-auto h-5 w-[4.5rem] rounded-full" />
                  </td>
                  <td className="hidden lg:table-cell sr-hub-table__col--supervisor">
                    <span className="sr-hub-table__supervisor">
                      <ReportsHubSkeletonBlock className="h-[1.875rem] w-[1.875rem] shrink-0 rounded-full" />
                      <ReportsHubSkeletonBlock className="h-3.5 w-24" />
                    </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <ReportsHubSkeletonBlock className="mx-auto h-3.5 w-10" />
                  </td>
                  <td>
                    <div className="sr-hub-table__progress">
                      <ReportsHubSkeletonBlock className="h-1.5 flex-1 rounded-full" />
                      <ReportsHubSkeletonBlock className="h-3 w-8 shrink-0" />
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <ReportsHubSkeletonBlock className="mx-auto h-3.5 w-12" />
                  </td>
                  <td>
                    <ReportsHubSkeletonBlock className="mx-auto h-7 w-7 rounded-md" />
                  </td>
                </tr>
              ))
            ) : (
            <AnimatePresence mode="popLayout">
              {paginatedItems.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="sr-hub-table__row"
                >
                  <td className="sr-hub-table__col--title">
                    <Link to={studentReportEditorPath(report.id)} className="sr-hub-table__title-link">
                      <span className="sr-hub-table__title">{report.title}</span>
                      {report.isTemplate && (
                        <span className="sr-hub-table__tag">{t('student.reports.hub.template')}</span>
                      )}
                    </Link>
                  </td>
                  <td>
                    <span className={`sr-hub-table__status ${statusClassMap[report.status] ?? ''}`}>
                      {t(`student.reports.status.${report.status}`)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell sr-hub-table__col--supervisor">
                    <ReportSupervisorCell name={report.supervisor} />
                  </td>
                  <td className="hidden md:table-cell sr-hub-table__mono">{report.wordCount.toLocaleString()}</td>
                  <td>
                    <div className="sr-hub-table__progress">
                      <div className="sr-hub-table__progress-track">
                        <div className="sr-hub-table__progress-fill" style={{ width: `${report.progress}%` }} />
                      </div>
                      <span className="sr-hub-table__progress-label">{report.progress}%</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell sr-hub-table__muted">
                    {new Date(report.lastModified).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td>
                    <Link
                      to={studentReportEditorPath(report.id)}
                      className="sr-hub-table__action"
                      aria-label={t('student.reports.hub.openReport')}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            )}
          </tbody>
        </table>
        {loading ? (
          <span className="sr-only">{loadingLabel}</span>
        ) : filtered.length === 0 ? (
          <p className="sr-hub-table__empty">{t('student.reports.hub.noResults')}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="sr-hub-table__pagination-skeleton" aria-hidden>
          <ReportsHubSkeletonBlock className="h-4 w-28" />
          <ReportsHubSkeletonBlock className="h-8 w-36 rounded-lg" />
        </div>
      ) : (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel={t('student.reports.hub.paginationItems')}
        />
      )}
    </section>
  );
};

export default ReportsHubTable;
