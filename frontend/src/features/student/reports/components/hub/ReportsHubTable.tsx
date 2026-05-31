import { FunctionComponent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import type { ReportHubCategory, StudentReportSummary } from '../../types';

interface ReportsHubTableProps {
  reports: StudentReportSummary[];
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

const ReportsHubTable: FunctionComponent<ReportsHubTableProps> = ({ reports }) => {
  const { t } = useTranslation();
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

  return (
    <section className="sr-hub-panel sr-hub-table-panel">
      <header className="sr-hub-table__header">
        <div className="sr-hub-table__header-text">
          <h2 className="sr-hub-table__title">{t('student.reports.hub.allReports')}</h2>
          <p className="sr-hub-table__subtitle">
            {t('student.reports.hub.allReportsSub', { count: filtered.length })}
          </p>
        </div>
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
      </header>

      <div className="sr-hub-table__tabs" role="tablist">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={filter === tab}
            className={`sr-hub-table__tab ${filter === tab ? 'is-active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {t(`student.reports.hub.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className="sr-hub-table__wrap">
        <table className="sr-hub-table">
          <thead>
            <tr>
              <th>{t('student.reports.hub.colTitle')}</th>
              <th>{t('student.reports.hub.colStatus')}</th>
              <th className="hidden lg:table-cell">{t('student.reports.hub.colSupervisor')}</th>
              <th className="hidden md:table-cell">{t('student.reports.hub.colWords')}</th>
              <th>{t('student.reports.hub.colProgress')}</th>
              <th className="hidden sm:table-cell">{t('student.reports.hub.colUpdated')}</th>
              <th aria-label={t('student.reports.hub.colActions')} />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="sr-hub-table__row"
                >
                  <td>
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
                  <td className="hidden lg:table-cell sr-hub-table__muted">{report.supervisor}</td>
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
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="sr-hub-table__empty">{t('student.reports.hub.noResults')}</p>
        )}
      </div>
    </section>
  );
};

export default ReportsHubTable;
