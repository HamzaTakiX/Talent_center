import { FunctionComponent, useMemo, useState } from 'react';
import { ClipboardList, Clock, History, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import { AdminPagination, AdminSearchEmptyState } from '../../ui';
import AdminSelectField from '../../ui/AdminSelectField';
import type { AuditLogEntry } from '../types/academicStructureTypes';

const PREFIX = 'admin.modules.academicStructure.audit';
const PAGE_SIZE = 5;

type AuditTimePreset = 'all' | '7d' | '30d' | '90d' | 'custom';

interface AcademicStructureAuditSectionProps {
  entries: AuditLogEntry[];
}

function resolveAdminDateLocale(language: string): string {
  if (language.startsWith('ar')) return 'ar-MA';
  if (language.startsWith('en')) return 'en-GB';
  return 'fr-FR';
}

function parseApiDate(iso: string): Date | null {
  if (!iso?.trim()) return null;
  const normalized = iso.replace(/(\.\d{3})\d+(?=[Z+-])/, '$1');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatAuditDate(iso: string, language: string): string {
  const date = parseApiDate(iso);
  if (!date) return iso;
  const locale = resolveAdminDateLocale(language);
  try {
    return date.toLocaleString(locale);
  } catch {
    try {
      return date.toLocaleString('en-GB');
    } catch {
      return iso;
    }
  }
}

function startOfLocalDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfLocalDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function filterEntriesByTime(
  entries: AuditLogEntry[],
  preset: AuditTimePreset,
  dateFrom: string,
  dateTo: string,
): AuditLogEntry[] {
  if (preset === 'all') return entries;

  const now = new Date();
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = now;

  if (preset === '7d') {
    rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 7);
  } else if (preset === '30d') {
    rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 30);
  } else if (preset === '90d') {
    rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 90);
  } else if (preset === 'custom') {
    if (!dateFrom && !dateTo) return entries;
    rangeStart = dateFrom ? startOfLocalDay(dateFrom) : null;
    rangeEnd = dateTo ? endOfLocalDay(dateTo) : now;
  }

  return entries.filter((entry) => {
    const at = parseApiDate(entry.created_at);
    if (!at) return false;
    if (rangeStart && at < rangeStart) return false;
    if (rangeEnd && at > rangeEnd) return false;
    return true;
  });
}

const AcademicStructureAuditSection: FunctionComponent<AcademicStructureAuditSectionProps> = ({
  entries,
}) => {
  const { t, i18n } = useTranslation();
  const [timePreset, setTimePreset] = useState<AuditTimePreset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const periodOptions = useMemo(
    () => [
      { value: 'all', label: t(`${PREFIX}.filters.periodAll`) },
      { value: '7d', label: t(`${PREFIX}.filters.period7d`) },
      { value: '30d', label: t(`${PREFIX}.filters.period30d`) },
      { value: '90d', label: t(`${PREFIX}.filters.period90d`) },
      { value: 'custom', label: t(`${PREFIX}.filters.periodCustom`) },
    ],
    [t],
  );

  const filteredEntries = useMemo(
    () => filterEntriesByTime(entries, timePreset, dateFrom, dateTo),
    [entries, timePreset, dateFrom, dateTo],
  );

  const { page, setPage, paginatedItems, totalItems, totalPages } = useAdminPagination(
    filteredEntries,
    PAGE_SIZE,
  );

  const hasActiveFilters =
    timePreset === 'custom' ? Boolean(dateFrom || dateTo) : timePreset !== 'all';

  const clearFilters = () => {
    setTimePreset('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const showEmpty = entries.length === 0;
  const showNoFilterResults = !showEmpty && filteredEntries.length === 0;

  return (
    <section className="academic-structure-audit" aria-labelledby="academic-structure-audit-title">
      <header className="academic-structure-audit__header">
        <span className="academic-structure-audit__icon" aria-hidden>
          <ClipboardList className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 id="academic-structure-audit-title" className="text-base font-semibold text-[var(--admin-text)]">
            {t(`${PREFIX}.title`)}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.subtitle`)}</p>
        </div>
      </header>

      {!showEmpty ? (
        <div className="academic-structure-audit__filters" aria-label={t(`${PREFIX}.filters.ariaLabel`)}>
          <AdminSelectField
            aria-label={t(`${PREFIX}.filters.periodLabel`)}
            value={timePreset}
            onChange={(value) => {
              setTimePreset(value as AuditTimePreset);
              setPage(1);
            }}
            options={periodOptions}
            wrapperClassName="academic-structure-audit__period"
          />
          {timePreset === 'custom' ? (
            <>
              <label className="academic-structure-audit__date">
                <span className="academic-structure-audit__date-label">{t(`${PREFIX}.filters.dateFrom`)}</span>
                <input
                  type="date"
                  className="admin-search-field w-full"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label className="academic-structure-audit__date">
                <span className="academic-structure-audit__date-label">{t(`${PREFIX}.filters.dateTo`)}</span>
                <input
                  type="date"
                  className="admin-search-field w-full"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
            </>
          ) : null}
          {hasActiveFilters ? (
            <button type="button" className="academic-structure-audit__clear" onClick={clearFilters}>
              <X className="h-4 w-4" aria-hidden />
              {t(`${PREFIX}.filters.clear`)}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="academic-structure-audit__body">
        {showEmpty ? (
          <div className="academic-structure-audit__empty">
            <AdminSearchEmptyState
              variant="panel"
              titleKey={`${PREFIX}.emptyTitle`}
              descriptionKey={`${PREFIX}.emptyDescription`}
              icon={<Clock className="h-6 w-6" strokeWidth={1.75} aria-hidden />}
            />
          </div>
        ) : showNoFilterResults ? (
          <div className="academic-structure-audit__empty">
            <AdminSearchEmptyState
              variant="panel"
              titleKey={`${PREFIX}.noFilterResults`}
              descriptionKey={`${PREFIX}.noFilterResultsDescription`}
              icon={<Clock className="h-6 w-6" strokeWidth={1.75} aria-hidden />}
            />
          </div>
        ) : (
          <>
            <ol className="academic-structure-audit__timeline">
              {paginatedItems.map((entry) => (
                <li key={entry.id} className="academic-structure-audit__item">
                  <div className="academic-structure-audit__marker-col">
                    <span
                      className="academic-structure-audit__marker admin-history-circle admin-history-circle--info ring-2 ring-[var(--admin-bg-elevated)]"
                      aria-hidden
                    >
                      <History className="admin-history-circle__icon h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                  <article className="academic-structure-audit__card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--admin-text)]">{entry.summary}</p>
                      <time
                        className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]"
                        dateTime={entry.created_at}
                      >
                        {formatAuditDate(entry.created_at, i18n.language)}
                      </time>
                    </div>
                    {entry.entity_label ? (
                      <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{entry.entity_label}</p>
                    ) : null}
                    {entry.actor_email ? (
                      <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{entry.actor_email}</p>
                    ) : null}
                  </article>
                </li>
              ))}
            </ol>
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel={t(`${PREFIX}.paginationLabel`)}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default AcademicStructureAuditSection;
